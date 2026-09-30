import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { BookOpen, GraduationCap, Search as SearchIcon } from "lucide-react";
import { search } from "../data";
import { num } from "../lib/format";

const QUICK = ["النية", "التيمم", "المرسل", "القياس", "الإجماع", "الوضوء", "الشاذ", "النسخ"];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const hits = useMemo(() => search(q), [q]);

  const update = (v: string) => {
    setQ(v);
    setParams(v ? { q: v } : {}, { replace: true });
  };

  return (
    <div className="page page-narrow">
      <h1 className="title-xl" style={{ marginBottom: 18 }}>
        البحث
      </h1>
      <div className="row card" style={{ padding: "6px 16px", borderRadius: 16 }}>
        <SearchIcon size={20} className="muted" />
        <input
          autoFocus
          className="input"
          style={{ border: 0, background: "transparent", fontSize: "1.05rem" }}
          placeholder="ابحث عن مسألة أو مصطلح أو حديث…"
          value={q}
          onChange={(e) => update(e.target.value)}
          aria-label="نص البحث"
        />
      </div>

      {q.trim().length < 2 ? (
        <div className="stack" style={{ marginTop: 24 }}>
          <p className="small muted">عمليات بحث مقترحة:</p>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            {QUICK.map((w) => (
              <button key={w} className="chip" style={{ padding: "6px 14px", fontSize: "0.88rem" }} onClick={() => update(w)}>
                {w}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="stack" style={{ marginTop: 24 }}>
          <p className="small muted">{hits.length ? `${num(hits.length)} نتيجة` : "لا نتائج مطابقة."}</p>
          {hits.map((h, i) => (
            <motion.div key={h.kind + h.id + h.subtitle} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }}>
              <Link to={h.href} className="card card-hover card-pad row" style={{ alignItems: "flex-start", gap: 14 }}>
                <span className="track-glyph" style={{ ["--hue" as string]: h.kind === "lesson" ? "var(--accent)" : "var(--gold)", width: 40, height: 40, borderRadius: 12 }}>
                  {h.kind === "lesson" ? <GraduationCap size={19} /> : <BookOpen size={19} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{h.title}</div>
                  <div className="tiny muted" style={{ marginBottom: 4 }}>
                    {h.kind === "lesson" ? "درس" : "مسألة"} · {h.subtitle}
                  </div>
                  <p className="small ink-2">{h.snippet}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
