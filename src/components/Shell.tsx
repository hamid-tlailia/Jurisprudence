import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Award, BookOpen, CalendarRange, Flame, Home, Layers, Search, Settings, Sparkles } from "lucide-react";
import { useStore } from "../lib/store";
import { currentStreak, levelFor } from "../lib/progress";
import { num } from "../lib/format";
import { ThemeCycleButton } from "./ThemeSwitch";
import { Bar } from "./ProgressRing";

const NAV = [
  { to: "/", label: "الرئيسية", Icon: Home, end: true },
  { to: "/tracks", label: "المسارات", Icon: Layers },
  { to: "/library", label: "المكتبة", Icon: BookOpen },
  { to: "/tutor", label: "المُعين", Icon: Sparkles },
  { to: "/plans", label: "الخطط", Icon: CalendarRange },
  { to: "/achievements", label: "الإنجازات", Icon: Award },
  { to: "/settings", label: "الإعدادات", Icon: Settings },
];

const MOBILE = [NAV[0], NAV[1], NAV[2], NAV[3], NAV[5]];

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <div className="brand-mark" style={compact ? { width: 36, height: 36, fontSize: "1.25rem", borderRadius: 11 } : undefined}>
        ر
      </div>
      <div>
        <div className="brand-name" style={compact ? { fontSize: "1.3rem" } : undefined}>
          الرِّواق
        </div>
        {!compact && <div className="brand-sub">مدرسة الفقه والحديث</div>}
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const xp = useStore((s) => s.xp);
  const activity = useStore((s) => s.activity);
  const lvl = levelFor(xp);
  const streak = currentStreak(activity);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Brand />
        </div>
        <nav className="stack-sm" style={{ gap: 2 }} aria-label="التنقل الرئيسي">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                  <Icon size={19} strokeWidth={1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot stack-sm">
          <div className="row-between small">
            <span style={{ fontWeight: 700 }}>{lvl.title}</span>
            <span className="chip chip-gold">م {num(lvl.level)}</span>
          </div>
          <Bar value={lvl.progress} color="var(--gold)" />
          <div className="row-between tiny muted">
            <span>{num(xp)} نقطة</span>
            <span className="row" style={{ gap: 4 }}>
              <Flame size={13} /> {num(streak)} يوم
            </span>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="brand-mobile">
            <Brand compact />
          </div>
          <button className="search-trigger" onClick={() => navigate("/search")} aria-label="البحث">
            <Search size={17} />
            <span className="hide-sm">ابحث في الدروس والمتون…</span>
          </button>
          <div className="topbar-actions">
            <ThemeCycleButton />
            <NavLink to="/settings" className="icon-btn" aria-label="الإعدادات">
              <Settings size={19} />
            </NavLink>
          </div>
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </div>

      <nav className="bottom-nav" aria-label="التنقل">
        {MOBILE.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-link ${isActive ? "active" : ""}`}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="bottom-dot" className="dot" />}
                <Icon size={21} strokeWidth={isActive ? 2.1 : 1.7} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
