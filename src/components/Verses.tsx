/** عرض الأبيات: صدر وعجز متقابلان */
export function Verses({ text }: { text: string }) {
  return (
    <div className="matn verse">
      {text.split("\n").map((line, i) => {
        const [sadr, ajuz = ""] = line.split("...").map((x) => x.trim());
        return (
          <div key={i} className="bayt">
            <span>{sadr || "…"}</span>
            <span className="bayt-sep" aria-hidden>
              ۞
            </span>
            <span>{ajuz || "…"}</span>
          </div>
        );
      })}
    </div>
  );
}
