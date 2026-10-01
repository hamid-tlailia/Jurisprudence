import { useState } from "react";
import { motion } from "motion/react";
import { Info, Lock } from "lucide-react";
import { allLessons, allMasail } from "../data";
import { useStore } from "../lib/store";
import { BADGES, RANKS, currentStreak, lastDays, levelFor, longestStreak } from "../lib/progress";
import { dateMedium, num } from "../lib/format";
import { NamedIcon } from "../components/Icon";
import { Bar, ProgressRing } from "../components/ProgressRing";
import { stagger } from "../components/Reveal";
import { PointsInfo } from "../components/PointsInfo";

export default function AchievementsPage() {
  const s = useStore();
  const [pointsOpen, setPointsOpen] = useState(false);
  const lvl = levelFor(s.xp);
  const days = lastDays(s.activity, 7 * 18);
  const earned = BADGES.filter((b) => s.badges[b.id]).length;
  const perfect = Object.values(s.completedLessons).filter((r) => r.total && r.score === r.total).length;

  const stats = [
    { v: Object.keys(s.completedLessons).length, of: allLessons.length, label: "دروس مكتملة" },
    { v: Object.keys(s.readMasail).length, of: allMasail.length, label: "مسائل مقروءة" },
    { v: perfect, label: "اختبارات بلا خطأ" },
    { v: currentStreak(s.activity), label: "السلسلة الحالية" },
    { v: longestStreak(s.activity), label: "أطول سلسلة" },
    { v: s.aiQuestions, label: "أسئلة للمُعين" },
  ];

  return (
    <div className="page">
      <header className="stack-sm" style={{ marginBottom: 28 }}>
        <span className="eyebrow">الإنجازات</span>
        <h1 className="title-xl">سجلّ رحلتك في الطلب</h1>
      </header>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card hero" style={{ marginBottom: 20 }}>
        <div className="pattern" />
        <div className="stack" style={{ position: "relative", alignItems: "center", textAlign: "center" }}>
          <ProgressRing value={lvl.progress} size={160} stroke={13} color="var(--gold)">
            <div>
              <div className="ring-label" style={{ marginTop: 0 }}>المستوى</div>
              <div className="ring-value" style={{ fontSize: "2.6rem" }}>{num(lvl.level)}</div>
            </div>
          </ProgressRing>
          <div className="stack-sm" style={{ alignItems: "center" }}>
            <h2 className="title-lg" style={{ fontFamily: "var(--font-classic)", fontSize: "1.8rem" }}>
              {lvl.title}
            </h2>
            <p className="ink-2">{num(s.xp)} نقطة</p>
            <button className="btn btn-ghost btn-sm" onClick={() => setPointsOpen(true)}>
              <Info size={14} /> ما فائدة النقاط؟
            </button>
            {lvl.next ? (
              <p className="small muted">
                بقي {num(lvl.toNext)} نقطة لبلوغ رتبة «{lvl.next.title}»
              </p>
            ) : (
              <p className="small muted">بلغت أعلى الرتب — زادك الله علماً.</p>
            )}
            <div className="row" style={{ gap: 6, flexWrap: "wrap", marginTop: 6, justifyContent: "center" }}>
              {RANKS.map((r, i) => (
                <span key={r.title} className={`chip ${i < lvl.level ? "chip-gold" : ""}`} title={`${num(r.min)} نقطة`}>
                  {r.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 20 }} variants={stagger.container} initial="hidden" animate="show">
        {stats.map((st) => (
          <motion.div key={st.label} variants={stagger.item} className="card card-pad stat">
            <span className="stat-value">
              {num(st.v)}
              {st.of ? <span className="muted small"> / {num(st.of)}</span> : null}
            </span>
            <span className="stat-label">{st.label}</span>
            {st.of ? (
              <div style={{ marginTop: 8 }}>
                <Bar value={st.v / st.of} />
              </div>
            ) : null}
          </motion.div>
        ))}
      </motion.div>

      <section className="card card-pad stack" style={{ marginBottom: 20 }}>
        <div className="row-between">
          <h2 className="title-md">خريطة المداومة</h2>
          <span className="tiny muted">آخر 18 أسبوعاً</span>
        </div>
        <div className="heatmap">
          {days.map((d) => {
            const lvlCls = d.xp === 0 ? "" : d.xp < 15 ? "l1" : d.xp < 30 ? "l2" : d.xp < 60 ? "l3" : "l4";
            return <div key={d.key} className={`heat ${lvlCls}`} title={`${d.key}: ${d.xp} نقطة`} />;
          })}
        </div>
      </section>

      <div className="section-head">
        <h2 className="title-lg">الأوسمة</h2>
        <span className="chip chip-gold">
          {num(earned)} / {num(BADGES.length)}
        </span>
      </div>
      <motion.div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }} variants={stagger.container} initial="hidden" animate="show">
        {BADGES.map((b) => {
          const got = !!s.badges[b.id];
          return (
            <motion.div key={b.id} variants={stagger.item} className="card badge-tile" whileHover={got ? { y: -4 } : undefined}>
              <motion.div className={`medallion ${got ? "" : "locked"}`} whileHover={got ? { rotate: [0, -8, 8, 0] } : undefined} transition={{ duration: 0.5 }}>
                {got ? <NamedIcon name={b.icon} size={28} /> : <Lock size={22} />}
              </motion.div>
              <div style={{ fontWeight: 700 }}>{b.title}</div>
              <div className="tiny muted">{b.description}</div>
              {got && <div className="tiny" style={{ color: "var(--gold)" }}>{dateMedium(new Date(s.badges[b.id]))}</div>}
            </motion.div>
          );
        })}
      </motion.div>
      <PointsInfo open={pointsOpen} onClose={() => setPointsOpen(false)} />
    </div>
  );
}
