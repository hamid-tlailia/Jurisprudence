import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

type Props = { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; labelledBy?: string };

/** نافذة مخصصة: لوحة سفلية على الجوال ونافذة وسطى على الحاسوب (بدل نوافذ المتصفح المدمجة) */
export function Sheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" style={{ zIndex: 74 }} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <div className="sheet-grip" />
            {title && (
              <div className="row-between" style={{ marginBottom: 12 }}>
                <h2 className="title-md">{title}</h2>
                <button className="icon-btn" onClick={onClose} aria-label="إغلاق">
                  <X size={19} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
