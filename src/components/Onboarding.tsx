import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { plans } from "../data/plans";
import { useStore } from "../lib/store";
import { num } from "../lib/format";
import { Brand } from "./Shell";
import { ThemeSegmented } from "./ThemeSwitch";

const GOALS = [
  { v: 20, label: "خفيف", hint: "نحو ١٠ دقائق" },
  { v: 30, label: "معتدل", hint: "نحو ١٥ دقيقة" },
  { v: 50, label: "جادّ", hint: "نحو ٢٥ دقيقة" },
];

export function Onboarding() {
  const onboarded = useStore((s) => s.onboarded);
  const finish = useStore((s) => s.finishOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(30);
  const [plan, setPlan] = useState<string | null>("foundations");

  if (onboarded) return null;

  const steps = [
    <div key="0" className="stack" style={{ alignItems: "center", textAlign: "center" }}>
      <Brand />
      <h2 className="title-xl" style={{ fontSize: "2rem" }}>
        أهلاً بك في الرواق
      </h2>
      <p className="ink-2">
        مدرسة هادئة لتعلّم الفقه الإسلامي وأصوله، والحديث النبوي وعلومه: دروس قصيرة، ومتون مشروحة، وخطط يومية، ومُعين ذكي يوسّع لك الشرح.
      </p>
      <div className="stack-sm" style={{ width: "100%", alignItems: "center" }}>
        <span className="small muted">اختر المظهر الذي يريحك</span>
        <ThemeSegmented layoutId="onb-theme" />
      </div>
    </div>,
    <div key="1" className="stack">
      <h2 className="title-lg">بمَ نناديك؟</h2>
      <input className="input" autoFocus placeholder="اسمك (اختياري)" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
      <h2 className="title-lg" style={{ marginTop: 8 }}>
        هدفك اليومي
      </h2>
      <div className="stack-sm">
        {GOALS.map((g) => (
          <button key={g.v} className={`choice ${goal === g.v ? "on" : ""}`} onClick={() => setGoal(g.v)}>
            <span className="check" style={goal === g.v ? { background: "var(--accent)", borderColor: "transparent", color: "var(--accent-ink)" } : undefined}>
              <Check size={14} />
            </span>
            <span style={{ flex: 1, fontWeight: 600 }}>{g.label}</span>
            <span className="tiny muted">
              {num(g.v)} نقطة · {g.hint}
            </span>
          </button>
        ))}
      </div>
    </div>,
    <div key="2" className="stack">
      <h2 className="title-lg">اختر خطتك الأولى</h2>
      <div className="stack-sm">
        {plans.map((p) => (
          <button key={p.id} className={`choice ${plan === p.id ? "on" : ""}`} onClick={() => setPlan(p.id)} style={{ alignItems: "flex-start" }}>
            <span className="check" style={plan === p.id ? { background: "var(--accent)", borderColor: "transparent", color: "var(--accent-ink)" } : undefined}>
              <Check size={14} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, display: "block" }}>{p.title}</span>
              <span className="tiny muted">
                {num(p.days.length)} يوماً · {num(p.minutesPerDay)} دقيقة يومياً
              </span>
            </span>
          </button>
        ))}
        <button className={`choice ${plan === null ? "on" : ""}`} onClick={() => setPlan(null)}>
          <span className="check" style={plan === null ? { background: "var(--accent)", borderColor: "transparent", color: "var(--accent-ink)" } : undefined}>
            <Check size={14} />
          </span>
          <span style={{ flex: 1, fontWeight: 600 }}>سأتصفح بحرية</span>
        </button>
      </div>
    </div>,
  ];

  const last = step === steps.length - 1;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="البداية">
      <motion.div className="scrim" style={{ zIndex: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <motion.div className="modal-card" style={{ position: "relative", zIndex: 1 }} initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }}>
            {steps[step]}
          </motion.div>
        </AnimatePresence>
        <div className="row-between" style={{ marginTop: 26 }}>
          <div className="row" style={{ gap: 6 }}>
            {steps.map((_, i) => (
              <span key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 8, background: i <= step ? "var(--accent)" : "var(--surface-3)", transition: "all .3s" }} />
            ))}
          </div>
          <div className="row" style={{ gap: 8 }}>
            {step > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>
                رجوع
              </button>
            )}
            <button className="btn btn-primary" onClick={() => (last ? finish(name.trim(), goal, plan) : setStep(step + 1))}>
              {last ? "لنبدأ على بركة الله" : "التالي"} <ArrowLeft size={17} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
