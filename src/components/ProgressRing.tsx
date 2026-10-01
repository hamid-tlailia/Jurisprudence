import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
};

/** حلقة تقدم متحركة (0..1) بخط واضح وأرضية ظاهرة، تتوسط حاويتها */
export function ProgressRing({ value, size = 140, stroke = 12, color = "var(--accent)", children }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, marginInline: "auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in oklab, var(--ink) 10%, transparent)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 6px color-mix(in oklab, ${color} 45%, transparent))` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: stroke, display: "grid", placeItems: "center", textAlign: "center" }}>{children}</div>
    </div>
  );
}

export function Bar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="bar">
      <motion.span
        style={{ background: color }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.max(0, Math.min(1, value)) }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
