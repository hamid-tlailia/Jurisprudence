const nf = new Intl.NumberFormat("ar-EG");

/** أرقام عربية مشرقية */
export const num = (n: number) => nf.format(n);

export const pct = (r: number) => `${nf.format(Math.round(r * 100))}٪`;

export const weekdayShort = (d: Date) => new Intl.DateTimeFormat("ar", { weekday: "short" }).format(d);

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return "طابت ليلتك";
  if (h < 12) return "صباح الخير";
  if (h < 17) return "طاب يومك";
  return "مساء الخير";
}

export function hijriDate(d = new Date()) {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(d);
  } catch {
    return "";
  }
}

export const minutesLabel = (m: number) => (m === 1 ? "دقيقة" : m === 2 ? "دقيقتان" : m <= 10 ? `${num(m)} دقائق` : `${num(m)} دقيقة`);
