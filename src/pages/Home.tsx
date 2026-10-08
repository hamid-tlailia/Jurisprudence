import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, Flame, Info, Lightbulb, RotateCcw, Share2, Sparkles, Target } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { allLessons, getLesson, getMasala, nextInWing, wingLessons, wingList, type Wing } from "../data";
import type { PlanTask } from "../data/plans";
import { useStore } from "../lib/store";
import { currentStreak, dailyPick, dayKey, isTaskDone, lastDays, levelFor, planProgress } from "../lib/progress";
import { durationLabel, greeting, hijriDate, lessonsLabel, minutesLabel, num, pct, weekdayShort } from "../lib/format";
import { useAiPanel } from "../lib/aiPanel";
import { Bar, ProgressRing } from "../components/ProgressRing";
import { ShareSheet } from "../components/ShareSheet";
import { PointsInfo } from "../components/PointsInfo";
import { stagger } from "../components/Reveal";

export default function Home() {
  const { xp, activity, dailyGoal, name, completed } = useStore(
    useShallow((s) => ({ xp: s.xp, activity: s.activity, dailyGoal: s.dailyGoal, name: s.settings.name, completed: s.completedLessons })),
  );
  const lvl = levelFor(xp);
  const streak = currentStreak(activity);
  const todayXp = activity[dayKey()] ?? 0;
  const week = lastDays(activity, 7);
  const isNew = Object.keys(completed).length === 0;
  const [pointsOpen, setPointsOpen] = useState(false);

  return (
    <div className="page">
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="stack" style={{ gap: 20 }}>
        {/* التحية والهدف اليومي */}
        <motion.section variants={stagger.item} className="card hero">
          <div className="pattern" />
          <div style={{ position: "relative" }} className="stack">
            <div className="stack-sm" style={{ gap: 4, textAlign: "center", alignItems: "center" }}>
              <span className="eyebrow">{hijriDate()}</span>
              <h1 className="title-xl">
                {greeting()}
                {name ? `، ${name}` : ""}
              </h1>
              <p className="ink-2 small" style={{ maxWidth: 520 }}>
                «من سلك طريقاً يلتمس فيه علماً سهّل الله له به طريقاً إلى الجنة» — رواه مسلم
              </p>
            </div>

            <div className="ring-wrap">
              <ProgressRing value={Math.min(1, todayXp / dailyGoal)} size={150} stroke={13}>
                <div>
                  <div className="ring-value">{num(todayXp)}</div>
                  <div className="ring-label">من {num(dailyGoal)} نقطة</div>
                </div>
              </ProgressRing>
              <span className="small" style={{ fontWeight: 600 }}>
                {todayXp >= dailyGoal ? "حققت هدف اليوم، بارك الله فيك" : `بقي ${num(dailyGoal - todayXp)} نقطة لهدف اليوم`}
              </span>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 12, textAlign: "center" }}>
              <div className="stat" style={{ alignItems: "center" }}>
                <span className="stat-value row" style={{ gap: 6 }}>
                  <Flame size={20} color="var(--gold)" /> {num(streak)}
                </span>
                <span className="stat-label">أيام متتالية</span>
              </div>
              <button className="stat" style={{ alignItems: "center" }} onClick={() => setPointsOpen(true)} aria-label="ما فائدة النقاط؟">
                <span className="stat-value">{num(xp)}</span>
                <span className="stat-label row" style={{ gap: 4 }}>
                  مجموع النقاط <Info size={12} />
                </span>
              </button>
              <div className="stat" style={{ alignItems: "center" }}>
                <span className="stat-value">{num(lvl.level)}</span>
                <span className="stat-label">{lvl.title}</span>
              </div>
            </div>

            <div className="week-strip" aria-label="نشاط الأسبوع">
              {week.map((d, i) => (
                <div key={d.key} className="week-day">
                  <motion.div
                    className={`week-dot ${d.xp > 0 ? "on" : ""} ${i === 6 ? "today" : ""}`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 320, damping: 22 }}
                  >
                    {d.xp > 0 ? <Check size={16} /> : null}
                  </motion.div>
                  <span>{weekdayShort(d.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {isNew && (
          <motion.section variants={stagger.item} className="card card-pad stack">
            <h2 className="title-lg">كيف تبدأ؟</h2>
            <div className="start-steps">
              <div className="start-step">
                <span className="n">1</span>
                <div>
                  <div style={{ fontWeight: 700 }}>اختر جناحاً</div>
                  <div className="small muted">الفقه، أو الحديث، أو القرآن وتجويده. كل جناح منهج متدرج مستقل.</div>
                </div>
              </div>
              <div className="start-step">
                <span className="n">2</span>
                <div>
                  <div style={{ fontWeight: 700 }}>ادرس ثم تدرّب</div>
                  <div className="small muted">المتن، والمفردات، والشرح، والأمثلة، ثم التدريبات.</div>
                </div>
              </div>
              <div className="start-step">
                <span className="n">3</span>
                <div>
                  <div style={{ fontWeight: 700 }}>اختبر وانتقل</div>
                  <div className="small muted">أتمّ الاختبار لتُحسب لك الدرس، ثم انتقل للدرس التالي.</div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* الجناحان: أين أنت وماذا بقي */}
        <motion.div variants={stagger.item} className="row-between" style={{ marginTop: 8 }}>
          <h2 className="title-lg">{isNew ? "ابدأ من هنا" : "تابع رحلتك"}</h2>
        </motion.div>
        <div className="grid-wings">
          {wingList.map((w) => (
            <motion.div key={w.id} variants={stagger.item}>
              <WingProgressCard wing={w} completed={completed} />
            </motion.div>
          ))}
        </div>

        <div className="grid-2" style={{ alignItems: "start" }}>
          <motion.div variants={stagger.item}>
            <TodayPlan />
          </motion.div>
          <motion.div variants={stagger.item}>
            <DailyBenefit />
          </motion.div>
        </div>

        <motion.div variants={stagger.item}>
          <ReviewQuestion />
        </motion.div>
      </motion.div>
      <PointsInfo open={pointsOpen} onClose={() => setPointsOpen(false)} />
    </div>
  );
}

function WingProgressCard({ wing, completed }: { wing: Wing; completed: Record<string, unknown> }) {
  const list = wingLessons(wing.id);
  const done = list.filter((e) => completed[e.lesson.id]).length;
  const next = nextInWing(wing.id, completed);
  const remaining = list.filter((e) => !completed[e.lesson.id]);
  const remainingMin = remaining.reduce((n, e) => n + e.lesson.minutes, 0);

  return (
    <div className="card wing-card" style={{ ["--hue" as string]: wing.hue, height: "100%" }}>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div className="wing-glyph">{wing.glyph}</div>
        <div style={{ flex: 1 }}>
          <h3 className="title-lg">{wing.title}</h3>
          <p className="small muted">{wing.tagline}</p>
        </div>
      </div>

      <div className="stack-sm">
        <div className="row-between small">
          <span style={{ fontWeight: 600 }}>
            {num(done)} من {num(list.length)} درساً
          </span>
          <span style={{ color: wing.hue, fontWeight: 700 }}>{pct(done / list.length)}</span>
        </div>
        <Bar value={done / list.length} color={wing.hue} />
        {remaining.length > 0 && (
          <span className="tiny muted">
            بقي {lessonsLabel(remaining.length)} · نحو {durationLabel(remainingMin)}
          </span>
        )}
      </div>

      {next ? (
        <Link to={`/lesson/${next.lesson.id}`} className="task" style={{ background: "var(--surface)" }}>
          <span className="here">{done === 0 ? "البداية" : "أنت هنا"}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{next.lesson.title}</div>
            <div className="tiny muted">
              الدرس {num(next.wingIndex + 1)} · {next.unit.title}
            </div>
          </div>
          <ArrowLeft size={18} />
        </Link>
      ) : (
        <p className="small" style={{ color: wing.hue, fontWeight: 700 }}>
          ختمت هذا الجناح — ما شاء الله!
        </p>
      )}

      <div className="row" style={{ gap: 8 }}>
        {next && (
          <Link to={`/lesson/${next.lesson.id}`} className="btn btn-primary" style={{ background: wing.hue, flex: 1 }}>
            {done === 0 ? "ابدأ الدرس الأول" : "تابع"} <ArrowLeft size={17} />
          </Link>
        )}
        <Link to={`/wing/${wing.id}`} className="btn btn-ghost" style={{ flex: next ? undefined : 1 }}>
          المنهج كاملاً
        </Link>
      </div>
    </div>
  );
}

function TodayPlan() {
  const s = useStore();
  const pp = s.activePlan ? planProgress(s, s.activePlan.id) : null;
  const [shareId, setShareId] = useState<string | null>(null);
  const tasks = pp && !pp.finished ? pp.plan.days[pp.currentDay] : [];
  const firstLesson = tasks.find((t) => t.type === "lesson");
  const shareEntry = shareId ? getLesson(shareId) : undefined;

  return (
    <section className="card card-pad stack" style={{ height: "100%" }}>
      <div className="row-between">
        <div className="row" style={{ gap: 10 }}>
          <Target size={20} color="var(--accent)" />
          <h2 className="title-md">ورد اليوم</h2>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {pp && (
            <span className="chip chip-accent">
              اليوم {num(pp.currentDay + 1)} من {num(pp.plan.days.length)}
            </span>
          )}
          {firstLesson && (
            <button className="icon-btn" aria-label="مشاركة درس اليوم أو تنزيله" title="مشاركة / تنزيل" onClick={() => setShareId(firstLesson.id)}>
              <Share2 size={18} />
            </button>
          )}
        </div>
      </div>

      {pp ? (
        pp.finished ? (
          <p className="muted">أتممت الخطة «{pp.plan.title}». اختر خطة جديدة من صفحة الخطط.</p>
        ) : (
          <>
            <p className="small muted">{pp.plan.title}</p>
            <div className="stack-sm">
              {tasks.map((t, i) => (
                <TaskRow key={i} task={t} />
              ))}
            </div>
            <Bar value={pp.ratio} />
          </>
        )
      ) : (
        <>
          <p className="small muted">اختر خطة دراسية ليظهر لك هنا وِرد كل يوم، مع إمكانية تنزيله أو مشاركته.</p>
          <Link to="/plans" className="btn btn-ghost">
            اختر خطة دراسية <ArrowLeft size={16} />
          </Link>
        </>
      )}
      {shareEntry && <ShareSheet entry={shareEntry} open={!!shareId} onClose={() => setShareId(null)} />}
    </section>
  );
}

function TaskRow({ task }: { task: PlanTask }) {
  const done = useStore((s) => isTaskDone(s, task));
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
            {e.track.title} · {minutesLabel(e.lesson.minutes)}
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

function DailyBenefit() {
  const openAi = useAiPanel((p) => p.openAi);
  const item = useMemo(() => {
    const pool = allLessons.flatMap((e) => e.lesson.keyPoints.map((k) => ({ k, e })));
    return dailyPick(pool, 7);
  }, []);
  return (
    <section className="card card-pad stack" style={{ height: "100%" }}>
      <div className="row" style={{ gap: 10 }}>
        <Lightbulb size={20} color="var(--gold)" />
        <h2 className="title-md">فائدة اليوم</h2>
      </div>
      <p style={{ fontFamily: "var(--font-classic)", fontSize: "1.3rem", lineHeight: 2 }}>{item.k}</p>
      <div className="row-between" style={{ flexWrap: "wrap" }}>
        <Link to={`/lesson/${item.e.lesson.id}`} className="small ink-2">
          من درس: {item.e.lesson.title}
        </Link>
        <button
          className="btn btn-gold btn-sm"
          onClick={() => openAi({ title: item.e.lesson.title, context: `${item.e.lesson.title}\n${item.e.lesson.summary}\n\nالفائدة: ${item.k}`, mode: "expand", prompt: "اشرح لي هذه الفائدة ووجهها." })}
        >
          <Sparkles size={15} /> اشرحها لي
        </button>
      </div>
    </section>
  );
}

/** يرتب الأسئلة ترتيباً ثابتاً خلال اليوم ويتغير من يوم لآخر */
function shuffleForDay<T>(items: T[], day: string): T[] {
  let h = 0;
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * سؤال المراجعة: من الدروس المكتملة فقط، بلا تكرار في اليوم نفسه.
 * إذا انتهت الأسئلة المتاحة تُغلق المراجعة حتى الغد أو حتى إتمام درس جديد.
 */
function ReviewQuestion() {
  const completed = useStore((s) => s.completedLessons);
  const review = useStore((s) => s.review);
  const markReviewed = useStore((s) => s.markReviewed);
  const today = dayKey();
  const done = review.day === today ? review.done : [];

  const pool = useMemo(() => {
    const items = allLessons
      .filter((e) => completed[e.lesson.id])
      .flatMap((e) => e.lesson.quiz.map((q, i) => ({ id: `${e.lesson.id}:${i}`, q, lesson: e.lesson })));
    return shuffleForDay(items, today);
  }, [completed, today]);

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const remaining = pool.filter((p) => !done.includes(p.id));
  // السؤال المعروض: الذي أُجيب عنه للتو (ليرى المستخدم الشرح)، وإلا أول سؤال لم يُجب عنه
  const item = (currentId && pool.find((p) => p.id === currentId)) || remaining[0];

  const header = (
    <div className="row-between" style={{ flexWrap: "wrap" }}>
      <div className="row" style={{ gap: 10 }}>
        <RotateCcw size={19} color="var(--accent)" />
        <h2 className="title-md">سؤال المراجعة</h2>
      </div>
      {pool.length > 0 && (
        <span className="chip">
          {num(Math.min(done.length, pool.length))} / {num(pool.length)} اليوم
        </span>
      )}
    </div>
  );

  if (pool.length === 0) {
    return (
      <section className="card card-pad stack">
        {header}
        <p className="small muted">أتمم درساً واحداً على الأقل لتظهر لك هنا أسئلة تراجع بها ما تعلمته.</p>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="card card-pad stack">
        {header}
        <div className="row" style={{ gap: 12 }}>
          <span className="check" style={{ background: "var(--accent)", borderColor: "transparent", color: "var(--accent-ink)" }}>
            <Check size={15} />
          </span>
          <div>
            <div style={{ fontWeight: 700 }}>أتممت مراجعة اليوم، بارك الله فيك</div>
            <div className="small muted">تعود الأسئلة غداً، أو تظهر أسئلة جديدة حين تُتمّ درساً جديداً.</div>
          </div>
        </div>
      </section>
    );
  }

  const answered = picked !== null && currentId === item.id;
  const choose = (i: number) => {
    if (answered) return;
    setCurrentId(item.id);
    setPicked(i);
    markReviewed(item.id);
  };
  const next = () => {
    setCurrentId(null);
    setPicked(null);
  };

  return (
    <section className="card card-pad stack">
      {header}
      <span className="tiny muted">من درس: {item.lesson.title}</span>
      <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>{item.q.q}</p>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        {item.q.options.map((o, i) => {
          const state = !answered ? "" : i === item.q.answer ? "correct" : i === picked ? "wrong" : "";
          return (
            <motion.button key={item.id + i} whileTap={{ scale: 0.98 }} className={`option ${state}`} disabled={answered} onClick={() => choose(i)}>
              <span className="letter">{"أبجدهو"[i]}</span>
              {o}
            </motion.button>
          );
        })}
      </div>
      {answered && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="row-between" style={{ flexWrap: "wrap" }}>
          <p className="small ink-2" style={{ flex: 1 }}>
            {item.q.explain}
          </p>
          <button className="btn btn-ghost btn-sm" onClick={next}>
            {remaining.length > 0 ? "السؤال التالي" : "إنهاء المراجعة"}
          </button>
        </motion.div>
      )}
    </section>
  );
}
