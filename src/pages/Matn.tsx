import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { getCollection } from "../data";
import { useStore } from "../lib/store";
import { num } from "../lib/format";
import { Verses } from "../components/Verses";
import NotFound from "./NotFound";

/** قراءة المتن كاملاً (البيقونية أو الأربعين) مع روابط إلى شرح كل موضع */
export default function MatnPage() {
  const { id = "" } = useParams();
  const c = getCollection(id);
  const completed = useStore((s) => s.completedLessons);
  if (!c) return <NotFound />;
  return (
    <div className="page page-narrow" style={{ ["--hue" as string]: "var(--c-hadith)" }}>
      <Link to="/wing/hadith?tab=texts" className="small muted row" style={{ gap: 4, marginBottom: 18 }}>
        <ArrowRight size={14} /> الحديث وعلومه · المتون
      </Link>
      <header className="stack-sm" style={{ marginBottom: 24, textAlign: "center", alignItems: "center" }}>
        <h1 className="title-xl">{c.title}</h1>
        <p className="muted">
          {c.author} · {num(c.items.length)} {c.kind === "verse" ? "مقطعاً" : "حديثاً"}
        </p>
      </header>
      <div className="stack">
        {c.items.map((it) => (
          <article key={it.lessonId} className="card card-pad stack content-auto">
            <div className="row-between">
              <h2 className="title-md row" style={{ gap: 8 }}>
                {completed[it.lessonId] && <Check size={17} color="var(--accent)" />}
                {it.title}
              </h2>
              {it.source && <span className="tiny muted">{it.source}</span>}
            </div>
            {c.kind === "verse" ? <Verses text={it.text} /> : <div className="matn">{it.text}</div>}
            <Link to={`/lesson/${it.lessonId}`} className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
              اقرأ الشرح <ArrowLeft size={15} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
