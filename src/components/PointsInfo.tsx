import { Award, Flame, Medal, Target, TrendingUp } from "lucide-react";
import { RANKS, XP } from "../lib/progress";
import { num } from "../lib/format";
import { Sheet } from "./Sheet";

const EARN = [
  { label: "إتمام درس (أول مرة)", pts: XP.lesson },
  { label: "اختبار بلا خطأ", pts: XP.perfectQuiz },
  { label: "قراءة مسألة من المتون", pts: XP.masala },
  { label: "سؤال للمُعين", pts: XP.ai },
  { label: "إتمام خطة دراسية", pts: XP.planDay * 2 },
];

const USES = [
  { Icon: Target, title: "الهدف اليومي", body: "تحدد عدد النقاط التي تريدها كل يوم، فتعرف هل أدّيت وِردك أم لا." },
  { Icon: Flame, title: "المداومة", body: "كل يوم تكسب فيه نقاطاً يُحسب في سلسلة أيامك وخريطة مداومتك: «أحب الأعمال إلى الله أدومها وإن قلّ»." },
  { Icon: TrendingUp, title: "الرتب", body: "ترتقي بالنقاط في رتب الطلب من «مبتدئ الطلب» إلى «شيخ الرواق»، فترى ثمرة جهدك." },
  { Icon: Medal, title: "الأوسمة", body: "بعض الأوسمة مرتبطة بالنقاط والمداومة، وتشهد لك بما أنجزت." },
];

/** نافذة تشرح كيف تُكتسب النقاط وما فائدتها */
export function PointsInfo({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="ما فائدة النقاط؟">
      <div className="stack" style={{ gap: 18 }}>
        <p className="small ink-2">
          النقاط مقياس لجهدك في الطلب، لا غاية في ذاتها. هي التي تحسب هدفك اليومي ومداومتك ورتبتك، فتعينك على الاستمرار والمحاسبة.
        </p>
        <div className="stack-sm">
          {USES.map(({ Icon, title, body }) => (
            <div key={title} className="row" style={{ alignItems: "flex-start", gap: 12 }}>
              <span className="mi-icon" style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--accent-soft)", color: "var(--accent)", flexShrink: 0 }}>
                <Icon size={17} />
              </span>
              <div>
                <div style={{ fontWeight: 700 }}>{title}</div>
                <div className="small muted">{body}</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="title-md" style={{ marginBottom: 8 }}>
            كيف تُكتسب؟
          </h3>
          <div className="stack-sm" style={{ gap: 6 }}>
            {EARN.map((e) => (
              <div key={e.label} className="row-between task" style={{ padding: "10px 14px" }}>
                <span className="small">{e.label}</span>
                <span className="chip chip-accent" dir="ltr">+{num(e.pts)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="title-md row" style={{ marginBottom: 8, gap: 8 }}>
            <Award size={18} color="var(--gold)" /> الرتب
          </h3>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {RANKS.map((r) => (
              <span key={r.title} className="chip">
                {r.title} · {num(r.min)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
