import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Shell } from "./components/Shell";
import { AiPanel } from "./components/AiPanel";
import { Toasts } from "./components/Toasts";
import { Onboarding } from "./components/Onboarding";
import { useThemeEffect } from "./hooks/useTheme";
import Home from "./pages/Home";

const TracksPage = lazy(() => import("./pages/Tracks").then((m) => ({ default: m.TracksPage })));
const TrackPage = lazy(() => import("./pages/Tracks").then((m) => ({ default: m.TrackPage })));
const LessonPage = lazy(() => import("./pages/Lesson"));
const LibraryPage = lazy(() => import("./pages/Library").then((m) => ({ default: m.LibraryPage })));
const BookPage = lazy(() => import("./pages/Library").then((m) => ({ default: m.BookPage })));
const PlansPage = lazy(() => import("./pages/Plans"));
const AchievementsPage = lazy(() => import("./pages/Achievements"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const SearchPage = lazy(() => import("./pages/Search"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TutorPage = lazy(() => import("./pages/Tutor"));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  useThemeEffect();
  return (
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <Shell>
        <Suspense fallback={<div className="page" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tracks" element={<TracksPage />} />
            <Route path="/tracks/:trackId" element={<TrackPage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/library/:bookId" element={<BookPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/search" element={<SearchPage />} />
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
