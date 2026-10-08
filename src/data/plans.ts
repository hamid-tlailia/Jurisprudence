import { allMasail, trackLessons, type WingId } from "./index";

/**
 * الخطط الدراسية: كل يوم يحتوي مهام (درس أو مسألة من المكتبة).
 */
export type PlanTask = { type: "lesson"; id: string } | { type: "masala"; bookId: string; id: string };

export type Plan = {
  id: string;
  title: string;
  description: string;
  wing: WingId | "both";
  level: "مبتدئ" | "متوسط";
  minutesPerDay: number;
  days: PlanTask[][];
};

const L = (id: string): PlanTask => ({ type: "lesson", id });

/** يقسم قائمة مهام إلى أيام بعدد معين لكل يوم */
const chunk = <T,>(items: T[], perDay: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += perDay) out.push(items.slice(i, i + perDay));
  return out;
};

const ids = (track: Parameters<typeof trackLessons>[0]) => trackLessons(track).map((e) => L(e.lesson.id));

/** خطة مختلطة: درس من الفقه ودرس من الحديث كل يوم */
const mixed: PlanTask[][] = (() => {
  const f = ids("fiqh");
  const h = [...ids("mustalah"), ...ids("hadith")];
  const days: PlanTask[][] = [];
  for (let i = 0; i < 30; i++) days.push([f[i], h[i]].filter(Boolean));
  return days;
})();

export const plans: Plan[] = [
  {
    id: "faqih",
    title: "طريق الفقيه",
    description: "درس واحد كل يوم في فقه العبادات المقارن: من مدخل الفقه إلى آخر أحكام الحج، بأقوال المذاهب وأدلتها.",
    wing: "fiqh",
    level: "مبتدئ",
    minutesPerDay: 10,
    days: chunk(ids("fiqh"), 1),
  },
  {
    id: "usuli",
    title: "مدخل الأصولي",
    description: "أحد عشر يوماً في أصول الفقه: الحكم الشرعي، والأدلة، ودلالات الألفاظ، والقواعد الفقهية الكبرى.",
    wing: "fiqh",
    level: "متوسط",
    minutesPerDay: 9,
    days: chunk(ids("usul"), 1),
  },
  {
    id: "bayquniyya",
    title: "فهم البيقونية",
    description: "بيت أو بيتان كل يوم مع الشرح والأمثلة والتدريب، حتى تختم المنظومة وتتماتها.",
    wing: "hadith",
    level: "مبتدئ",
    minutesPerDay: 8,
    days: chunk(ids("mustalah"), 1),
  },
  {
    id: "arbain",
    title: "صحبة الأربعين",
    description: "حديث كل يوم من الأربعين النووية، بعد ثلاثة دروس في منزلة السنة وتدوينها.",
    wing: "hadith",
    level: "مبتدئ",
    minutesPerDay: 8,
    days: chunk(ids("hadith"), 1),
  },
  {
    id: "jazariyya",
    title: "ختم الجزرية",
    description: "درس كل يوم من شرح المقدمة الجزرية: المخارج مع رسومها التوضيحية، ثم الصفات والأحكام والوقف والرسم.",
    wing: "quran",
    level: "مبتدئ",
    minutesPerDay: 12,
    days: chunk(ids("tajwid"), 1),
  },
  {
    id: "foundations",
    title: "التأسيس الشامل",
    description: "ثلاثون يوماً متوازنة: درس من الفقه ودرس من الحديث كل يوم.",
    wing: "both",
    level: "مبتدئ",
    minutesPerDay: 20,
    days: mixed,
  },
  {
    id: "light",
    title: "خمس دقائق يومياً",
    description: "مسألة واحدة كل يوم من متون الأخضري وأبي شجاع والورقات. قليل دائم خير من كثير منقطع.",
    wing: "fiqh",
    level: "مبتدئ",
    minutesPerDay: 5,
    days: chunk(
      allMasail.map((m): PlanTask => ({ type: "masala", bookId: m.book.id, id: m.masala.id })),
      1,
    ),
  },
];

export const getPlan = (id: string | null | undefined) => plans.find((p) => p.id === id);
