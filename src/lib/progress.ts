/**
 * منطق التقدم والتحفيز: النقاط، المستويات، سلسلة الأيام، الأوسمة.
 * دوال خالصة قابلة للاختبار.
 */
import { allLessons, tracks } from "../data";
import { plans } from "../data/plans";

export const XP = {
  lesson: 20,
  perfectQuiz: 10,
  masala: 5,
  ai: 2,
  planDay: 15,
} as const;

export type LessonRecord = { at: string; score: number; total: number };

export type ProgressState = {
  xp: number;
  completedLessons: Record<string, LessonRecord>;
  readMasail: Record<string, string>;
  /** النقاط المكتسبة في كل يوم: YYYY-MM-DD → xp */
  activity: Record<string, number>;
  badges: Record<string, string>;
  aiQuestions: number;
  activePlan: { id: string; startedAt: string } | null;
  completedPlans: string[];
  dailyGoal: number;
  bookmarks: string[];
};

export const initialProgress: ProgressState = {
  xp: 0,
  completedLessons: {},
  readMasail: {},
  activity: {},
  badges: {},
  aiQuestions: 0,
  activePlan: null,
  completedPlans: [],
  dailyGoal: 30,
  bookmarks: [],
};

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shiftDay(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** عدد الأيام المتتالية ذات النشاط، منتهية باليوم أو بالأمس (لا تنقطع السلسلة قبل انتهاء اليوم). */
export function currentStreak(activity: Record<string, number>, today: Date = new Date()): number {
  let cursor = today;
  if (!activity[dayKey(cursor)]) cursor = shiftDay(cursor, -1);
  let n = 0;
  while (activity[dayKey(cursor)]) {
    n++;
    cursor = shiftDay(cursor, -1);
  }
  return n;
}

export function longestStreak(activity: Record<string, number>): number {
  const days = Object.keys(activity).filter((k) => activity[k] > 0).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of days) {
    const [y, m, d] = k.split("-").map(Number);
    const cur = new Date(y, m - 1, d);
    run = prev && dayKey(shiftDay(prev, 1)) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

/** آخر n يوماً للخريطة الحرارية، من الأقدم إلى الأحدث. */
export function lastDays(activity: Record<string, number>, n: number, today: Date = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = shiftDay(today, i - n + 1);
    const k = dayKey(d);
    return { key: k, date: d, xp: activity[k] ?? 0 };
  });
}

export const RANKS = [
  { min: 0, title: "مبتدئ الطلب" },
  { min: 100, title: "طالب مجتهد" },
  { min: 300, title: "ملازم الحلقة" },
  { min: 600, title: "حافظ المتون" },
  { min: 1000, title: "متقن الأصول" },
  { min: 1600, title: "نبيه الفقه" },
  { min: 2400, title: "ناقد الأسانيد" },
  { min: 3500, title: "شيخ الرواق" },
];

export function levelFor(xp: number) {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].min) idx = i;
  const cur = RANKS[idx];
  const next = RANKS[idx + 1];
  const progress = next ? (xp - cur.min) / (next.min - cur.min) : 1;
  return { level: idx + 1, title: cur.title, next, progress, toNext: next ? next.min - xp : 0 };
}

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (s: ProgressState) => boolean;
};

const lessonsOf = (trackId: string) =>
  allLessons.filter((e) => e.track.id === trackId).map((e) => e.lesson.id);

const perfectCount = (s: ProgressState) =>
  Object.values(s.completedLessons).filter((r) => r.total > 0 && r.score === r.total).length;

