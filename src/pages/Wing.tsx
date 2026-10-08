import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, BookMarked, Check, Clock, Library, ListTree } from "lucide-react";
import { matnCollections, nextInWing, trackMeta, wingLessons, wings, type Book, type Track, type WingId } from "../data";
import { useStore } from "../lib/store";
import { durationLabel, lessonsLabel, minutesLabel, num, pct } from "../lib/format";
import { Accordion } from "../components/Accordion";
import { Bar, ProgressRing } from "../components/ProgressRing";
import NotFound from "./NotFound";

export default function WingPage() {
  const { wingId = "" } = useParams();
  const wing = wings[wingId as WingId];
  const completed = useStore((s) => s.completedLessons);
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "texts" ? "texts" : "path";
  if (!wing) return <NotFound />;

  const list = wingLessons(wing.id);
  const done = list.filter((e) => completed[e.lesson.id]).length;
  const next = nextInWing(wing.id, completed);
  const remainingMin = list.filter((e) => !completed[e.lesson.id]).reduce((n, e) => n + e.lesson.minutes, 0);

  return (
    <div className="page page-narrow" style={{ ["--hue" as string]: wing.hue }}>
      <header className="card hero stack" style={{ marginBottom: 20 }}>
        <div className="pattern" />
        <div className="stack" style={{ position: "relative", alignItems: "center", textAlign: "center" }}>
          <div className="wing-glyph">{wing.glyph}</div>
          <div className="stack-sm" style={{ gap: 4, alignItems: "center" }}>
            <h1 className="title-xl">{wing.title}</h1>
            <p className="ink-2" style={{ maxWidth: 560 }}>
              {wing.description}
            </p>
          </div>
          <ProgressRing value={done / list.length} size={140} stroke={12} color={wing.hue}>
            <div>
              <div className="ring-value">{pct(done / list.length)}</div>
              <div className="ring-label">
                {num(done)} من {num(list.length)}
              </div>
            </div>
          </ProgressRing>
          {next ? (
            <>
              <span className="small muted">
                بقي {lessonsLabel(list.length - done)} · نحو {durationLabel(remainingMin)}
              </span>
              <Link to={`/lesson/${next.lesson.id}`} className="btn btn-primary" style={{ background: wing.hue }}>
                {done === 0 ? "ابدأ الدرس الأول" : `تابع: ${next.lesson.title}`} <ArrowLeft size={17} />
              </Link>
            </>
          ) : (
            <span className="chip chip-gold">ختمت هذا الجناح</span>
          )}
        </div>
      </header>

      <div className="row" style={{ justifyContent: "center", marginBottom: 20 }}>
        <div className="segmented" role="tablist">
          {[
            { id: "path", label: "المنهج", Icon: ListTree },
            { id: "texts", label: "المتون", Icon: Library },
          ].map(({ id, label, Icon }) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "on" : ""} onClick={() => setParams(id === "path" ? {} : { tab: id }, { replace: true })}>
              {tab === id && <motion.span layoutId="wing-tab" className="seg-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "path" ? (
        <div className="stack" style={{ gap: 28 }}>
          {wing.tracks.map((t, i) => (
            <TrackPath key={t.id} track={t} order={i + 1} completed={completed} nextId={next?.lesson.id} />
          ))}
        </div>
      ) : (
        <div className="stack">
          {wing.books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
          {matnCollections
            .filter((c) => c.wing === wing.id)
            .map((c) => (
              <Link key={c.id} to={`/matn/${c.id}`} className="card card-hover card-pad row" style={{ gap: 16 }}>
                <div className="track-glyph" style={{ ["--hue" as string]: "var(--gold)" }}>
                  <BookMarked size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="title-md">{c.title}</div>
                  <div className="small muted">
                    {c.author} · {num(c.items.length)} {c.kind === "verse" ? "مقطعاً" : "حديثاً"}
                  </div>
                </div>
                <ArrowLeft size={18} />
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}

function TrackPath({ track, order, completed, nextId }: { track: Track; order: number; completed: Record<string, unknown>; nextId?: string }) {
  const meta = trackMeta[track.id];
  const ids = track.units.flatMap((u) => u.lessons.map((l) => l.id));
  const done = ids.filter((id) => completed[id]).length;
  let counter = 0;
  const [openUnit, setOpenUnit] = useState<string | null>(() => track.units.find((u) => u.lessons.some((l) => l.id === nextId))?.id ?? null);

  return (
    <section className="stack" style={{ ["--hue" as string]: meta.hue }}>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <span className="here" style={{ background: meta.hue }}>
          المرحلة {num(order)}
        </span>
        <div style={{ flex: 1 }}>
          <h2 className="title-lg">{track.title}</h2>
          <p className="small" style={{ color: meta.hue, fontWeight: 600 }}>
            {track.tagline}
          </p>
        </div>
        <span className="small muted">
          {num(done)}/{num(ids.length)}
        </span>
      </div>
      <Bar value={done / ids.length} color={meta.hue} />

      <Accordion title="المصادر المعتمدة" icon={<Library size={17} />}>
        <ul className="key-points">
          {track.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Accordion>

      {track.units.map((u) => {
        const uDone = u.lessons.filter((l) => completed[l.id]).length;
        const startIndex = counter;
        counter += u.lessons.length;
        const hasNext = u.lessons.some((l) => l.id === nextId);
        return (
          <Accordion
            key={u.id}
            open={openUnit === u.id}
            onToggle={(o) => setOpenUnit(o ? u.id : null)}
            icon={uDone === u.lessons.length ? <Check size={17} /> : <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{num(uDone)}</span>}
            title={
              <span>
                {u.title}
                {hasNext && (
                  <span className="here" style={{ marginInlineStart: 8, background: meta.hue }}>
                    أنت هنا
                  </span>
                )}
              </span>
            }
            meta={`${num(uDone)}/${num(u.lessons.length)}`}
          >
            <div className="timeline" style={{ marginInline: -8 }}>
              {u.lessons.map((l, i) => {
                const isDone = !!completed[l.id];
                const isNext = l.id === nextId;
                return (
                  <Link key={l.id} to={`/lesson/${l.id}`} className="lesson-row" style={{ opacity: !isDone && !isNext ? 0.82 : 1 }}>
                    <span className={`lesson-node ${isDone ? "done" : isNext ? "next pulse" : ""}`}>{isDone ? <Check size={17} /> : num(startIndex + i + 1)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{l.title}</div>
                      <div className="tiny muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.summary}
                      </div>
                    </div>
                    <span className="tiny muted row" style={{ gap: 4, flexShrink: 0 }}>
                      <Clock size={12} /> {minutesLabel(l.minutes)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Accordion>
        );
      })}
    </section>
  );
}

function BookCard({ book }: { book: Book }) {
  const read = useStore((s) => s.readMasail);
  const total = book.chapters.reduce((n, c) => n + c.masail.length, 0);
  const done = Object.keys(read).filter((k) => k.startsWith(book.id + "/")).length;
  return (
    <Link to={`/library/${book.id}`} className="card card-hover card-pad stack" style={{ gap: 10 }}>
      <div className="row">
        <div className="track-glyph" style={{ ["--hue" as string]: "var(--gold)" }}>
          <BookMarked size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="title-md">{book.title}</div>
          <div className="small muted">
            {book.author} ({book.authorDates})
          </div>
        </div>
        {book.madhhab && <span className="chip chip-gold">{book.madhhab}</span>}
      </div>
      <p className="small ink-2">{book.description}</p>
      <div className="row-between tiny muted">
        <span>
          {num(done)} من {num(total)} مسألة
        </span>
        <span>{pct(done / total)}</span>
      </div>
      <Bar value={done / total} color="var(--gold)" />
    </Link>
  );
}

