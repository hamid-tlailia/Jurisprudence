import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Shell } from "./components/Shell";
import { AiPanel } from "./components/AiPanel";
import { Toasts } from "./components/Toasts";
import { Onboarding } from "./components/Onboarding";
import { useThemeEffect } from "./hooks/useTheme";
import Home from "./pages/Home";

const WingPage = lazy(() => import("./pages/Wing"));
const LessonPage = lazy(() => import("./pages/Lesson"));
const BookPage = lazy(() => import("./pages/Library").then((m) => ({ default: m.BookPage })));
const MatnPage = lazy(() => import("./pages/Matn"));
const PlansPage = lazy(() => import("./pages/Plans"));
const AchievementsPage = lazy(() => import("./pages/Achievements"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TutorPage = lazy(() => import("./pages/Tutor"));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

/** الروابط القديمة للمسارات تُحوَّل إلى الجناح المناسب */
function TrackRedirect() {
  const { trackId } = useParams();
  const wing = trackId === "hadith" || trackId === "mustalah" ? "hadith" : trackId === "tajwid" ? "quran" : "fiqh";
  return <Navigate to={`/wing/${wing}`} replace />;
}

/** تحميل الصفحات مسبقاً في وقت الفراغ لتنقّل فوري */
function usePrefetch() {
  useEffect(() => {
    const load = () => {
      void import("./pages/Wing");
      void import("./pages/Lesson");
      void import("./pages/Library");
      void import("./pages/Plans");
      void import("./pages/Achievements");
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(load);
    else setTimeout(load, 1500);
  }, []);
}

export default function App() {
  usePrefetch();
  useThemeEffect();
  return (
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <Shell>
        <Suspense fallback={<div className="page" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wing/:wingId" element={<WingPage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/library/:bookId" element={<BookPage />} />
            <Route path="/matn/:id" element={<MatnPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/tracks/:trackId" element={<TrackRedirect />} />
            <Route path="/tracks" element={<Navigate to="/" replace />} />
            <Route path="/library" element={<Navigate to="/wing/fiqh?tab=texts" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Shell>
      <AiPanel />
      <Toasts />
      <Onboarding />
    </MotionConfig>
  );
}
