import { Link, useParams } from "react-router-dom";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, ListChecks, Sparkles } from "lucide-react";
import { allLessons, getLesson, getMasala, trackMeta } from "../data";
import { useStore } from "../lib/store";
import { useAiPanel, AI_ACTIONS } from "../lib/aiPanel";
import { minutesLabel, num } from "../lib/format";
import { Markdown } from "../components/Markdown";
import { Quiz } from "../components/Quiz";
import { Reveal } from "../components/Reveal";
import NotFound from "./NotFound";

export default function LessonPage() {
  const { lessonId = "" } = useParams();
  const entry = getLesson(lessonId);
  const completeLesson = useStore((s) => s.completeLesson);
  const record = useStore((s) => s.completedLessons[lessonId]);
  const openAi = useAiPanel((p) => p.openAi);
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  if (!entry) return <NotFound />;
  const { lesson, track, unit, index } = entry;
  const meta = trackMeta[track.id];
  const prev = allLessons[index - 1];
  const next = allLessons[index + 1];
  const ref = lesson.ref ? (lesson.ref.masalaId ? getMasala(lesson.ref.bookId, lesson.ref.masalaId) : undefined) : undefined;

  const context = [
    `الدرس: ${lesson.title} (مسار ${track.title} — ${unit.title})`,
    lesson.summary,
    ...lesson.sections.map((s) => `## ${s.heading}\n${s.body}`),
  ].join("\n\n");

  return (
    <div className="page page-narrow" style={{ ["--hue" as string]: meta.hue }}>
      <motion.div
        style={{ position: "fixed", top: 0, right: 0, left: 0, height: 3, background: meta.hue, transformOrigin: "right", scaleX: progressX, zIndex: 50 }}
      />
      <Link to={`/tracks/${track.id}`} className="small muted row" style={{ gap: 4, marginBottom: 18 }}>
        <ArrowRight size={14} /> {track.title} · {unit.title}
      </Link>

      <header className="stack-sm" style={{ marginBottom: 28 }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className="chip" style={{ color: meta.hue }}>
            {track.title}
          </span>
          <span className="chip">
            <Clock size={12} /> {minutesLabel(lesson.minutes)}
          </span>
          {record && (
            <span className="chip chip-accent">
              <CheckCircle2 size={12} /> مكتمل
            </span>
          )}
        </div>
        <h1 className="title-xl">{lesson.title}</h1>
        <p className="ink-2" style={{ fontSize: "1.05rem" }}>
          {lesson.summary}
        </p>
      </header>

      <div className="stack" style={{ gap: 18 }}>
        {lesson.sections.map((s, i) => (
          <Reveal key={i}>
            <section className="card card-pad">
              <div className="row-between" style={{ marginBottom: 12 }}>
                <h2 className="title-md row" style={{ gap: 10 }}>
                  <span style={{ width: 6, height: 22, borderRadius: 4, background: meta.hue, display: "inline-block" }} />
                  {s.heading}
                </h2>
                <button
                  className="icon-btn"
                  title="اسأل المُعين عن هذا القسم"
                  aria-label={`اسأل المُعين عن: ${s.heading}`}
                  onClick={() =>
                    openAi({
                      title: `${lesson.title} — ${s.heading}`,
                      context: `الدرس: ${lesson.title}\n## ${s.heading}\n${s.body}`,
                      mode: "expand",
                    })
                  }
                >
                  <Sparkles size={18} />
                </button>
              </div>
              <Markdown>{s.body}</Markdown>
            </section>
          </Reveal>
        ))}

        <Reveal>
          <section className="card card-pad stack">
            <h2 className="title-md row" style={{ gap: 10 }}>
              <ListChecks size={20} color="var(--accent)" /> الخلاصة
            </h2>
            <ul className="key-points">
              {lesson.keyPoints.map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          </section>
        </Reveal>

        {ref && (
          <Reveal>
            <Link to={`/library/${ref.book.id}#${ref.masala.id}`} className="card card-hover card-pad row" style={{ gap: 16 }}>
              <div className="track-glyph" style={{ ["--hue" as string]: "var(--gold)" }}>
                <BookOpen size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="tiny muted">للاستزادة من المتون</div>
                <div style={{ fontWeight: 700 }}>
                  {ref.book.title}: {ref.masala.title}
                </div>
              </div>
              <ArrowLeft size={18} />
            </Link>
          </Reveal>
        )}

        <Reveal>
          <section className="card card-pad stack" style={{ background: "linear-gradient(160deg, var(--accent-soft), var(--surface) 60%)" }}>
            <div className="row" style={{ gap: 12 }}>
              <div className="ai-orb">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="title-md">توسّع مع المُعين</h2>
                <p className="small muted">اطلب شرحاً أوسع، أو أمثلة، أو مقارنة بين المذاهب.</p>
              </div>
            </div>
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              {AI_ACTIONS.map((a) => (
                <button key={a.mode} className="btn btn-ghost btn-sm" onClick={() => openAi({ title: lesson.title, context, mode: a.mode, prompt: a.prompt })}>
                  {a.label}
                </button>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="card card-pad stack" id="quiz">
            <h2 className="title-lg">اختبر فهمك</h2>
            <Quiz key={lesson.id} questions={lesson.quiz} hue={meta.hue} onFinish={(score, total) => completeLesson(lesson.id, score, total)} />
          </section>
        </Reveal>

        <nav className="grid-2" style={{ marginTop: 8 }}>
          {prev ? (
            <Link to={`/lesson/${prev.lesson.id}`} className="card card-hover card-pad stack-sm" style={{ gap: 2 }}>
              <span className="tiny muted row" style={{ gap: 4 }}>
                <ArrowRight size={13} /> الدرس السابق
              </span>
              <span style={{ fontWeight: 700 }}>{prev.lesson.title}</span>
              <span className="tiny muted">{prev.track.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/lesson/${next.lesson.id}`} className="card card-hover card-pad stack-sm" style={{ gap: 2, textAlign: "left" }}>
              <span className="tiny muted row" style={{ gap: 4, justifyContent: "flex-end" }}>
                الدرس التالي <ArrowLeft size={13} />
              </span>
              <span style={{ fontWeight: 700 }}>{next.lesson.title}</span>
              <span className="tiny muted">
                {next.track.title} · {num(next.lesson.quiz.length)} أسئلة
              </span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
