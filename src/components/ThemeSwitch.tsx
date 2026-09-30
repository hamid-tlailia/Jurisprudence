import { motion } from "motion/react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useStore, type ThemeMode } from "../lib/store";

const options: { id: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "نهار", Icon: Sun },
  { id: "dark", label: "ليل", Icon: Moon },
  { id: "auto", label: "تلقائي", Icon: SunMoon },
];

export function ThemeSegmented({ layoutId = "theme-pill" }: { layoutId?: string }) {
  const theme = useStore((s) => s.settings.theme);
  const setSettings = useStore((s) => s.setSettings);
  return (
    <div className="segmented" role="radiogroup" aria-label="المظهر">
      {options.map(({ id, label, Icon }) => (
        <button key={id} role="radio" aria-checked={theme === id} className={theme === id ? "on" : ""} onClick={() => setSettings({ theme: id })}>
          {theme === id && <motion.span layoutId={layoutId} className="seg-pill" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}

/** زر سريع يدور بين الأوضاع الثلاثة */
export function ThemeCycleButton() {
  const theme = useStore((s) => s.settings.theme);
  const setSettings = useStore((s) => s.setSettings);
  const idx = options.findIndex((o) => o.id === theme);
  const cur = options[idx];
  const next = options[(idx + 1) % options.length];
  return (
    <button className="icon-btn" onClick={() => setSettings({ theme: next.id })} aria-label={`المظهر: ${cur.label}، انقر للتبديل إلى ${next.label}`} title={`المظهر: ${cur.label}`}>
      <motion.span key={cur.id} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.35 }} style={{ display: "grid" }}>
        <cur.Icon size={19} />
      </motion.span>
    </button>
  );
}
