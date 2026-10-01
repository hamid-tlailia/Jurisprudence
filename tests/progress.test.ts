import { describe, expect, it } from "vitest";
import { currentStreak, dayKey, evaluateBadges, initialProgress, levelFor, longestStreak, planProgress } from "../src/lib/progress";
import { allLessons, books, getMasala, matnCollections, nextInWing, search, tracks, wingLessons } from "../src/data";
import { plans } from "../src/data/plans";
import { buildContents, sanitize } from "../src/shared/ai-core";

const d = (s: string) => new Date(s + "T12:00:00");

describe("streaks", () => {
  it("counts consecutive days ending today or yesterday", () => {
    const act = { "2026-09-28": 10, "2026-09-29": 5, "2026-09-30": 3 };
    expect(currentStreak(act, d("2026-09-30"))).toBe(3);
    expect(currentStreak(act, d("2026-10-01"))).toBe(3);
    expect(currentStreak(act, d("2026-10-02"))).toBe(0);
  });
  it("finds the longest run across month boundaries", () => {
    expect(longestStreak({ "2026-08-30": 1, "2026-08-31": 1, "2026-09-01": 1, "2026-09-05": 1 })).toBe(3);
  });
  it("formats local day keys", () => expect(dayKey(d("2026-01-05"))).toBe("2026-01-05"));
});

describe("levels & badges", () => {
  it("maps xp to ranks", () => {
    expect(levelFor(0).level).toBe(1);
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(99999).next).toBeUndefined();
  });
  it("awards first-step once", () => {
    const s = { ...initialProgress, completedLessons: { f1: { at: "", score: 3, total: 3 } } };
    const r = evaluateBadges(s);
    expect(r.earned.map((b) => b.id)).toEqual(expect.arrayContaining(["first-step", "perfect-1"]));
    expect(evaluateBadges({ ...s, badges: r.badges }).earned).toHaveLength(0);
  });
});

describe("content integrity", () => {
  it("has unique lesson ids and valid quizzes", () => {
    const ids = allLessons.map((e) => e.lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { lesson } of allLessons) {
      expect(lesson.quiz.length, lesson.id).toBeGreaterThan(0);
      for (const q of lesson.quiz) expect(q.answer, `${lesson.id}: ${q.q}`).toBeLessThan(q.options.length);
      if (lesson.ref?.masalaId) expect(getMasala(lesson.ref.bookId, lesson.ref.masalaId), lesson.id).toBeTruthy();
    }
  });
  it("covers every Bayquniyya verse and all 42 hadiths", () => {
    const verses = matnCollections[0].items.flatMap((i) => i.text.split("\n")).filter((l) => !l.startsWith("..."));
    expect(verses).toHaveLength(34);
    expect(matnCollections[1].items).toHaveLength(42);
  });
  it("uses only Western digits in content", () => {
    const text = JSON.stringify(tracks) + JSON.stringify(books);
    expect(/[٠-٩]/.test(text)).toBe(false);
  });
  it("has unique masala ids per book", () => {
    for (const b of books) {
      const ids = b.chapters.flatMap((c) => c.masail.map((m) => m.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("plans reference existing content and have no empty days", () => {
    for (const p of plans) {
      expect(p.days.length, p.id).toBeGreaterThan(0);
      for (const day of p.days) {
        expect(day.length, p.id).toBeGreaterThan(0);
        for (const t of day) {
          if (t.type === "lesson") expect(allLessons.some((e) => e.lesson.id === t.id), t.id).toBe(true);
          else expect(getMasala(t.bookId, t.id), `${t.bookId}/${t.id}`).toBeTruthy();
        }
      }
    }
  });
  it("plan progress finishes when all tasks done", () => {
    const p = plans.find((x) => x.id === "light")!;
    const readMasail: Record<string, string> = {};
    p.days.flat().forEach((t) => t.type === "masala" && (readMasail[`${t.bookId}/${t.id}`] = "x"));
    expect(planProgress({ ...initialProgress, readMasail }, "light")!.finished).toBe(true);
  });
  it("orders each wing as a single path", () => {
    expect(wingLessons("fiqh")[0].lesson.id).toBe("f1");
    expect(wingLessons("hadith")[0].lesson.id).toBe("m1");
    expect(nextInWing("hadith", { m1: true })?.lesson.id).toBe("bq1");
    const h = wingLessons("hadith");
    expect(h.every((e, i) => e.wingIndex === i && e.wingTotal === h.length)).toBe(true);
  });
  it("search ignores diacritics and hamza forms", () => {
    expect(search("الاعمال").length).toBeGreaterThan(0);
    expect(search("الصَّحيح").length).toBeGreaterThan(0);
  });
});

describe("ai request shaping", () => {
  it("rejects malformed bodies", () => {
    expect(sanitize({ messages: [] })).toBeNull();
    expect(sanitize({ messages: [{ role: "assistant", content: "x" }] })).toBeNull();
    expect(sanitize({ messages: [{ role: "system", content: "x" }] })).toBeNull();
  });
  it("maps roles to Gemini and injects context only into the first user turn", () => {
    const req = sanitize({
      messages: [
        { role: "user", content: "سؤال" },
        { role: "assistant", content: "جواب" },
        { role: "user", content: "متابعة" },
      ],
      context: "نص المتن",
      mode: "expand",
    })!;
    const contents = buildContents(req);
    expect(contents.map((c) => c.role)).toEqual(["user", "model", "user"]);
    expect(contents[0].parts![0].text).toContain("نص المتن");
    expect(contents[0].parts![0].text).toContain("وسّع شرح");
    expect(contents[2].parts![0].text).toBe("متابعة");
  });
});
