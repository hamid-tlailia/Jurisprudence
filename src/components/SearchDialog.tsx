import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, GraduationCap, Search, X } from "lucide-react";
import { search } from "../data";
import { num } from "../lib/format";

const QUICK = ["النية", "التيمم", "المرسل", "القياس", "المسح على الخفين", "الزكاة", "الشاذ", "عرفة"];

/** لوحة بحث مخصصة تفتح من أيقونة البحث أو Ctrl+K */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const hits = useMemo(() => search(q, 30), [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const go = (href: string) => {
    onClose();
    navigate(href);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" style={{ zIndex: 74 }} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="البحث"
            className="card"
            style={{ position: "fixed", zIndex: 75, top: "max(16px, 8vh)", insetInline: 16, margin: "0 auto", maxWidth: 640, maxHeight: "80dvh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "var(--shadow-lg)" }}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, hits.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
              if (e.key === "Enter" && hits[active]) go(hits[active].href);
            }}
          >
            <div className="row" style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
              <Search size={20} className="muted" />
              <input
                ref={inputRef}
                className="palette-input"
                placeholder="ابحث عن مسألة أو مصطلح أو حديث…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                aria-label="نص البحث"
              />
              <button className="icon-btn" onClick={onClose} aria-label="إغلاق">
                <X size={19} />
              </button>
            </div>
            <div style={{ overflowY: "auto", padding: 8 }}>
              {q.trim().length < 2 ? (
                <div className="stack-sm" style={{ padding: 10 }}>
                  <span className="small muted">عمليات بحث مقترحة</span>
                  <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                    {QUICK.map((w) => (
                      <button key={w} className="chip" style={{ padding: "6px 14px", fontSize: "0.88rem" }} onClick={() => setQ(w)}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              ) : hits.length === 0 ? (
                <p className="muted small" style={{ padding: 16 }}>
                  لا نتائج مطابقة.
                </p>
              ) : (
                <>
                  <p className="tiny muted" style={{ padding: "4px 12px" }}>
                    {num(hits.length)} نتيجة
                  </p>
                  {hits.map((h, i) => (
                    <button key={h.kind + h.id + h.subtitle} className={`hit ${i === active ? "on" : ""}`} style={{ width: "100%", textAlign: "start" }} onMouseEnter={() => setActive(i)} onClick={() => go(h.href)}>
                      <span className="acc-icon" style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0, background: "var(--accent-soft)", color: "var(--accent)" }}>
                        {h.kind === "lesson" ? <GraduationCap size={18} /> : <BookOpen size={18} />}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ fontWeight: 700, display: "block" }}>{h.title}</span>
                        <span className="tiny muted" style={{ display: "block" }}>
                          {h.kind === "lesson" ? "درس" : "مسألة"} · {h.subtitle}
                        </span>
                        <span className="small ink-2" style={{ display: "block", marginTop: 2 }}>
                          {h.snippet}
                        </span>
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
