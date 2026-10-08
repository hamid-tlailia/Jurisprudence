import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CalendarRange, Check, Clock, LogOut, Target } from "lucide-react";
import { getLesson, getMasala } from "../data";
import { plans, type PlanTask } from "../data/plans";
import { useStore } from "../lib/store";
import { isTaskDone, planProgress } from "../lib/progress";
import { num, pct } from "../lib/format";
import { Bar, ProgressRing } from "../components/ProgressRing";
import { stagger } from "../components/Reveal";

const GOALS = [
  { v: 20, label: "خفيف", hint: "درس أو مسألتان" },
  { v: 30, label: "معتدل", hint: "درس ومسألة" },
  { v: 50, label: "جادّ", hint: "درسان" },
  { v: 80, label: "مكثّف", hint: "ثلاثة دروس فأكثر" },
];

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "fiqh", label: "الفقه" },
  { id: "hadith", label: "الحديث" },
  { id: "quran", label: "القرآن" },
] as const;

export default function PlansPage() {
  const s = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const shown = plans.filter((p) => filter === "all" || p.wing === filter || p.wing === "both");
  const pp = s.activePlan ? planProgress(s, s.activePlan.id) : null;

  return (
    <div className="page">
      <header className="stack-sm" style={{ marginBottom: 28 }}>
        <span className="eyebrow">الخطط الدراسية</span>
        <h1 className="title-xl">قليل دائم خير من كثير منقطع</h1>
        <p className="ink-2" style={{ maxWidth: 620 }}>
          اختر خطة تناسب وقتك، وستجد وِرد كل يوم في الصفحة الرئيسية. تتقدم الخطة كلما أتممت مهام يومك.
        </p>
      </header>

      {pp && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card hero stack" style={{ marginBottom: 32 }}>
          <div className="pattern" />
          <div className="row-between" style={{ position: "relative", flexWrap: "wrap", alignItems: "flex-start" }}>
            <div className="stack-sm" style={{ gap: 4 }}>
              <span className="chip chip-accent" style={{ alignSelf: "flex-start" }}>
                خطتك الحالية
              </span>
              <h2 className="title-lg">{pp.plan.title}</h2>
              <p className="small ink-2">{pp.plan.description}</p>
            </div>
            <ProgressRing value={pp.ratio} size={96} stroke={8}>
              <div>
                <div style={{ fontWeight: 700 }}>{pct(pp.ratio)}</div>
                <div className="tiny muted">
                  {num(pp.doneDays)}/{num(pp.plan.days.length)} يوم
                </div>
              </div>
            </ProgressRing>
          </div>

          <div className="plan-days" style={{ position: "relative" }}>
            {pp.plan.days.map((_, i) => (
              <motion.div
                key={i}
                className={`plan-day ${pp.dayDone[i] ? "done" : i === pp.currentDay ? "current" : ""}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.015 }}
                title={`اليوم ${i + 1}`}
              >
                {pp.dayDone[i] ? <Check size={16} /> : num(i + 1)}
              </motion.div>
            ))}
          </div>

          <div className="stack-sm" style={{ position: "relative" }}>
            <h3 className="title-md">{pp.finished ? "أتممت الخطة، بارك الله فيك!" : `مهام اليوم ${num(pp.currentDay + 1)}`}</h3>
            {!pp.finished && pp.plan.days[pp.currentDay].map((t, i) => <PlanTaskRow key={i} task={t} />)}
          </div>

          <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", position: "relative" }} onClick={() => s.leavePlan()}>
            <LogOut size={15} /> ترك الخطة
          </button>
        </motion.section>
      )}

      <section className="card card-pad stack" style={{ marginBottom: 32 }}>
        <div className="row" style={{ gap: 10 }}>
          <Target size={20} color="var(--gold)" />
          <h2 className="title-md">هدفك اليومي</h2>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          {GOALS.map((g) => (
            <button key={g.v} className={`choice ${s.dailyGoal === g.v ? "on" : ""}`} onClick={() => s.setDailyGoal(g.v)} style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
              <span style={{ fontWeight: 700 }}>{g.label}</span>
              <span className="tiny muted">
                {num(g.v)} نقطة · {g.hint}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="row-between" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <h2 className="title-lg">الخطط المتاحة</h2>
        <div className="segmented">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? "on" : ""} onClick={() => setFilter(f.id)}>
              {filter === f.id && <motion.span layoutId="plan-filter" className="seg-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <motion.div key={filter} className="grid-2" variants={stagger.container} initial="hidden" animate="show">
        {shown.map((p) => {
          const prog = planProgress(s, p.id)!;
          const active = s.activePlan?.id === p.id;
          const completed = s.completedPlans.includes(p.id);
          return (
            <motion.div key={p.id} variants={stagger.item} className="card card-pad stack" style={active ? { borderColor: "var(--accent)" } : undefined}>
              <div className="row-between" style={{ alignItems: "flex-start" }}>
                <div className="track-glyph" style={{ ["--hue" as string]: "var(--accent)" }}>
                  <CalendarRange size={24} />
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <span className="chip">{p.level}</span>
                  {completed && <span className="chip chip-gold">مكتملة</span>}
                </div>
              </div>
              <div className="stack-sm" style={{ gap: 4 }}>
                <h3 className="title-md">{p.title}</h3>
                <p className="small ink-2">{p.description}</p>
              </div>
              <div className="row tiny muted" style={{ gap: 16 }}>
                <span className="row" style={{ gap: 4 }}>
                  <CalendarRange size={13} /> {num(p.days.length)} يوماً
                </span>
                <span className="row" style={{ gap: 4 }}>
                  <Clock size={13} /> نحو {num(p.minutesPerDay)} دقيقة يومياً
                </span>
              </div>
              <Bar value={prog.ratio} />
              {active ? (
                <span className="chip chip-accent" style={{ alignSelf: "flex-start" }}>
                  الخطة الحالية
                </span>
              ) : (
                <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => s.startPlan(p.id)}>
                  {prog.doneDays ? "استأنف هذه الخطة" : "ابدأ هذه الخطة"} <ArrowLeft size={15} />
                </button>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function PlanTaskRow({ task }: { task: PlanTask }) {
  const s = useStore();
  const done = isTaskDone(s, task);
  const info =
    task.type === "lesson"
      ? (() => {
          const e = getLesson(task.id);
          return e && { title: e.lesson.title, sub: `درس · ${e.track.title}`, href: `/lesson/${task.id}` };
        })()
      : (() => {
          const m = getMasala(task.bookId, task.id);
          return m && { title: m.masala.title, sub: `مسألة · ${m.book.title}`, href: `/library/${task.bookId}#${task.id}` };
        })();
  if (!info) return null;
  return (
    <Link to={info.href} className={`task ${done ? "done" : ""}`}>
      <span className="check">
        <Check size={15} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{info.title}</div>
        <div className="tiny muted">{info.sub}</div>
      </div>
      <ArrowLeft size={17} className="muted" />
    </Link>
  );
}
