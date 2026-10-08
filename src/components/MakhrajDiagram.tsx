import { useId } from "react";
import { motion } from "motion/react";
import type { MakhrajId } from "../data/makharij";

/**
 * رسم توضيحي لمقطع جانبي من الرأس (الوجه إلى اليسار) يبيّن موضع المخرج.
 * رسم أصلي بسيط يتلوّن مع المظهر الليلي والنهاري، ويعمل دون اتصال.
 */

/** نقاط المخارج على الرسم الجانبي */
const POINTS: Partial<Record<MakhrajId, [number, number]>> = {
  "halq-aqsa": [209, 243],
  "halq-wasat": [210, 212],
  "halq-adna": [208, 180],
  qaf: [193, 146],
  kaf: [178, 137],
  shajari: [134, 129],
  dad: [150, 132],
  lam: [96, 135],
  nun: [84, 139],
  ra: [104, 133],
  nitei: [78, 134],
  asali: [70, 154],
  lathawi: [66, 146],
  fa: [55, 150],
  shafatan: [43, 148],
  khayshum: [128, 108],
};

/** شرائح الحلق الثلاث تُظلَّل مع النقطة */
const HALQ: Partial<Record<MakhrajId, [number, number]>> = {
  "halq-aqsa": [228, 258],
  "halq-wasat": [196, 228],
  "halq-adna": [164, 196],
};

const AIR =
  "M60 147C63 137 71 132 80 131L180 127C200 131 213 141 218 156L226 300H196L192 236C188 222 182 214 176 211L82 189C70 182 62 164 60 147Z";

