import type { MakhrajId } from "./makharij";

export type Question = {
  q: string;
  options: string[];
  /** رقم الخيار الصحيح (يبدأ من 0) */
  answer: number;
  explain: string;
};

export type Section = { heading: string; body: string };

/** نص المتن المشروح في الدرس: بيت أو حديث أو فقرة */
export type Matn = { kind: "verse" | "hadith" | "prose"; text: string; source?: string };

export type Vocab = { term: string; meaning: string };
export type Example = { title: string; body: string };
/** تدريب مفتوح يُكشف جوابه */
export type Exercise = { q: string; a: string };

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  matn?: Matn;
  /** مخارج يُعرض لها رسم توضيحي في الدرس */
  makharij?: MakhrajId[];
  vocab?: Vocab[];
  sections: Section[];
  examples?: Example[];
  keyPoints: string[];
  exercises?: Exercise[];
  quiz: Question[];
  /** إحالة إلى موضع من المكتبة لمزيد القراءة */
  ref?: { bookId: string; masalaId?: string };
};

export type Unit = { id: string; title: string; lessons: Lesson[] };

export type WingId = "fiqh" | "hadith" | "quran";
export type TrackId = "fiqh" | "usul" | "hadith" | "mustalah" | "tajwid";

export type Track = {
  id: TrackId;
  wing: WingId;
  title: string;
  tagline: string;
  description: string;
  /** الكتب المعتمدة التي استُفيد منها المسار */
  sources: string[];
  units: Unit[];
};

export type Masala = {
  id: string;
  title: string;
  /** نص المتن كما هو */
  matn: string;
  /** الشرح */
  sharh: string;
  /** فوائد وتنبيهات */
  fawaid?: string[];
};

export type Chapter = { id: string; title: string; masail: Masala[] };

export type Book = {
  id: string;
  title: string;
  author: string;
  authorDates: string;
  field: TrackId;
  madhhab?: string;
  kind: "نثر" | "نظم" | "أحاديث";
  description: string;
  chapters: Chapter[];
};
