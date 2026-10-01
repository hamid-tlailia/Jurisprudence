import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, ArrowRight, BookA, BookOpen, CheckCircle2, Clock, Dumbbell, Eye, FlaskConical, ListChecks, Share2, Sparkles, Text } from "lucide-react";
import { getLesson, getMasala, trackMeta, wingLessons, wings } from "../data";
import { useStore } from "../lib/store";
import { useAiPanel, AI_ACTIONS } from "../lib/aiPanel";
import { minutesLabel, num } from "../lib/format";
import { Markdown } from "../components/Markdown";
import { Quiz } from "../components/Quiz";
import { Accordion } from "../components/Accordion";
import { Verses } from "../components/Verses";
import { ShareSheet } from "../components/ShareSheet";
import NotFound from "./NotFound";

export default function LessonPage() {
  const { lessonId = "" } = useParams();
  const entry = getLesson(lessonId);
  const completeLesson = useStore((s) => s.completeLesson);
  const record = useStore((s) => s.completedLessons[lessonId]);
  const openAi = useAiPanel((p) => p.openAi);
  const [shareOpen, setShareOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  if (!entry) return <NotFound />;
  const { lesson, track, unit, wingIndex, wingTotal } = entry;
  const wing = wings[track.wing];
  const meta = trackMeta[track.id];
  const siblings = wingLessons(track.wing);
  const prev = siblings[wingIndex - 1];
  const next = siblings[wingIndex + 1];
  const ref = lesson.ref?.masalaId ? getMasala(lesson.ref.bookId, lesson.ref.masalaId) : undefined;

  const context = [
    `الدرس: ${lesson.title} (${track.title} — ${unit.title})`,
    lesson.summary,
    lesson.matn ? `النص:\n${lesson.matn.text}` : "",
    ...lesson.sections.map((s) => `## ${s.heading}\n${s.body}`),
  ]
    .filter(Boolean)
    .join("\n\n");

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84, behavior: "smooth" });
  };

  const hasPractice = (lesson.exercises?.length ?? 0) > 0;

  return (
    <div className="page page-narrow" style={{ ["--hue" as string]: meta.hue }}>
      <motion.div style={{ position: "fixed", top: 0, right: 0, left: 0, height: 3, background: meta.hue, transformOrigin: "right", scaleX: progressX, zIndex: 50 }} />

      <Link to={`/wing/${wing.id}`} className="small muted row" style={{ gap: 4, marginBottom: 16 }}>
        <ArrowRight size={14} /> {wing.title} · {unit.title}
      </Link>

      <header className="stack-sm" style={{ marginBottom: 20 }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className="chip" style={{ color: meta.hue }}>
            {track.title}
          </span>
          <span className="chip">
            الدرس {num(wingIndex + 1)} من {num(wingTotal)}
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
        <div className="row" style={{ gap: 8, marginTop: 4 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShareOpen(true)}>
            <Share2 size={15} /> مشاركة / تنزيل
          </button>
          <button className="btn btn-gold btn-sm" onClick={() => openAi({ title: lesson.title, context, mode: "expand" })}>
            <Sparkles size={15} /> اسأل المُعين
          </button>
        </div>
      </header>

      <div className="steps" style={{ marginBottom: 20 }}>
        {[
          { id: "study", label: "الدراسة", Icon: BookOpen },
          { id: hasPractice ? "practice" : "summary", label: hasPractice ? "التدريب" : "الخلاصة", Icon: Dumbbell },
          { id: "quiz", label: "الاختبار", Icon: FlaskConical },
        ].map((s, i) => (
          <button key={s.id} className={`step ${record ? "done" : i === 0 ? "on" : ""}`} onClick={() => scrollTo(s.id)}>
            <span className="step-n">{record ? "✓" : num(i + 1)}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="stack" style={{ gap: 14 }}>
        <div id="study" />
        {lesson.matn && (
          <section className="card card-pad stack">
            <div className="row-between">
              <h2 className="title-md">{lesson.matn.kind === "verse" ? "الأبيات" : lesson.matn.kind === "hadith" ? "نص الحديث" : "النص"}</h2>
              {lesson.matn.source && <span className="tiny muted">{lesson.matn.source}</span>}
            </div>
            {lesson.matn.kind === "verse" ? <Verses text={lesson.matn.text} /> : <div className="matn">{lesson.matn.text}</div>}
          </section>
        )}

        {lesson.vocab && lesson.vocab.length > 0 && (
          <Accordion title="المفردات" icon={<BookA size={17} />} meta={num(lesson.vocab.length)} defaultOpen>
            <div className="vocab">
              {lesson.vocab.map((v) => (
                <div key={v.term} className="vocab-item">
                  <div className="vocab-term">{v.term}</div>
                  <div className="small ink-2">{v.meaning}</div>
                </div>
              ))}
            </div>
          </Accordion>
        )}

        {lesson.sections.map((s, i) => (
          <Accordion key={i} title={s.heading} icon={<Text size={17} />} defaultOpen={i === 0}>
            <Markdown>{s.body}</Markdown>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 12 }}
              onClick={() => openAi({ title: `${lesson.title} — ${s.heading}`, context: `الدرس: ${lesson.title}\n## ${s.heading}\n${s.body}`, mode: "expand", prompt: "وسّع لي شرح هذا القسم." })}
            >
              <Sparkles size={14} /> توسّع في هذا القسم
            </button>
          </Accordion>
        ))}

        {lesson.examples && lesson.examples.length > 0 && (
          <Accordion title="أمثلة تطبيقية" icon={<Eye size={17} />} meta={num(lesson.examples.length)}>
            <div className="stack-sm" style={{ gap: 10 }}>
              {lesson.examples.map((e, i) => (
                <div key={i} className="example">
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{e.title}</div>
                  <Markdown>{e.body}</Markdown>
                </div>
              ))}
            </div>
          </Accordion>
        )}

        <section id="summary" className="card card-pad stack" style={{ scrollMarginTop: 90 }}>
          <h2 className="title-md row" style={{ gap: 10 }}>
            <ListChecks size={20} color="var(--accent)" /> الخلاصة
          </h2>
          <ul className="key-points">
            {lesson.keyPoints.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </section>

        {ref && (
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
        )}

        {hasPractice && (
          <Accordion id="practice" title="التدريبات" icon={<Dumbbell size={17} />} meta={num(lesson.exercises!.length)} defaultOpen>
            <div className="stack-sm" style={{ gap: 10 }}>
              {lesson.exercises!.map((e, i) => (
                <ExerciseItem key={i} n={i + 1} q={e.q} a={e.a} />
              ))}
            </div>
          </Accordion>
        )}

        <Accordion title="توسّع مع المُعين" icon={<Sparkles size={17} />}>
          <p className="small muted" style={{ marginBottom: 12 }}>
            اطلب شرحاً أوسع، أو أمثلة، أو مقارنة بين المذاهب، أو اختباراً إضافياً.
          </p>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            {AI_ACTIONS.filter((a) => track.wing === "fiqh" || a.mode !== "compare").map((a) => (
              <button key={a.mode} className="btn btn-ghost btn-sm" onClick={() => openAi({ title: lesson.title, context, mode: a.mode, prompt: a.prompt })}>
                {a.label}
              </button>
            ))}
          </div>
        </Accordion>

        <section className="card card-pad stack" id="quiz" style={{ scrollMarginTop: 90 }}>
          <h2 className="title-lg">اختبر فهمك</h2>
          <Quiz key={lesson.id} questions={lesson.quiz} hue={meta.hue} onFinish={(score, total) => completeLesson(lesson.id, score, total)} />
        </section>

        <AnimatePresence>
          {record && next && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Link to={`/lesson/${next.lesson.id}`} className="card card-hover card-pad row" style={{ gap: 16, borderColor: meta.hue }}>
                <div style={{ flex: 1 }}>
                  <div className="tiny" style={{ color: meta.hue, fontWeight: 700 }}>
                    الخطوة التالية · الدرس {num(next.wingIndex + 1)} من {num(wingTotal)}
                  </div>
                  <div className="title-md">{next.lesson.title}</div>
                  <div className="tiny muted">{next.unit.title}</div>
                </div>
                <span className="btn btn-primary" style={{ background: meta.hue }}>
                  تابع <ArrowLeft size={17} />
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="grid-2" style={{ marginTop: 4 }}>
          {prev ? (
            <Link to={`/lesson/${prev.lesson.id}`} className="card card-hover card-pad stack-sm" style={{ gap: 2 }}>
              <span className="tiny muted row" style={{ gap: 4 }}>
                <ArrowRight size={13} /> الدرس السابق
              </span>
              <span style={{ fontWeight: 700 }}>{prev.lesson.title}</span>
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
            </Link>
          )}
        </nav>
      </div>

      <ShareSheet entry={entry} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}

function ExerciseItem({ n, q, a }: { n: number; q: string; a: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="exercise">
      <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
        <span className="chip chip-accent" style={{ flexShrink: 0 }}>
          {num(n)}
        </span>
        <p style={{ fontWeight: 600, flex: 1 }}>{q}</p>
      </div>
      <AnimatePresence initial={false}>
        {shown ? (
          <motion.div key="a" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="answer">{a}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setShown((s) => !s)}>
        {shown ? "إخفاء الجواب" : "فكّر ثم أظهر الجواب"}
      </button>
    </div>
  );
}
