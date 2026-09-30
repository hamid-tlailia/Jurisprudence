import { create } from "zustand";
import type { AiMode } from "./ai";

export type AiRequest = {
  title: string;
  subtitle?: string;
  context?: string;
  mode?: AiMode;
  /** سؤال يُرسل تلقائياً عند الفتح */
  prompt?: string;
};

type PanelState = {
  open: boolean;
  req: AiRequest | null;
  nonce: number;
  openAi: (req: AiRequest) => void;
  close: () => void;
};

export const useAiPanel = create<PanelState>((set) => ({
  open: false,
  req: null,
  nonce: 0,
  openAi: (req) => set((s) => ({ open: true, req, nonce: s.nonce + 1 })),
  close: () => set({ open: false }),
}));

export const AI_ACTIONS: { mode: AiMode; label: string; prompt: string }[] = [
  { mode: "expand", label: "وسّع الشرح", prompt: "وسّع لي شرح هذا الموضع." },
  { mode: "simplify", label: "بسّطه لي", prompt: "بسّط لي هذا الموضع." },
  { mode: "example", label: "أمثلة تطبيقية", prompt: "أعطني أمثلة تطبيقية على هذا." },
  { mode: "compare", label: "قارن المذاهب", prompt: "قارن بين المذاهب في هذه المسألة." },
  { mode: "quiz", label: "اختبرني", prompt: "اختبرني في هذا الموضع." },
];
