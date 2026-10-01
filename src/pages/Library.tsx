import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check, ChevronDown, Lightbulb, Sparkles } from "lucide-react";
import { getBook, trackMeta, type Book, type Masala } from "../data";
import { useStore } from "../lib/store";
import { useAiPanel, AI_ACTIONS } from "../lib/aiPanel";
import { num, pct } from "../lib/format";
import { Markdown } from "../components/Markdown";
import { Verses } from "../components/Verses";
import { Bar } from "../components/ProgressRing";
import NotFound from "./NotFound";

const countMasail = (b: Book) => b.chapters.reduce((n, c) => n + c.masail.length, 0);

export function Bookmarks({ keys }: { keys: string[] }) {
  return (
    <section>
      <div className="section-head">
        <h2 className="title-lg row" style={{ gap: 8 }}>
          <BookmarkCheck size={20} color="var(--gold)" /> المحفوظات
        </h2>
      </div>
      <div className="grid-2">
        {keys.map((k) => {
          const [bookId, id] = k.split("/");
          const b = getBook(bookId);
          const m = b?.chapters.flatMap((c) => c.masail).find((x) => x.id === id);
          if (!b || !m) return null;
          return (
            <Link key={k} to={`/library/${bookId}#${id}`} className="card card-hover card-pad row">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{m.title}</div>
                <div className="tiny muted">{b.title}</div>
              </div>
              <ArrowLeft size={17} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function BookPage() {
  const { bookId = "" } = useParams();
  const book = getBook(bookId);
  const location = useLocation();
  const read = useStore((s) => s.readMasail);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const id = decodeURIComponent(location.hash.slice(1));
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 120);
    return () => clearTimeout(t);
  }, [location.hash, bookId]);

  if (!book) return <NotFound />;
  const meta = trackMeta[book.field];
  const total = countMasail(book);
  const done = Object.keys(read).filter((k) => k.startsWith(book.id + "/")).length;

  return (
    <div className="page" style={{ ["--hue" as string]: meta.hue }}>
      <Link to="/wing/fiqh?tab=texts" className="small muted row" style={{ gap: 4, marginBottom: 18 }}>
        <ArrowRight size={14} /> الفقه وأصوله · المتون
      </Link>

      <header className="card hero stack" style={{ marginBottom: 28 }}>
        <div className="pattern" />
        <div className="stack-sm" style={{ position: "relative" }}>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            <span className="chip" style={{ color: meta.hue }}>
              {meta.short}
            </span>
            <span className="chip">{book.kind}</span>
            {book.madhhab && <span className="chip chip-gold">المذهب {book.madhhab}</span>}
          </div>
          <h1 className="title-xl">{book.title}</h1>
          <p className="small" style={{ fontWeight: 600 }}>
            {book.author} <span className="muted">({book.authorDates})</span>
          </p>
          <p className="ink-2" style={{ maxWidth: 680 }}>
            {book.description}
          </p>
          <div style={{ maxWidth: 360, marginTop: 6 }} className="stack-sm">
            <div className="row-between tiny muted">
              <span>
                قرأت {num(done)} من {num(total)} مسألة
              </span>
              <span>{pct(done / total)}</span>
            </div>
            <Bar value={done / total} color={meta.hue} />
          </div>
        </div>
      </header>

      <div className="reader">
        <div className="stack" style={{ gap: 36, minWidth: 0 }}>
          {book.chapters.map((ch) => (
            <section key={ch.id} className="stack" id={`ch-${ch.id}`}>
              <div className="ornament">
                <h2 className="title-md" style={{ color: "var(--ink)", fontFamily: "var(--font-classic)", fontSize: "1.4rem" }}>
                  {ch.title}
                </h2>
              </div>
              {ch.masail.map((m) => (
                <MasalaCard key={m.id} book={book} masala={m} initialOpen={location.hash === `#${m.id}`} />
              ))}
            </section>
          ))}
        </div>
        <aside className="reader-toc">
          <nav className="toc card" style={{ padding: 10 }} aria-label="فهرس الكتاب">
            <div className="tiny muted" style={{ padding: "6px 12px" }}>
              الفهرس
            </div>
            {book.chapters.map((ch) => (
              <div key={ch.id}>
                <a href={`#ch-${ch.id}`} style={{ fontWeight: 700, color: "var(--ink)" }}>
                  {ch.title}
                </a>
                {ch.masail.map((m) => (
                  <a key={m.id} href={`#${m.id}`} className="row" style={{ gap: 6, paddingInlineStart: 22 }}>
                    {read[`${book.id}/${m.id}`] && <Check size={12} color="var(--accent)" />}
                    {m.title}
                  </a>
                ))}
              </div>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}

function MasalaCard({ book, masala, initialOpen }: { book: Book; masala: Masala; initialOpen: boolean }) {
  const key = `${book.id}/${masala.id}`;
  const isRead = useStore((s) => !!s.readMasail[key]);
  const bookmarked = useStore((s) => s.bookmarks.includes(key));
  const readMasala = useStore((s) => s.readMasala);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const openAi = useAiPanel((p) => p.openAi);
  const [open, setOpen] = useState(initialOpen);
  const isVerse = book.kind === "نظم";
  const context = `المتن: ${book.title} لـ${book.author}${book.madhhab ? ` (المذهب ${book.madhhab})` : ""}\nالمسألة: ${masala.title}\n\nنص المتن:\n${masala.matn}\n\nالشرح المختصر:\n${masala.sharh}`;

  return (
    <motion.article
      id={masala.id}
      className="card card-pad stack"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ scrollMarginTop: 90 }}
    >
      <div className="row-between" style={{ alignItems: "flex-start" }}>
        <h3 className="title-md row" style={{ gap: 10 }}>
          {isRead && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "grid", color: "var(--accent)" }}>
              <Check size={18} />
            </motion.span>
          )}
          {masala.title}
        </h3>
        <button className="icon-btn" onClick={() => toggleBookmark(key)} aria-label={bookmarked ? "إزالة من المحفوظات" : "حفظ المسألة"} aria-pressed={bookmarked}>
          {bookmarked ? <BookmarkCheck size={19} color="var(--gold)" /> : <Bookmark size={19} />}
        </button>
      </div>

      {isVerse ? <Verses text={masala.matn} /> : <div className="matn">{masala.matn}</div>}

      <button className="btn btn-ghost" style={{ justifyContent: "space-between" }} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{open ? "إخفاء الشرح" : "اقرأ الشرح والفوائد"}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ display: "grid" }}>
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="stack">
              <Markdown>{masala.sharh}</Markdown>
              {masala.fawaid && masala.fawaid.length > 0 && (
                <div className="fawaid">
                  <div className="row small" style={{ gap: 6, fontWeight: 700, color: "var(--accent)" }}>
                    <Lightbulb size={16} /> فوائد وتنبيهات
                  </div>
                  {masala.fawaid.map((f, i) => (
                    <div key={i} className="fawaid-item">
                      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
                        <path d="M4 0l1.2 2.8L8 4 5.2 5.2 4 8 2.8 5.2 0 4l2.8-1.2z" fill="currentColor" />
                      </svg>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <hr className="divider" style={{ margin: "4px 0" }} />
      <div className="row-between" style={{ flexWrap: "wrap", gap: 10 }}>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {AI_ACTIONS.filter((a) => book.field === "fiqh" || a.mode !== "compare").map((a) => (
            <button key={a.mode} className="btn btn-ghost btn-sm" onClick={() => openAi({ title: masala.title, context, mode: a.mode, prompt: a.prompt })}>
              {a.mode === "expand" && <Sparkles size={14} />}
              {a.label}
            </button>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`btn btn-sm ${isRead ? "btn-ghost" : "btn-primary"}`}
          disabled={isRead}
          onClick={() => readMasala(book.id, masala.id)}
        >
          <Check size={15} /> {isRead ? "مقروءة" : "أتممت قراءتها"}
        </motion.button>
      </div>
    </motion.article>
  );
}

