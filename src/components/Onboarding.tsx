import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check } from "lucide-react";
import { wingList, wingLessons, type WingId } from "../data";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { num } from "../lib/format";
import { Brand } from "./Shell";
import { ThemeSegmented } from "./ThemeSwitch";

const GOALS = [
  { v: 20, label: "خفيف", hint: "نحو 10 دقائق" },
  { v: 30, label: "معتدل", hint: "نحو 15 دقيقة" },
  { v: 50, label: "جادّ", hint: "نحو 25 دقيقة" },
];

export function Onboarding() {
  const onboarded = useStore((s) => s.onboarded);
  const finish = useStore((s) => s.finishOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(30);
  const [wing, setWing] = useState<WingId>("fiqh");
  const navigate = useNavigate();

  if (onboarded) return null;

  const steps = [
    <div key="0" className="stack" style={{ alignItems: "center", textAlign: "center" }}>
      <Brand />
      <h2 className="title-xl" style={{ fontSize: "2rem" }}>
        أهلاً بك في رواق
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
      <h2 className="title-lg">بأي جناح تبدأ؟</h2>
      <p className="small muted">يمكنك التنقل بين الجناحين في أي وقت، ولكلٍّ منهما تقدّمه الخاص.</p>
      <div className="stack-sm">
        {wingList.map((w) => (
          <button key={w.id} className={`choice ${wing === w.id ? "on" : ""}`} onClick={() => setWing(w.id)} style={{ alignItems: "flex-start", ["--hue" as string]: w.hue }}>
            <span className="wing-glyph" style={{ width: 48, height: 48, fontSize: "1.6rem", borderRadius: 14 }}>
              {w.glyph}
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, display: "block" }}>{w.title}</span>
              <span className="tiny muted">{w.tagline}</span>
            </span>
          </button>
        ))}
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
            <button className="btn btn-primary" onClick={() => {
                if (!last) return setStep(step + 1);
                finish(name.trim(), goal, null);
                navigate(`/lesson/${wingLessons(wing)[0].lesson.id}`);
              }}>
              {last ? "ابدأ الدرس الأول" : "التالي"} <ArrowLeft size={17} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
