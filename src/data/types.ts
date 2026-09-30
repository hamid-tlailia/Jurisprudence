export type Question = {
  q: string;
  options: string[];
  /** رقم الخيار الصحيح (يبدأ من 0) */
  answer: number;
  explain: string;
};

export type Section = { heading: string; body: string };

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  sections: Section[];
  keyPoints: string[];
  quiz: Question[];
  /** إحالة إلى موضع من المكتبة لمزيد القراءة */
  ref?: { bookId: string; masalaId?: string };
};

export type Unit = { id: string; title: string; lessons: Lesson[] };

export type TrackId = "fiqh" | "usul" | "hadith" | "mustalah";

export type Track = {
  id: TrackId;
  title: string;
  tagline: string;
  description: string;
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
