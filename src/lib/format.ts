/** الأرقام تُعرض بالأرقام الغربية 123 في كل التطبيق */
const nf = new Intl.NumberFormat("en-US");

export const num = (n: number) => nf.format(n);

export const pct = (r: number) => `${nf.format(Math.round(r * 100))}%`;

export const weekdayShort = (d: Date) => new Intl.DateTimeFormat("ar-u-nu-latn", { weekday: "short" }).format(d);

export const dateMedium = (d: Date) => new Intl.DateTimeFormat("ar-u-nu-latn", { dateStyle: "medium" }).format(d);

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return "طابت ليلتك";
  if (h < 12) return "صباح الخير";
  if (h < 17) return "طاب يومك";
  return "مساء الخير";
}

export function hijriDate(d = new Date()) {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "long", year: "numeric" }).format(d);
  } catch {
    return "";
  }
}

export const minutesLabel = (m: number) => (m === 1 ? "دقيقة" : m === 2 ? "دقيقتان" : m <= 10 ? `${num(m)} دقائق` : `${num(m)} دقيقة`);

export const lessonsLabel = (n: number) => (n === 1 ? "درس واحد" : n === 2 ? "درسان" : n <= 10 ? `${num(n)} دروس` : `${num(n)} درساً`);

export const durationLabel = (minutes: number) => {
  if (minutes < 60) return minutesLabel(minutes);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hl = h === 1 ? "ساعة" : h === 2 ? "ساعتان" : `${num(h)} ساعات`;
  return m ? `${hl} و${minutesLabel(m)}` : hl;
};
