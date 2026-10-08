import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getMakhraj, type MakhrajId } from "../data/makharij";
import { MakhrajDiagram, TongueTopView } from "./MakhrajDiagram";

/** رسم المخرج مع اسمه وحروفه، وأزرار للتنقل بين مخارج الدرس */
export function MakhrajExplorer({ ids }: { ids: MakhrajId[] }) {
  const [current, setCurrent] = useState<MakhrajId>(ids[0]);
  const m = getMakhraj(current);
  return (
    <div className="makhraj-figure">
      {ids.length > 1 && (
        <div className="makhraj-chips" role="tablist" aria-label="المخارج">
          {ids.map((id) => {
            const x = getMakhraj(id);
            return (
              <button key={id} role="tab" aria-selected={id === current} className={`makhraj-chip ${id === current ? "on" : ""}`} onClick={() => setCurrent(id)}>
                {x.letters}
              </button>
            );
          })}
        </div>
      )}
      <div className="makhraj-stage">
        <MakhrajDiagram id={current} size={300} />
        {(current === "dad" || current === "lam") && (
          <div className="stack-sm" style={{ alignItems: "center", gap: 2 }}>
            <TongueTopView id={current} size={140} />
            <span className="tiny muted">منظر علوي للسان</span>
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="stack-sm"
          style={{ textAlign: "center", alignItems: "center", gap: 4 }}
        >
          <div className="makhraj-letters">{m.letters}</div>
          <div style={{ fontWeight: 700 }}>
            {m.title} <span className="tiny muted">· {m.area}</span>
          </div>
          <p className="small ink-2" style={{ maxWidth: 520 }}>
            {m.description}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
