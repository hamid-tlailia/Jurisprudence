import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, RotateCcw, Trophy, X } from "lucide-react";
import type { Question } from "../data";
import { num } from "../lib/format";
import { ProgressRing } from "./ProgressRing";

type Props = {
  questions: Question[];
  onFinish: (score: number, total: number) => void;
  hue?: string;
};

export function Quiz({ questions, onFinish, hue = "var(--accent)" }: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = questions[idx];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setFinished(true);
      onFinish(score, questions.length);
    }
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const perfect = score === questions.length;
    return (
      <motion.div
        className="stack"
        style={{ alignItems: "center", textAlign: "center", padding: "12px 0" }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <ProgressRing value={score / questions.length} size={130} stroke={10} color={perfect ? "var(--gold)" : hue}>
          <div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
              {perfect ? <Trophy size={30} color="var(--gold)" /> : null}
            </motion.div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>
              {num(score)} من {num(questions.length)}
            </div>
          </div>
        </ProgressRing>
        <div className="stack-sm" style={{ gap: 4 }}>
          <h3 className="title-lg">{perfect ? "أحسنت! إتقان تام" : score >= questions.length / 2 ? "جيد، بارك الله فيك" : "لا بأس، راجع الدرس وأعد المحاولة"}</h3>
          <p className="muted small">تم حفظ تقدمك في هذا الدرس.</p>
        </div>
        {!perfect && (
          <button className="btn btn-ghost" onClick={restart}>
            <RotateCcw size={16} /> أعد الاختبار
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="stack">
      <div className="row-between small">
        <span className="muted">
          السؤال {num(idx + 1)} من {num(questions.length)}
        </span>
        <div className="row" style={{ gap: 4 }}>
          {questions.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === idx ? 22 : 8,
                height: 8,
                borderRadius: 8,
                background: i < idx ? hue : i === idx ? "var(--gold)" : "var(--surface-3)",
                transition: "all .3s",
              }}
            />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="stack"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={{ fontSize: "1.12rem", fontWeight: 600 }}>{q.q}</p>
          <div className="stack-sm" style={{ gap: 10 }}>
            {q.options.map((o, i) => {
              const state = picked === null ? "" : i === q.answer ? "correct" : i === picked ? "wrong" : "";
              return (
                <motion.button
                  key={i}
                  className={`option ${state}`}
                  onClick={() => choose(i)}
                  disabled={picked !== null}
                  whileTap={{ scale: 0.985 }}
                  animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <span className="letter">{state === "correct" ? <Check size={15} /> : state === "wrong" ? <X size={15} /> : "أبجدهو"[i]}</span>
                  {o}
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {picked !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                <div className="stack-sm" style={{ paddingTop: 4 }}>
                  <div
                    className="small"
                    style={{
                      padding: "12px 16px",
                      borderRadius: 14,
                      background: picked === q.answer ? "var(--success-soft)" : "var(--danger-soft)",
                    }}
                  >
                    <strong>{picked === q.answer ? "إجابة صحيحة. " : "ليست هذه. "}</strong>
                    {q.explain}
                  </div>
                  <button className="btn btn-primary" style={{ alignSelf: "flex-end" }} onClick={next}>
                    {idx + 1 < questions.length ? "التالي" : "النتيجة"} <ArrowLeft size={17} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
