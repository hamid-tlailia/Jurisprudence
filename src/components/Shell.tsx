import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Award, BookOpenText, CalendarRange, Flame, Home, ScrollText, Search, Settings, Sparkles } from "lucide-react";
import { useStore } from "../lib/store";
import { currentStreak, levelFor } from "../lib/progress";
import { num } from "../lib/format";
import { ThemeCycleButton } from "./ThemeSwitch";
import { Bar } from "./ProgressRing";
import { Logo } from "./Logo";
import { SearchDialog } from "./SearchDialog";

const NAV = [
  { to: "/", label: "الرئيسية", Icon: Home, end: true },
  { to: "/wing/fiqh", label: "الفقه", Icon: BookOpenText },
  { to: "/wing/hadith", label: "الحديث", Icon: ScrollText },
  { to: "/tutor", label: "المُعين", Icon: Sparkles },
  { to: "/plans", label: "الخطط", Icon: CalendarRange },
  { to: "/achievements", label: "الإنجازات", Icon: Award },
  { to: "/settings", label: "الإعدادات", Icon: Settings },
];

const MOBILE = [NAV[0], NAV[1], NAV[2], NAV[3], NAV[5]];

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <Logo size={compact ? 36 : 44} />
      <div>
        <div className="brand-name" style={compact ? { fontSize: "1.3rem" } : undefined}>
          رِواق
        </div>
        {!compact && <div className="brand-sub">مدرسة الفقه والحديث</div>}
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const xp = useStore((s) => s.xp);
  const activity = useStore((s) => s.activity);
  const [searchOpen, setSearchOpen] = useState(false);
  const lvl = levelFor(xp);
  const streak = currentStreak(activity);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
                  {isActive && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
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
            <span className="chip chip-gold">المستوى {num(lvl.level)}</span>
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
          <div className="topbar-actions">
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="البحث" title="البحث (Ctrl+K)">
              <Search size={19} />
            </button>
            <ThemeCycleButton />
            <NavLink to="/settings" className="icon-btn hide-lg" aria-label="الإعدادات">
              <Settings size={19} />
            </NavLink>
          </div>
        </header>

        <motion.main key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
          {children}
        </motion.main>
      </div>

      <nav className="bottom-nav" aria-label="التنقل">
        {MOBILE.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-link ${isActive ? "active" : ""}`}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="bottom-dot" className="dot" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                {isActive ? (
                  <Icon size={22} strokeWidth={1.9} fill="currentColor" />
                ) : (
                  <Icon size={22} strokeWidth={1.7} />
                )}
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
