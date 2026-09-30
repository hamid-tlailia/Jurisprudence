import {
  Award,
  BookOpen,
  CalendarCheck,
  Crown,
  Flame,
  Footprints,
  Gem,
  Library,
  Medal,
  Scroll,
  Sparkles,
  Star,
  Sunrise,
  Target,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  award: Award,
  "book-open": BookOpen,
  "calendar-check": CalendarCheck,
  crown: Crown,
  flame: Flame,
  footprints: Footprints,
  gem: Gem,
  library: Library,
  medal: Medal,
  scroll: Scroll,
  sparkles: Sparkles,
  star: Star,
  sunrise: Sunrise,
  target: Target,
};

export function NamedIcon({ name, size = 20 }: { name?: string; size?: number }) {
  const C = (name && map[name]) || Star;
  return <C size={size} strokeWidth={1.8} />;
}
