import type { Book, Lesson, Masala, Track, TrackId, Unit, WingId } from "./types";
import { fiqhTrack } from "./tracks/fiqh";
import { usulTrack } from "./tracks/usul";
import { hadithTrack } from "./tracks/hadith";
import { mustalahTrack } from "./tracks/mustalah";
import { waraqat } from "./books/waraqat";
import { abuShuja } from "./books/abushuja";
import { akhdari } from "./books/akhdari";

export * from "./types";

export const tracks: Track[] = [fiqhTrack, usulTrack, mustalahTrack, hadithTrack];
export const books: Book[] = [akhdari, abuShuja, waraqat];

export type Wing = {
  id: WingId;
  title: string;
  short: string;
  tagline: string;
  description: string;
  glyph: string;
  hue: string;
  tracks: Track[];
  books: Book[];
};

/** جناحا الرواق: الفقه وأصوله، والحديث وعلومه — كلٌّ مستقل بمنهجه ومتونه */
export const wings: Record<WingId, Wing> = {
  fiqh: {
    id: "fiqh",
    title: "الفقه وأصوله",
    short: "الفقه",
    tagline: "فقه العبادات المقارن، ثم أصول الاستنباط",
    description: "يبدأ بمدخل إلى الفقه، ثم الطهارة والصلاة والزكاة والصيام والحج بأقوال المذاهب الأربعة وأدلتها، ثم أصول الفقه وقواعده.",
    glyph: "ف",
    hue: "var(--c-fiqh)",
    tracks: [fiqhTrack, usulTrack],
    books: [akhdari, abuShuja, waraqat],
  },
  hadith: {
    id: "hadith",
    title: "الحديث وعلومه",
    short: "الحديث",
    tagline: "شرح البيقونية بيتاً بيتاً، ثم الأربعين النووية كاملة",
    description: "يبدأ بعلم المصطلح من خلال شرح المنظومة البيقونية كاملة، ثم مدخل إلى السنة وتدوينها، ثم شرح الأحاديث الاثنين والأربعين.",
    glyph: "ح",
    hue: "var(--c-hadith)",
    tracks: [mustalahTrack, hadithTrack],
    books: [],
  },
};

export const wingList: Wing[] = [wings.fiqh, wings.hadith];

export type LessonEntry = {
  lesson: Lesson;
  track: Track;
  unit: Unit;
  /** الترتيب العام في التطبيق */
  index: number;
  /** الترتيب داخل الجناح (يبدأ من 0) */
  wingIndex: number;
  wingTotal: number;
};
export type MasalaEntry = { masala: Masala; book: Book; chapterTitle: string };

function buildEntries(): LessonEntry[] {
  const out: LessonEntry[] = [];
  for (const w of wingList) {
    const list = w.tracks.flatMap((track) => track.units.flatMap((unit) => unit.lessons.map((lesson) => ({ lesson, track, unit }))));
    list.forEach((e, i) => out.push({ ...e, index: out.length, wingIndex: i, wingTotal: list.length }));
  }
  return out;
}

export const allLessons: LessonEntry[] = buildEntries();

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
export const wingLessons = (id: WingId) => allLessons.filter((e) => e.track.wing === id);

/** أول درس لم يكتمل في الجناح، أو undefined إن اكتمل الجناح */
export const nextInWing = (id: WingId, done: Record<string, unknown>) => wingLessons(id).find((e) => !done[e.lesson.id]);

export const trackMeta: Record<TrackId, { hue: string; glyph: string; short: string }> = {
  fiqh: { hue: "var(--c-fiqh)", glyph: "ف", short: "الفقه" },
  usul: { hue: "var(--c-usul)", glyph: "أ", short: "الأصول" },
  hadith: { hue: "var(--c-hadith)", glyph: "ح", short: "الحديث" },
  mustalah: { hue: "var(--c-mustalah)", glyph: "م", short: "المصطلح" },
};

/** مجموعات المتون في جناح الحديث، مأخوذة من دروس المسارين */
export type MatnCollection = { id: string; title: string; author: string; kind: "verse" | "hadith"; items: { lessonId: string; title: string; text: string; source?: string }[] };

export const matnCollections: MatnCollection[] = [
  {
    id: "bayquniyya",
    title: "متن المنظومة البيقونية",
    author: "عمر بن محمد البيقوني",
    kind: "verse",
    items: trackLessons("mustalah")
      .filter((e) => e.lesson.matn?.kind === "verse")
      .map((e) => ({ lessonId: e.lesson.id, title: e.lesson.title, text: e.lesson.matn!.text, source: e.lesson.matn!.source })),
  },
  {
    id: "arbain",
    title: "متن الأربعين النووية",
    author: "يحيى بن شرف النووي",
    kind: "hadith",
    items: trackLessons("hadith")
      .filter((e) => e.lesson.matn?.kind === "hadith")
      .map((e) => ({ lessonId: e.lesson.id, title: e.lesson.title, text: e.lesson.matn!.text, source: e.lesson.matn!.source })),
  },
];

export const getCollection = (id: string) => matnCollections.find((c) => c.id === id);

/** البحث في الدروس والمسائل بتطبيع الحروف العربية وإزالة التشكيل. */
export function normalizeArabic(s: string): string {
  return s
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase();
}

export type SearchHit = { kind: "lesson" | "masala"; id: string; title: string; subtitle: string; snippet: string; href: string };

function snippetAround(text: string, normText: string, q: string): string {
  const i = normText.indexOf(q);
  const plain = text.replace(/[*#|>]/g, "");
  if (i < 0) return plain.slice(0, 120);
  const start = Math.max(0, i - 50);
  return (start > 0 ? "…" : "") + plain.slice(start, start + 140) + "…";
}

const lessonIndex = allLessons.map((e) => {
  const l = e.lesson;
  const body = [
    l.title,
    l.summary,
    l.matn?.text ?? "",
    ...(l.vocab ?? []).map((x) => `${x.term} ${x.meaning}`),
    ...l.sections.map((s) => s.heading + " " + s.body),
    ...(l.examples ?? []).map((x) => x.title + " " + x.body),
  ].join(" ");
  return { e, body, norm: normalizeArabic(body) };
});

const masalaIndex = allMasail.map((m) => {
  const body = [m.masala.title, m.masala.matn, m.masala.sharh, ...(m.masala.fawaid ?? [])].join(" ");
  return { m, body, norm: normalizeArabic(body) };
});

export function search(query: string, limit = 40): SearchHit[] {
  const q = normalizeArabic(query.trim());
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];
  for (const { e, body, norm } of lessonIndex) {
    if (norm.includes(q)) {
      hits.push({ kind: "lesson", id: e.lesson.id, title: e.lesson.title, subtitle: e.track.title, snippet: snippetAround(body, norm, q), href: `/lesson/${e.lesson.id}` });
    }
  }
  for (const { m, body, norm } of masalaIndex) {
    if (norm.includes(q)) {
      hits.push({ kind: "masala", id: m.masala.id, title: m.masala.title, subtitle: m.book.title, snippet: snippetAround(body, norm, q), href: `/library/${m.book.id}#${m.masala.id}` });
    }
  }
  return hits.slice(0, limit);
}
