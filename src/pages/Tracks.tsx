import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { getTrack, tracks, trackMeta } from "../data";
import { useStore } from "../lib/store";
import { minutesLabel, num, pct } from "../lib/format";
import { Bar, ProgressRing } from "../components/ProgressRing";
import { stagger } from "../components/Reveal";
import NotFound from "./NotFound";

export function TracksPage() {
  const completed = useStore((s) => s.completedLessons);
  return (
    <div className="page">
      <header className="stack-sm" style={{ marginBottom: 28 }}>
        <span className="eyebrow">المسارات التعليمية</span>
        <h1 className="title-xl">اختر طريقك في الطلب</h1>
        <p className="ink-2" style={{ maxWidth: 620 }}>
          أربعة مسارات متكاملة، كل مسار مقسّم إلى وحدات ودروس قصيرة، يختم كل درس باختبار يثبّت الفهم.
        </p>
      </header>
      <motion.div className="grid-2" variants={stagger.container} initial="hidden" animate="show">
        {tracks.map((t) => {
          const ids = t.units.flatMap((u) => u.lessons.map((l) => l.id));
          const done = ids.filter((id) => completed[id]).length;
          const meta = trackMeta[t.id];
          return (
            <motion.div key={t.id} variants={stagger.item}>
              <Link to={`/tracks/${t.id}`} className="card card-hover track-card" style={{ ["--hue" as string]: meta.hue, padding: 26 }}>
                <div className="row-between" style={{ alignItems: "flex-start" }}>
                  <div className="track-glyph" style={{ width: 60, height: 60, fontSize: "2rem" }}>
                    {meta.glyph}
                  </div>
                  <ProgressRing value={done / ids.length} size={56} stroke={5} color={meta.hue}>
                    <span className="tiny" style={{ fontWeight: 700 }}>
                      {pct(done / ids.length)}
                    </span>
                  </ProgressRing>
                </div>
                <div className="stack-sm" style={{ gap: 4 }}>
                  <h2 className="title-lg">{t.title}</h2>
                  <p className="small" style={{ color: meta.hue, fontWeight: 600 }}>
                    {t.tagline}
                  </p>
                </div>
                <p className="small ink-2">{t.description}</p>
                <div className="row-between tiny muted">
                  <span>
                    {num(t.units.length)} وحدات · {num(ids.length)} درساً
                  </span>
                  <span className="row" style={{ gap: 4, color: "var(--ink)" }}>
                    {done ? "تابع" : "ابدأ"} <ArrowLeft size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function TrackPage() {
  const { trackId = "" } = useParams();
  const track = getTrack(trackId);
  const completed = useStore((s) => s.completedLessons);
  if (!track) return <NotFound />;
  const meta = trackMeta[track.id];
  const ids = track.units.flatMap((u) => u.lessons.map((l) => l.id));
  const done = ids.filter((id) => completed[id]).length;
  const nextId = ids.find((id) => !completed[id]);
  let counter = 0;

  return (
    <div className="page page-narrow" style={{ ["--hue" as string]: meta.hue }}>
      <Link to="/tracks" className="small muted row" style={{ gap: 4, marginBottom: 18 }}>
        <ArrowLeft size={14} style={{ transform: "scaleX(-1)" }} /> المسارات
      </Link>
      <header className="card hero stack" style={{ marginBottom: 28 }}>
        <div className="pattern" />
        <div className="row" style={{ position: "relative", alignItems: "flex-start" }}>
          <div className="track-glyph" style={{ width: 64, height: 64, fontSize: "2.1rem" }}>
            {meta.glyph}
          </div>
          <div className="stack-sm" style={{ gap: 4, flex: 1 }}>
            <h1 className="title-xl" style={{ fontSize: "2rem" }}>
              {track.title}
            </h1>
            <p className="ink-2 small">{track.description}</p>
          </div>
        </div>
        <div className="stack-sm" style={{ position: "relative" }}>
          <div className="row-between small">
            <span>
              أتممت {num(done)} من {num(ids.length)}
            </span>
            <span className="muted">{pct(done / ids.length)}</span>
          </div>
          <Bar value={done / ids.length} color={meta.hue} />
          {nextId && (
            <Link to={`/lesson/${nextId}`} className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: 8, background: meta.hue }}>
              {done ? "تابع من حيث توقفت" : "ابدأ المسار"} <ArrowLeft size={17} />
            </Link>
          )}
        </div>
      </header>

      <div className="stack" style={{ gap: 28 }}>
        {track.units.map((u, ui) => (
          <motion.section
            key={u.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: ui * 0.05 }}
          >
            <div className="row" style={{ marginBottom: 8, gap: 10 }}>
              <span className="chip" style={{ color: meta.hue }}>
                الوحدة {num(ui + 1)}
              </span>
              <h2 className="title-md">{u.title}</h2>
            </div>
            <div className="card timeline" style={{ padding: 8 }}>
              {u.lessons.map((l) => {
                counter++;
                const isDone = !!completed[l.id];
                const isNext = l.id === nextId;
                const rec = completed[l.id];
                return (
                  <Link key={l.id} to={`/lesson/${l.id}`} className="lesson-row" style={{ position: "relative" }}>
                    <span className={`lesson-node ${isDone ? "done" : isNext ? "next" : ""}`}>{isDone ? <Check size={17} /> : num(counter)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{l.title}</div>
                      <div className="tiny muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.summary}
                      </div>
                    </div>
                    <div className="stack-sm" style={{ alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                      <span className="tiny muted row" style={{ gap: 4 }}>
                        <Clock size={12} /> {minutesLabel(l.minutes)}
                      </span>
                      {rec && (
                        <span className="tiny" style={{ color: rec.score === rec.total ? "var(--success)" : "var(--gold)" }}>
                          {num(rec.score)} من {num(rec.total)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
