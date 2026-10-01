import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  XP,
  dayKey,
  evaluateBadges,
  initialProgress,
  planProgress,
  type Badge,
  type ProgressState,
} from "./progress";

export type ThemeMode = "light" | "dark" | "auto";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type Chat = { id: string; title: string; messages: ChatMessage[]; updatedAt: number };

export type Toast = { id: number; kind: "badge" | "xp" | "info"; title: string; body?: string; icon?: string };

type Settings = {
  theme: ThemeMode;
  fontScale: number;
  name: string;
  showTashkeelHints: boolean;
};

type Store = ProgressState & {
  settings: Settings;
  chats: Chat[];
  toasts: Toast[];
  onboarded: boolean;

  completeLesson: (id: string, score: number, total: number) => void;
  readMasala: (bookId: string, masalaId: string) => void;
  logAi: () => void;
  startPlan: (id: string) => void;
  leavePlan: () => void;
  setDailyGoal: (n: number) => void;
  toggleBookmark: (key: string) => void;
  /** أسئلة المراجعة التي أُجيب عنها اليوم */
  review: { day: string; done: string[] };
  markReviewed: (id: string) => void;
  setSettings: (p: Partial<Settings>) => void;
  finishOnboarding: (name: string, goal: number, planId: string | null) => void;
  saveChat: (chat: Chat) => void;
  deleteChat: (id: string) => void;
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  resetProgress: () => void;
};

let toastSeq = 1;

/** يضيف نقاطاً ويحدّث سجل اليوم ويقيّم الأوسمة والخطة، ويعيد التغييرات مع التنبيهات. */
function withXp(s: Store, patch: Partial<ProgressState>, gained: number): Partial<Store> {
  const today = dayKey();
  const next: ProgressState = {
    ...pickProgress(s),
    ...patch,
    xp: s.xp + gained,
    activity: gained > 0 ? { ...s.activity, [today]: (s.activity[today] ?? 0) + gained } : s.activity,
  };

  const toasts: Toast[] = [...s.toasts];
  if (gained > 0) toasts.push({ id: toastSeq++, kind: "xp", title: `+${gained} نقطة` });

  // إتمام الخطة
  if (next.activePlan && !next.completedPlans.includes(next.activePlan.id)) {
    const pp = planProgress(next, next.activePlan.id);
    if (pp?.finished) {
      next.completedPlans = [...next.completedPlans, next.activePlan.id];
      next.xp += XP.planDay * 2;
      toasts.push({ id: toastSeq++, kind: "info", title: "أتممت الخطة الدراسية", body: pp.plan.title, icon: "medal" });
    }
  }

  const { badges, earned } = evaluateBadges(next);
  next.badges = badges;
  earned.forEach((b: Badge) =>
    toasts.push({ id: toastSeq++, kind: "badge", title: `وسام جديد: ${b.title}`, body: b.description, icon: b.icon }),
  );

  // الاحتفال بتحقيق الهدف اليومي أول مرة
  const before = s.activity[today] ?? 0;
  const after = next.activity[today] ?? 0;
  if (before < s.dailyGoal && after >= s.dailyGoal) {
    toasts.push({ id: toastSeq++, kind: "info", title: "حققت هدفك اليومي", body: "بارك الله في وقتك", icon: "target" });
  }

  return { ...next, toasts };
}

function pickProgress(s: Store): ProgressState {
  return {
    xp: s.xp,
    completedLessons: s.completedLessons,
    readMasail: s.readMasail,
    activity: s.activity,
    badges: s.badges,
    aiQuestions: s.aiQuestions,
    activePlan: s.activePlan,
    completedPlans: s.completedPlans,
    dailyGoal: s.dailyGoal,
    bookmarks: s.bookmarks,
  };
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialProgress,
      settings: { theme: "auto", fontScale: 1, name: "", showTashkeelHints: true },
      chats: [],
      review: { day: "", done: [] },
      toasts: [],
      onboarded: false,

      completeLesson: (id, score, total) => {
        const s = get();
        const prev = s.completedLessons[id];
        const perfect = total > 0 && score === total;
        const wasPerfect = prev && prev.total > 0 && prev.score === prev.total;
        let gained = prev ? 0 : XP.lesson;
        if (perfect && !wasPerfect) gained += XP.perfectQuiz;
        const best = prev && prev.score > score ? prev : { at: new Date().toISOString(), score, total };
        set(withXp(s, { completedLessons: { ...s.completedLessons, [id]: best } }, gained));
      },

      readMasala: (bookId, masalaId) => {
        const s = get();
        const key = `${bookId}/${masalaId}`;
        if (s.readMasail[key]) return;
        set(withXp(s, { readMasail: { ...s.readMasail, [key]: new Date().toISOString() } }, XP.masala));
      },

      logAi: () => {
        const s = get();
        set(withXp(s, { aiQuestions: s.aiQuestions + 1 }, XP.ai));
      },

      startPlan: (id) => set({ activePlan: { id, startedAt: new Date().toISOString() } }),
      leavePlan: () => set({ activePlan: null }),
      setDailyGoal: (n) => set({ dailyGoal: n }),

      markReviewed: (id) =>
        set((s) => {
          const today = dayKey();
          const done = s.review.day === today ? s.review.done : [];
          return done.includes(id) ? {} : { review: { day: today, done: [...done, id] } };
        }),

      toggleBookmark: (key) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(key) ? s.bookmarks.filter((k) => k !== key) : [...s.bookmarks, key],
        })),

      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

      finishOnboarding: (name, goal, planId) =>
        set((s) => ({
          onboarded: true,
          dailyGoal: goal,
          settings: { ...s.settings, name },
          activePlan: planId ? { id: planId, startedAt: new Date().toISOString() } : s.activePlan,
        })),

      saveChat: (chat) =>
        set((s) => ({ chats: [chat, ...s.chats.filter((c) => c.id !== chat.id)].slice(0, 50) })),
      deleteChat: (id) => set((s) => ({ chats: s.chats.filter((c) => c.id !== id) })),

      pushToast: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: toastSeq++ }] })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      resetProgress: () => set({ ...initialProgress, review: { day: "", done: [] }, toasts: [] }),
    }),
    {
      name: "riwaq-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // الإصدار 1: حذف مفتاح الذكاء الاصطناعي الذي كان يُحفظ في المتصفح
      migrate: (persisted) => {
        const p = persisted as { settings?: Record<string, unknown> } | undefined;
        if (p?.settings) delete p.settings.userApiKey;
        return p as never;
      },
      partialize: (s) => {
        // التنبيهات مؤقتة لا تُحفظ
        const { toasts: _t, ...rest } = s;
        void _t;
        return rest;
      },
    },
  ),
);
