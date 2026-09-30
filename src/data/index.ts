import type { Book, Lesson, Masala, Track, TrackId, Unit } from "./types";
import { fiqhTrack } from "./tracks/fiqh";
import { usulTrack } from "./tracks/usul";
import { hadithTrack } from "./tracks/hadith";
import { mustalahTrack } from "./tracks/mustalah";
import { bayquniyya } from "./books/bayquniyya";
import { arbain } from "./books/arbain";
import { waraqat } from "./books/waraqat";
import { abuShuja } from "./books/abushuja";
import { akhdari } from "./books/akhdari";

export * from "./types";

export const tracks: Track[] = [fiqhTrack, usulTrack, hadithTrack, mustalahTrack];
export const books: Book[] = [arbain, bayquniyya, waraqat, akhdari, abuShuja];

export type LessonEntry = { lesson: Lesson; track: Track; unit: Unit; index: number };
export type MasalaEntry = { masala: Masala; book: Book; chapterTitle: string };

export const allLessons: LessonEntry[] = tracks.flatMap((track) =>
  track.units.flatMap((unit) => unit.lessons.map((lesson) => ({ lesson, track, unit, index: 0 }))),
).map((e, index) => ({ ...e, index }));

export const allMasail: MasalaEntry[] = books.flatMap((book) =>
  book.chapters.flatMap((ch) => ch.masail.map((masala) => ({ masala, book, chapterTitle: ch.title }))),
);

const lessonMap = new Map(allLessons.map((e) => [e.lesson.id, e]));
const masalaMap = new Map(allMasail.map((e) => [`${e.book.id}/${e.masala.id}`, e]));

export const getLesson = (id: string) => lessonMap.get(id);
export const getTrack = (id: string) => tracks.find((t) => t.id === id);
export const getBook = (id: string) => books.find((b) => b.id === id);
export const getMasala = (bookId: string, masalaId: string) => masalaMap.get(`${bookId}/${masalaId}`);
export const trackLessons = (id: TrackId) => allLessons.filter((e) => e.track.id === id);

export const trackMeta: Record<TrackId, { hue: string; glyph: string; short: string }> = {
  fiqh: { hue: "var(--c-fiqh)", glyph: "ف", short: "الفقه" },
  usul: { hue: "var(--c-usul)", glyph: "أ", short: "الأصول" },
  hadith: { hue: "var(--c-hadith)", glyph: "ح", short: "الحديث" },
  mustalah: { hue: "var(--c-mustalah)", glyph: "م", short: "المصطلح" },
};

/** البحث في الدروس والمسائل بتطبيع الحروف العربية وإزالة التشكيل. */
export function normalizeArabic(s: string): string {
  return s
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase();
}

export type SearchHit =
  | { kind: "lesson"; id: string; title: string; subtitle: string; snippet: string; href: string }
  | { kind: "masala"; id: string; title: string; subtitle: string; snippet: string; href: string };

function snippetAround(text: string, normText: string, q: string): string {
  const i = normText.indexOf(q);
  const plain = text.replace(/[*#|>]/g, "");
  if (i < 0) return plain.slice(0, 120);
  const start = Math.max(0, i - 50);
  return (start > 0 ? "…" : "") + plain.slice(start, start + 140) + "…";
}

export function search(query: string, limit = 40): SearchHit[] {
  const q = normalizeArabic(query.trim());
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];
  for (const { lesson, track } of allLessons) {
    const body = [lesson.title, lesson.summary, ...lesson.sections.map((s) => s.heading + " " + s.body)].join(" ");
    const nb = normalizeArabic(body);
    if (nb.includes(q)) {
      hits.push({
        kind: "lesson",
        id: lesson.id,
        title: lesson.title,
        subtitle: track.title,
        snippet: snippetAround(body, nb, q),
        href: `/lesson/${lesson.id}`,
      });
    }
  }
  for (const { masala, book } of allMasail) {
    const body = [masala.title, masala.matn, masala.sharh, ...(masala.fawaid ?? [])].join(" ");
    const nb = normalizeArabic(body);
    if (nb.includes(q)) {
      hits.push({
        kind: "masala",
        id: masala.id,
        title: masala.title,
        subtitle: book.title,
        snippet: snippetAround(body, nb, q),
        href: `/library/${book.id}#${masala.id}`,
      });
    }
  }
  return hits.slice(0, limit);
}
