import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

type Props = {
  title: ReactNode;
  icon?: ReactNode;
  meta?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
  id?: string;
  className?: string;
};

/** أكورديون بارتفاع متحرك سلس — للمحتويات الطويلة */
export function Accordion({ title, icon, meta, defaultOpen = false, open: controlled, onToggle, children, id, className }: Props) {
  const [inner, setInner] = useState(defaultOpen);
  const open = controlled ?? inner;
  const bodyId = useId();
  const toggle = () => {
    const next = !open;
    if (controlled === undefined) setInner(next);
    onToggle?.(next);
  };
  return (
    <section id={id} className={`acc ${open ? "open" : ""} ${className ?? ""}`} style={{ scrollMarginTop: 90 }}>
      <button className="acc-head" onClick={toggle} aria-expanded={open} aria-controls={bodyId}>
        {icon && <span className="acc-icon">{icon}</span>}
        <span style={{ minWidth: 0 }}>{title}</span>
        <span className="acc-meta">
          {meta}
          <motion.span className="acc-chev" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <ChevronDown size={19} />
          </motion.span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.38, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.25 } }}
            style={{ overflow: "hidden" }}
          >
            <div className="acc-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
