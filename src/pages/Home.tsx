import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, CalendarRange, Check, Flame, Lightbulb, RotateCcw, Sparkles, Target } from "lucide-react";
import { allLessons, allMasail, getLesson, getMasala, tracks, trackMeta } from "../data";
import { useStore } from "../lib/store";
import { currentStreak, dailyPick, dayKey, isTaskDone, lastDays, levelFor, planProgress } from "../lib/progress";
import { greeting, hijriDate, minutesLabel, num, weekdayShort } from "../lib/format";
import { useAiPanel } from "../lib/aiPanel";
import { Bar, ProgressRing } from "../components/ProgressRing";
import { stagger } from "../components/Reveal";

export default function Home() {
  const s = useStore();
  const lvl = levelFor(s.xp);
  const streak = currentStreak(s.activity);
  const todayXp = s.activity[dayKey()] ?? 0;
  const week = lastDays(s.activity, 7);
  const openAi = useAiPanel((p) => p.openAi);

  const pp = s.activePlan ? planProgress(s, s.activePlan.id) : null;
  const nextLesson = allLessons.find((e) => !s.completedLessons[e.lesson.id]);

  const faida = useMemo(() => dailyPick(allMasail.filter((m) => m.masala.fawaid?.length), 7), []);
  const faidaText = useMemo(() => dailyPick(faida.masala.fawaid ?? [""], 3), [faida]);

  return (
    <div className="page">
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="stack" style={{ gap: 20 }}>
        {/* البطاقة الرئيسية */}
        <motion.section variants={stagger.item} className="card hero">
          <div className="pattern" />
          <div style={{ position: "relative" }} className="stack">
            <div className="row-between" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
              <div className="stack-sm" style={{ gap: 4 }}>
                <span className="eyebrow">{hijriDate()}</span>
                <h1 className="title-xl">
                  {greeting()}
                  {s.settings.name ? `، ${s.settings.name}` : ""}
                </h1>
                <p className="ink-2" style={{ maxWidth: 520 }}>
                  «من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة» — رواه مسلم
                </p>
              </div>
              <ProgressRing value={Math.min(1, todayXp / s.dailyGoal)} size={116} stroke={10}>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>{num(todayXp)}</div>
                  <div className="tiny muted">من {num(s.dailyGoal)} نقطة</div>
                </div>
              </ProgressRing>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div className="stat">
                <span className="stat-value row" style={{ gap: 6 }}>
                  <Flame size={20} color="var(--gold)" /> {num(streak)}
                </span>
                <span className="stat-label">أيام متتالية</span>
              </div>
              <div className="stat">
                <span className="stat-value">{num(s.xp)}</span>
                <span className="stat-label">مجموع النقاط</span>
              </div>
              <div className="stat">
                <span className="stat-value">{num(lvl.level)}</span>
                <span className="stat-label">المستوى · {lvl.title}</span>
              </div>
            </div>

            <div className="week-strip" aria-label="نشاط الأسبوع">
              {week.map((d, i) => (
                <div key={d.key} className="week-day">
                  <motion.div
                    className={`week-dot ${d.xp > 0 ? "on" : ""} ${i === 6 ? "today" : ""}`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {d.xp > 0 ? <Check size={16} /> : null}
                  </motion.div>
                  <span>{weekdayShort(d.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="grid-2" style={{ alignItems: "start" }}>
          {/* درس اليوم */}
          <motion.section variants={stagger.item} className="card card-pad stack">
            <div className="row-between">
              <div className="row" style={{ gap: 10 }}>
                <Target size={20} color="var(--accent)" />
                <h2 className="title-md">ورد اليوم</h2>
              </div>
              {pp && (
                <span className="chip chip-accent">
                  اليوم {num(pp.currentDay + 1)} من {num(pp.plan.days.length)}
                </span>
              )}
            </div>

            {pp ? (
              <>
                <p className="small muted">{pp.plan.title}</p>
                <div className="stack-sm">
                  {pp.plan.days[pp.currentDay].map((t, i) => (
                    <TaskRow key={i} task={t} />
                  ))}
                </div>
                <Bar value={pp.ratio} />
              </>
            ) : nextLesson ? (
              <>
                <p className="small muted">لم تختر خطة دراسية بعد. هذا درسك التالي:</p>
                <Link to={`/lesson/${nextLesson.lesson.id}`} className="task">
                  <span className="track-glyph" style={{ ["--hue" as string]: trackMeta[nextLesson.track.id].hue, width: 40, height: 40, fontSize: "1.2rem", borderRadius: 12 }}>
                    {trackMeta[nextLesson.track.id].glyph}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{nextLesson.lesson.title}</div>
                    <div className="tiny muted">
                      {nextLesson.track.title} · {minutesLabel(nextLesson.lesson.minutes)}
                    </div>
                  </div>
                  <ArrowLeft size={18} />
                </Link>
                <Link to="/plans" className="btn btn-ghost">
                  <CalendarRange size={17} /> اختر خطة دراسية
                </Link>
              </>
            ) : (
              <p className="muted">أتممت جميع الدروس — ما شاء الله! راجع المكتبة أو اسأل المُعين.</p>
            )}
          </motion.section>

          {/* فائدة اليوم */}
          <motion.section variants={stagger.item} className="card card-pad stack">
            <div className="row" style={{ gap: 10 }}>
              <Lightbulb size={20} color="var(--gold)" />
              <h2 className="title-md">فائدة اليوم</h2>
            </div>
            <p style={{ fontFamily: "var(--font-classic)", fontSize: "1.25rem", lineHeight: 2 }}>{faidaText}</p>
            <div className="row-between" style={{ flexWrap: "wrap" }}>
              <Link to={`/library/${faida.book.id}#${faida.masala.id}`} className="small ink-2 row" style={{ gap: 6 }}>
                <BookOpen size={15} /> {faida.book.title} — {faida.masala.title}
              </Link>
              <button
                className="btn btn-gold btn-sm"
                onClick={() =>
                  openAi({
                    title: faida.masala.title,
                    context: `${faida.book.title}\n${faida.masala.matn}\n\nالفائدة: ${faidaText}`,
                    mode: "expand",
                    prompt: "اشرح لي هذه الفائدة ووجهها.",
                  })
                }
              >
                <Sparkles size={15} /> اشرحها لي
              </button>
            </div>
          </motion.section>
        </div>

        <motion.div variants={stagger.item}>
          <ReviewQuestion />
        </motion.div>

        {/* المسارات */}
        <motion.div variants={stagger.item} className="section-head" style={{ marginTop: 16, marginBottom: 0 }}>
          <h2 className="title-lg">مساراتك</h2>
          <Link to="/tracks" className="small ink-2 row" style={{ gap: 4 }}>
            كل المسارات <ArrowLeft size={15} />
          </Link>
        </motion.div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
          {tracks.map((t) => {
            const ids = t.units.flatMap((u) => u.lessons.map((l) => l.id));
            const done = ids.filter((id) => s.completedLessons[id]).length;
            const meta = trackMeta[t.id];
            return (
              <motion.div key={t.id} variants={stagger.item}>
                <Link to={`/tracks/${t.id}`} className="card card-hover track-card" style={{ ["--hue" as string]: meta.hue }}>
                  <div className="row">
                    <div className="track-glyph">{meta.glyph}</div>
                    <div>
                      <div className="title-md">{t.title}</div>
                      <div className="tiny muted">
                        {num(done)} / {num(ids.length)} دروس
                      </div>
                    </div>
                  </div>
                  <Bar value={done / ids.length} color={meta.hue} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function TaskRow({ task }: { task: import("../data/plans").PlanTask }) {
  const s = useStore();
  const done = isTaskDone(s, task);
  if (task.type === "lesson") {
    const e = getLesson(task.id);
    if (!e) return null;
    return (
      <Link to={`/lesson/${task.id}`} className={`task ${done ? "done" : ""}`}>
        <span className="check">
          <Check size={15} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600 }}>{e.lesson.title}</div>
          <div className="tiny muted">
            درس · {e.track.title} · {minutesLabel(e.lesson.minutes)}
          </div>
        </div>
        <ArrowLeft size={17} className="muted" />
      </Link>
    );
  }
  const m = getMasala(task.bookId, task.id);
  if (!m) return null;
  return (
    <Link to={`/library/${task.bookId}#${task.id}`} className={`task ${done ? "done" : ""}`}>
      <span className="check">
        <Check size={15} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600 }}>{m.masala.title}</div>
        <div className="tiny muted">مسألة · {m.book.title}</div>
      </div>
      <ArrowLeft size={17} className="muted" />
    </Link>
  );
}

/** سؤال مراجعة يومي من الدروس المكتملة (أو من أول درس) */
function ReviewQuestion() {
  const completed = useStore((s) => s.completedLessons);
  const pool = useMemo(() => {
    const done = allLessons.filter((e) => completed[e.lesson.id]);
    const src = done.length ? done : allLessons.slice(0, 3);
    return src.flatMap((e) => e.lesson.quiz.map((q) => ({ q, lesson: e.lesson })));
  }, [completed]);
  const [offset, setOffset] = useState(0);
  const item = dailyPick(pool, 11 + offset);
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <section className="card card-pad stack">
      <div className="row-between">
        <div className="row" style={{ gap: 10 }}>
          <RotateCcw size={19} color="var(--accent)" />
          <h2 className="title-md">سؤال المراجعة</h2>
        </div>
        <span className="tiny muted">من درس: {item.lesson.title}</span>
      </div>
      <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>{item.q.q}</p>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        {item.q.options.map((o, i) => {
          const state = picked === null ? "" : i === item.q.answer ? "correct" : i === picked ? "wrong" : "";
          return (
            <motion.button key={i} whileTap={{ scale: 0.98 }} className={`option ${state}`} disabled={picked !== null} onClick={() => setPicked(i)}>
              <span className="letter">{"أبجد"[i]}</span>
              {o}
            </motion.button>
          );
        })}
      </div>
      {picked !== null && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="row-between" style={{ flexWrap: "wrap" }}>
          <p className="small ink-2" style={{ flex: 1 }}>
            {item.q.explain}
          </p>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setPicked(null);
              setOffset((o) => o + 1);
            }}
          >
            سؤال آخر
          </button>
        </motion.div>
      )}
    </section>
  );
}
