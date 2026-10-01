import type { Example, Exercise, Question, Vocab } from "./types";

/** سؤال اختيار من متعدد */
export const q = (question: string, options: string[], answer: number, explain: string): Question => ({
  q: question,
  options,
  answer,
  explain,
});

/** تدريب مفتوح بجوابه */
export const ex = (question: string, answer: string): Exercise => ({ q: question, a: answer });

/** مفردة وشرحها */
export const v = (term: string, meaning: string): Vocab => ({ term, meaning });

/** مثال تطبيقي */
export const eg = (title: string, body: string): Example => ({ title, body });
