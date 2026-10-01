import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, FileDown, ImageDown, Loader2, Share2 } from "lucide-react";
import type { LessonEntry } from "../data";
import { downloadUrl, dataUrlToFile, nodeToPng, pngToPdf } from "../lib/share";
import { dateMedium } from "../lib/format";
import { Sheet } from "./Sheet";
import { Logo } from "./Logo";

type Action = "png" | "pdf" | "share" | "copy";

/** لوحة تنزيل الدرس صورةً أو PDF أو مشاركته */
export function ShareSheet({ entry, open, onClose }: { entry: LessonEntry; open: boolean; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<Action | null>(null);
  const [done, setDone] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { lesson, track } = entry;
  const name = `riwaq-${lesson.id}`;
  const text = [
    `📖 ${lesson.title}`,
    `${track.title} — الرواق`,
    "",
    lesson.matn ? lesson.matn.text : lesson.summary,
    "",
    ...lesson.keyPoints.map((k, i) => `${i + 1}. ${k}`),
  ].join("\n");

  const run = async (action: Action) => {
    setError(null);
    setBusy(action);
    try {
      if (action === "copy") {
        await navigator.clipboard.writeText(text);
      } else {
        const png = await nodeToPng(cardRef.current!);
        if (action === "png") await downloadUrl(png, `${name}.png`);
        if (action === "pdf") await pngToPdf(png, `${name}.pdf`);
        if (action === "share") {
          const file = await dataUrlToFile(png, `${name}.png`);
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: lesson.title, text: `${lesson.title} — الرواق` });
          } else if (navigator.share) {
            await navigator.share({ title: lesson.title, text, url: location.href });
          } else {
            await navigator.clipboard.writeText(text);
            setError("المشاركة غير مدعومة في هذا المتصفح، فنسخنا نص الدرس إلى الحافظة.");
          }
        }
      }
      setDone(action);
      setTimeout(() => setDone(null), 2200);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("تعذّر إتمام العملية، حاول مرة أخرى.");
    } finally {
      setBusy(null);
    }
  };

  const items: { a: Action; label: string; hint: string; Icon: typeof Share2 }[] = [
    { a: "share", label: "مشاركة", hint: "أرسل بطاقة الدرس عبر تطبيقاتك", Icon: Share2 },
    { a: "png", label: "تنزيل صورة", hint: "بطاقة PNG أنيقة للدرس", Icon: ImageDown },
    { a: "pdf", label: "تنزيل PDF", hint: "ملخص الدرس للطباعة والقراءة", Icon: FileDown },
    { a: "copy", label: "نسخ النص", hint: "المتن والخلاصة نصاً", Icon: Copy },
  ];

  return (
    <>
      <Sheet open={open} onClose={onClose} title="مشاركة الدرس وتنزيله">
        <div className="stack-sm" style={{ gap: 4 }}>
          {items.map(({ a, label, hint, Icon }) => (
            <button key={a} className="menu-item" onClick={() => run(a)} disabled={busy !== null}>
              <span className="mi-icon">{busy === a ? <Loader2 size={19} className="spin" /> : done === a ? <Check size={19} /> : <Icon size={19} />}</span>
              <span>
                <span style={{ fontWeight: 700, display: "block" }}>{label}</span>
                <span className="tiny muted">{hint}</span>
              </span>
            </button>
          ))}
          {error && (
            <p className="small" style={{ color: "var(--danger)", padding: "4px 14px" }}>
              {error}
            </p>
          )}
        </div>
      </Sheet>
      {open &&
        createPortal(
          <div className="share-stage" aria-hidden>
            <div className="share-card" ref={cardRef}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Logo size={84} />
                <div>
                  <div style={{ fontFamily: "var(--font-classic)", fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>الرِّواق</div>
                  <div style={{ fontSize: 24, color: "#7b847d" }}>{track.title}</div>
                </div>
                <div style={{ marginInlineStart: "auto", fontSize: 24, color: "#a07c3a", fontWeight: 600 }}>{dateMedium(new Date())}</div>
              </div>
              <div className="sc-title">{lesson.title}</div>
              <div style={{ fontSize: 30, lineHeight: 1.8, color: "#47554f" }}>{lesson.summary}</div>
              {lesson.matn && (
                <div className="sc-matn" style={{ textAlign: lesson.matn.kind === "verse" ? "center" : "right" }}>
                  {lesson.matn.kind === "verse" ? lesson.matn.text.replaceAll(" ... ", "     ") : lesson.matn.text}
                  {lesson.matn.source && <div style={{ fontFamily: "var(--font-ui)", fontSize: 22, color: "#7b847d", marginTop: 16 }}>{lesson.matn.source}</div>}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: "#1f5e4b" }}>الخلاصة</div>
                {lesson.keyPoints.map((k, i) => (
                  <div key={i} className="sc-point">
                    <span className="sc-dot">{i + 1}</span>
                    <span>{k}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "2px solid rgba(29,41,37,.1)", paddingTop: 24, fontSize: 22, color: "#7b847d", textAlign: "center" }}>
                الرواق — مدرسة الفقه والحديث
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
