import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useStore, type Toast } from "../lib/store";
import { NamedIcon } from "./Icon";

function ToastItem({ t }: { t: Toast }) {
  const dismiss = useStore((s) => s.dismissToast);
  useEffect(() => {
    const id = setTimeout(() => dismiss(t.id), t.kind === "xp" ? 1800 : 4200);
    return () => clearTimeout(id);
  }, [t, dismiss]);
  return (
    <motion.div
      layout
      className={`toast ${t.kind}`}
      initial={{ opacity: 0, y: -24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      onClick={() => dismiss(t.id)}
      role="status"
    >
      <motion.div
        className="toast-icon"
        initial={t.kind === "badge" ? { rotate: -30, scale: 0.4 } : false}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 12, delay: 0.1 }}
      >
        {t.kind === "xp" ? <Plus size={18} /> : <NamedIcon name={t.icon} size={18} />}
      </motion.div>
      <div>
        <div style={{ fontWeight: 700 }}>{t.title}</div>
        {t.body && <div className="tiny muted">{t.body}</div>}
      </div>
    </motion.div>
  );
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="toasts">
      <AnimatePresence>
        {toasts.slice(-3).map((t) => (
          <ToastItem key={t.id} t={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
