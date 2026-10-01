import { useEffect } from "react";
import { useStore } from "../lib/store";

/** يطبّق المظهر (ليل/نهار/تلقائي) وحجم الخط على جذر الصفحة */
export function useThemeEffect() {
  const theme = useStore((s) => s.settings.theme);
  const fontScale = useStore((s) => s.settings.fontScale);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "auto" && mq.matches);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#111a18" : "#f5f0e6");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--fs", String(fontScale));
  }, [fontScale]);
}
