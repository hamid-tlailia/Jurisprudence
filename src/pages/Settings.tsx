import { useState } from "react";
import { motion } from "motion/react";
import { Palette, RotateCcw, Type, User } from "lucide-react";
import { useStore } from "../lib/store";
import { ThemeSegmented } from "../components/ThemeSwitch";
import { num } from "../lib/format";

const SCALES = [
  { v: 0.9, label: "صغير" },
  { v: 1, label: "متوسط" },
  { v: 1.1, label: "كبير" },
  { v: 1.2, label: "أكبر" },
];

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const resetProgress = useStore((s) => s.resetProgress);
  const xp = useStore((s) => s.xp);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="page page-narrow">
      <header className="stack-sm" style={{ marginBottom: 28 }}>
        <span className="eyebrow">الإعدادات</span>
        <h1 className="title-xl">هيّئ الرواق كما تحب</h1>
      </header>

      <div className="stack" style={{ gap: 18 }}>
        <Section icon={<Palette size={19} />} title="المظهر" hint="اختر الوضع الليلي أو النهاري، أو اتبع إعداد جهازك تلقائياً.">
          <ThemeSegmented layoutId="settings-theme" />
        </Section>

        <Section icon={<Type size={19} />} title="حجم الخط" hint="يؤثر في جميع النصوص، ومنها المتون والشروح.">
          <div className="segmented">
            {SCALES.map((sc) => (
              <button key={sc.v} className={settings.fontScale === sc.v ? "on" : ""} onClick={() => setSettings({ fontScale: sc.v })}>
                {settings.fontScale === sc.v && <motion.span layoutId="scale-pill" className="seg-pill" />}
                {sc.label}
              </button>
            ))}
          </div>
          <p className="matn" style={{ marginTop: 14, fontSize: "1.2rem" }}>
            إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى
          </p>
        </Section>

        <Section icon={<User size={19} />} title="الاسم" hint="يظهر في التحية على الصفحة الرئيسية.">
          <input className="input" value={settings.name} placeholder="اسمك" onChange={(e) => setSettings({ name: e.target.value })} maxLength={40} />
        </Section>

        <Section icon={<RotateCcw size={19} />} title="إعادة ضبط التقدم" hint={`سيُحذف تقدمك كله (${num(xp)} نقطة، والدروس، والأوسمة). لا يمكن التراجع.`}>
          {confirmReset ? (
            <div className="row" style={{ flexWrap: "wrap" }}>
              <button
                className="btn"
                style={{ background: "var(--danger)", color: "var(--surface)" }}
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                }}
              >
                نعم، احذف تقدمي
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                إلغاء
              </button>
            </div>
          ) : (
            <button className="btn btn-ghost" onClick={() => setConfirmReset(true)} style={{ color: "var(--danger)" }}>
              إعادة الضبط
            </button>
          )}
        </Section>

        <p className="tiny muted" style={{ textAlign: "center", marginTop: 12 }}>
          الرواق — منصة تعليمية. المحتوى العلمي مختصر من كتب أهل العلم للتعليم والتقريب، ولا يغني عن التلقي من العلماء.
        </p>
      </div>
    </div>
  );
}

function Section({ icon, title, hint, children }: { icon: React.ReactNode; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card card-pad stack" style={{ gap: 14 }}>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <span className="track-glyph" style={{ ["--hue" as string]: "var(--accent)", width: 38, height: 38, borderRadius: 11 }}>
          {icon}
        </span>
        <div>
          <h2 className="title-md">{title}</h2>
          {hint && <p className="small muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