export function MakhrajDiagram({ id, size = 300 }: { id: MakhrajId; size?: number }) {
  const uid = useId().replace(/:/g, "");
  const pt = POINTS[id];
  const band = HALQ[id];
  return (
    <svg viewBox="0 0 320 300" width={size} height={(size * 300) / 320} className="makhraj-svg" role="img" aria-label="رسم جانبي للفم والحلق يبيّن موضع المخرج">
      <defs>
        <radialGradient id={`glow-${uid}`}>
          <stop offset="0%" stopColor="var(--dg-mark)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--dg-mark)" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`air-${uid}`}>
          <path d={AIR} />
        </clipPath>
      </defs>

      {/* الرأس */}
      <path
        d="M96 0C92 30 84 50 72 62C60 78 42 95 29 107C22 114 26 122 36 122C44 122 50 121 56 123C54 128 46 132 42 138C40 142 44 146 50 147C44 149 40 153 42 158C44 164 52 168 56 172C50 182 50 196 58 204C70 214 100 218 130 220C150 222 166 236 170 300H266C262 252 268 206 288 170C306 136 318 84 316 0Z"
        fill="var(--dg-skin)"
        stroke="var(--dg-stroke)"
        strokeWidth="1.2"
      />
      {/* فقرات العنق */}
      {[150, 182, 214, 246, 278].map((y) => (
        <rect key={y} x="240" y={y} width="24" height="26" rx="6" fill="var(--dg-bone)" stroke="var(--dg-stroke)" strokeWidth="0.7" />
      ))}
      {/* فتحة الأنف */}
      <ellipse cx="41" cy="117" rx="6" ry="2.6" fill="var(--dg-stroke)" opacity="0.55" />

      {/* تجويف الأنف (الخيشوم) */}
      <path
        d="M57 119C74 104 100 95 140 97C176 99 206 108 224 123L218 133C190 124 150 120 110 121C86 122 70 122 57 121Z"
        fill="var(--dg-air)"
        stroke="var(--dg-stroke)"
        strokeWidth="0.8"
      />
      {/* الفك السفلي */}
      <path d="M60 178C70 194 92 204 132 210L134 216C92 212 66 202 56 186Z" fill="var(--dg-bone)" stroke="var(--dg-stroke)" strokeWidth="0.6" />

      {/* تجويف الفم والحلق */}
      <path d={AIR} fill="var(--dg-air)" stroke="var(--dg-stroke)" strokeWidth="0.9" />
      {id === "jawf" && (
        <motion.path
          d={AIR}
          fill="var(--dg-mark)"
          initial={{ opacity: 0.12 }}
          animate={{ opacity: [0.18, 0.38, 0.18] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {band && (
        <g clipPath={`url(#air-${uid})`}>
          <motion.rect
            x="186"
            width="44"
            y={band[0]}
            height={band[1] - band[0]}
            fill="var(--dg-mark)"
            animate={{ opacity: [0.2, 0.42, 0.2] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      )}

      {/* الحنك الصلب */}
      <path d="M70 126C100 121 150 120 182 123L182 130C150 127 100 128 74 134Z" fill="var(--dg-bone)" stroke="var(--dg-stroke)" strokeWidth="0.8" />
      {/* اللثة خلف الثنايا */}
      <path d="M70 127C77 125 84 127 87 132L74 135Z" fill="var(--dg-gum)" stroke="var(--dg-stroke)" strokeWidth="0.6" />
      {/* الحنك اللين واللهاة */}
      <path d="M181 123C197 125 211 135 215 150C216 161 208 166 203 159C199 149 192 138 181 130Z" fill="var(--dg-soft)" stroke="var(--dg-stroke)" strokeWidth="0.8" />

      {/* اللسان */}
      <path
        d="M73 156C77 146 88 141 100 139C122 134 150 131 170 137C187 142 197 156 199 172C201 188 197 204 191 213L177 211C150 204 112 196 84 189C73 183 69 169 73 156Z"
        fill="var(--dg-tongue)"
        stroke="var(--dg-stroke)"
        strokeWidth="0.9"
      />
      <path d="M100 146C130 140 160 141 182 152" fill="none" stroke="var(--dg-stroke)" strokeWidth="0.6" opacity="0.5" />
      {/* لسان المزمار */}
      <path d="M191 214C196 202 203 197 207 204C203 211 199 217 195 224Z" fill="var(--dg-soft)" stroke="var(--dg-stroke)" strokeWidth="0.7" />

      {/* الثنايا العليا والسفلى */}
      <path d="M66 123C70 123 74 125 74 130L72 146C70 149 66 149 64 146L62 130C62 126 64 123 66 123Z" fill="var(--dg-tooth)" stroke="var(--dg-stroke)" strokeWidth="0.9" />
      <path d="M64 151H70C72 153 72 157 71 161L69 172C68 175 64 175 63 172L62 157C62 153 62 152 64 151Z" fill="var(--dg-tooth)" stroke="var(--dg-stroke)" strokeWidth="0.9" />

      {pt && (
        <g>
          <circle cx={pt[0]} cy={pt[1]} r="18" fill={`url(#glow-${uid})`} />
          <motion.circle
            cx={pt[0]}
            cy={pt[1]}
            r="5"
            fill="none"
            stroke="var(--dg-mark)"
            strokeWidth="2"
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: [1, 2.4], opacity: [0.9, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            style={{ transformOrigin: `${pt[0]}px ${pt[1]}px` }}
          />
          <circle cx={pt[0]} cy={pt[1]} r="4.2" fill="var(--dg-mark)" stroke="var(--dg-tooth)" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  );
}

/**
 * منظر علوي للّسان داخل قوس الأسنان العليا: يوضّح الحافة (للضاد) وأدنى الحافة إلى الطرف (للّام).
 */
export function TongueTopView({ id, size = 150 }: { id: "dad" | "lam"; size?: number }) {
  // الأسنان على قوس: الأمام إلى الأعلى
  const teeth: { x: number; y: number; r: number }[] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const t = Math.PI * (0.06 + (0.88 * i) / (n - 1));
    const molar = i < 4 || i > n - 5;
    teeth.push({ x: 80 - 52 * Math.cos(t), y: 112 - 92 * Math.sin(t) + 10, r: molar ? 7.2 : 5 });
  }
  return (
    <svg viewBox="0 0 160 150" width={size} height={(size * 150) / 160} className="makhraj-svg" role="img" aria-label="منظر علوي للسان داخل قوس الأسنان">
      <path d="M22 140C20 70 44 16 80 14C116 16 140 70 138 140Z" fill="var(--dg-gum)" stroke="var(--dg-stroke)" strokeWidth="1" opacity="0.7" />
      {teeth.map((t, i) => (
        <circle key={i} cx={t.x} cy={t.y} r={t.r} fill="var(--dg-tooth)" stroke="var(--dg-stroke)" strokeWidth="0.8" />
      ))}
      {/* اللسان */}
      <path d="M44 146C40 96 52 46 80 40C108 46 120 96 116 146Z" fill="var(--dg-tongue)" stroke="var(--dg-stroke)" strokeWidth="1" />
      <path d="M80 50V140" stroke="var(--dg-stroke)" strokeWidth="0.7" opacity="0.5" />
      {id === "dad" ? (
        <motion.g animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 2, repeat: Infinity }}>
          <path d="M46 132C44 112 46 94 50 80" stroke="var(--dg-mark)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M114 132C116 112 114 94 110 80" stroke="var(--dg-mark)" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.55" strokeDasharray="4 5" />
        </motion.g>
      ) : (
        <motion.path
          d="M52 76C58 56 68 44 80 41C92 44 102 56 108 76"
          stroke="var(--dg-mark)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <text x="80" y="9" textAnchor="middle" fontSize="9" fill="var(--muted)">
        الأمام
      </text>
    </svg>
  );
}