export const BADGES: Badge[] = [
  { id: "first-step", title: "الخطوة الأولى", description: "أتممت أول درس", icon: "footprints", check: (s) => Object.keys(s.completedLessons).length >= 1 },
  { id: "first-masala", title: "صحبة المتون", description: "قرأت أول مسألة من المكتبة", icon: "book-open", check: (s) => Object.keys(s.readMasail).length >= 1 },
  { id: "ten-lessons", title: "همّة عالية", description: "أتممت عشرة دروس", icon: "flame", check: (s) => Object.keys(s.completedLessons).length >= 10 },
  { id: "twenty-masail", title: "قارئ نهِم", description: "قرأت عشرين مسألة", icon: "library", check: (s) => Object.keys(s.readMasail).length >= 20 },
  { id: "perfect-1", title: "إتقان", description: "أجبت عن اختبار درس دون خطأ", icon: "target", check: (s) => perfectCount(s) >= 1 },
  { id: "perfect-10", title: "ضابط متقن", description: "عشرة اختبارات بلا خطأ", icon: "gem", check: (s) => perfectCount(s) >= 10 },
  { id: "streak-3", title: "مداومة", description: "ثلاثة أيام متتالية من التعلم", icon: "calendar-check", check: (s) => longestStreak(s.activity) >= 3 },
  { id: "streak-7", title: "أسبوع الثبات", description: "سبعة أيام متتالية", icon: "sunrise", check: (s) => longestStreak(s.activity) >= 7 },
  { id: "streak-30", title: "أحبّ الأعمال أدومها", description: "ثلاثون يوماً متتالية", icon: "crown", check: (s) => longestStreak(s.activity) >= 30 },
  ...tracks.map<Badge>((t) => ({
    id: `track-${t.id}`,
    title: `ختم مسار ${t.title}`,
    description: `أتممت جميع دروس مسار ${t.title}`,
    icon: "award",
    check: (s) => lessonsOf(t.id).every((id) => s.completedLessons[id]),
  })),
  {
    id: "bayquniyya",
    title: "ختم البيقونية",
    description: "قرأت جميع مسائل المنظومة البيقونية",
    icon: "scroll",
    check: (s) => Object.keys(s.readMasail).filter((k) => k.startsWith("bayquniyya/")).length >= 23,
  },
  { id: "curious", title: "سؤول عقول", description: "طرحت عشرة أسئلة على المُعين", icon: "sparkles", check: (s) => s.aiQuestions >= 10 },
  { id: "plan-done", title: "وفيّ بالعهد", description: "أتممت خطة دراسية كاملة", icon: "medal", check: (s) => s.completedPlans.length >= 1 },
  { id: "xp-1000", title: "ألف نقطة", description: "جمعت ألف نقطة", icon: "star", check: (s) => s.xp >= 1000 },
];

export function evaluateBadges(s: ProgressState, now = new Date()): { badges: Record<string, string>; earned: Badge[] } {
  const earned: Badge[] = [];
  const badges = { ...s.badges };
  for (const b of BADGES) {
    if (!badges[b.id] && b.check(s)) {
      badges[b.id] = now.toISOString();
      earned.push(b);
    }
  }
  return { badges, earned };
}

// ————— الخطط —————

export function isTaskDone(s: Pick<ProgressState, "completedLessons" | "readMasail">, t: import("../data/plans").PlanTask) {
  return t.type === "lesson" ? !!s.completedLessons[t.id] : !!s.readMasail[`${t.bookId}/${t.id}`];
}

export function planProgress(s: ProgressState, planId: string) {
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return null;
  const dayDone = plan.days.map((tasks) => tasks.every((t) => isTaskDone(s, t)));
  const doneDays = dayDone.filter(Boolean).length;
  const currentDay = dayDone.findIndex((d) => !d);
  return {
    plan,
    dayDone,
    doneDays,
    currentDay: currentDay === -1 ? plan.days.length - 1 : currentDay,
    finished: currentDay === -1,
    ratio: doneDays / plan.days.length,
  };
}

/** اختيار عنصر ثابت لليوم (يتغير يومياً فقط). */
export function dailyPick<T>(items: T[], salt = 0, today = new Date()): T {
  const k = dayKey(today);
  let h = salt;
  for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return items[h % items.length];
}
