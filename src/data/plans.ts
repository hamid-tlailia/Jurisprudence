/**
 * الخطط الدراسية: كل يوم يحتوي مهام (درس أو مسألة من المكتبة).
 */
export type PlanTask = { type: "lesson"; id: string } | { type: "masala"; bookId: string; id: string };

export type Plan = {
  id: string;
  title: string;
  description: string;
  level: "مبتدئ" | "متوسط";
  minutesPerDay: number;
  days: PlanTask[][];
};

const L = (id: string): PlanTask => ({ type: "lesson", id });
const M = (bookId: string, id: string): PlanTask => ({ type: "masala", bookId, id });

export const plans: Plan[] = [
  {
    id: "foundations",
    title: "التأسيس الشامل",
    description: "رحلة متوازنة بين العلوم الأربعة، تبني لك تصوراً كلياً للفقه وأصوله والحديث وعلومه.",
    level: "مبتدئ",
    minutesPerDay: 15,
    days: [
      [L("f1"), M("arbain", "h1")],
      [L("d1"), L("m1")],
      [L("u1"), M("waraqat", "w2")],
      [L("f2"), M("waraqat", "w4")],
      [L("d2"), M("bayquniyya", "b2")],
      [L("f3")],
      [L("m2"), M("arbain", "h2")],
      [L("u2"), M("waraqat", "w5")],
      [L("f4"), M("abushuja", "a1")],
      [L("d3")],
      [L("m3"), M("arbain", "h3")],
      [L("f5")],
      [L("u3"), M("arbain", "h5")],
      [L("m4"), M("bayquniyya", "b4")],
      [L("f6"), M("akhdari", "k4")],
      [L("d4")],
      [L("u4"), M("arbain", "h6")],
      [L("f7")],
      [L("m5"), M("bayquniyya", "b8")],
      [L("d5")],
      [L("u5")],
      [L("f8"), M("abushuja", "a8")],
      [L("m6"), M("bayquniyya", "b22")],
      [L("d6")],
      [L("u6"), M("waraqat", "w10")],
      [L("f9")],
      [L("m7"), L("d7")],
      [L("u7"), L("f10")],
      [L("m8"), L("d8")],
      [L("u11"), L("d9")],
    ],
  },
  {
    id: "hadith-student",
    title: "طالب الحديث",
    description: "ثلاثة أسابيع مع السنة: منزلتها وتدوينها، ثم مصطلح الحديث مع البيقونية، ثم أحاديث الأربعين.",
    level: "مبتدئ",
    minutesPerDay: 12,
    days: [
      [L("d1")],
      [L("d2")],
      [L("d3")],
      [L("m1"), M("bayquniyya", "b1")],
      [L("m2"), M("bayquniyya", "b12")],
      [L("m3"), M("bayquniyya", "b2")],
      [L("m4"), M("bayquniyya", "b3")],
      [M("bayquniyya", "b4"), M("bayquniyya", "b5")],
      [L("m7"), M("bayquniyya", "b6")],
      [L("m5"), M("bayquniyya", "b8")],
      [M("bayquniyya", "b9"), M("bayquniyya", "b10")],
      [L("m6"), M("bayquniyya", "b16")],
      [M("bayquniyya", "b17"), M("bayquniyya", "b18")],
      [M("bayquniyya", "b21"), M("bayquniyya", "b22")],
      [L("m8")],
      [L("m9")],
      [L("m10")],
      [L("d4"), M("arbain", "h1")],
      [L("d5"), M("arbain", "h2")],
      [L("d6"), L("d7")],
      [L("d8"), L("d9")],
    ],
  },
  {
    id: "faqih",
    title: "المتفقه",
    description: "أسبوعان في فقه العبادات ومبادئ الأصول، مع متني الأخضري وأبي شجاع ومقارنة المذاهب.",
    level: "متوسط",
    minutesPerDay: 20,
    days: [
      [L("f1"), M("akhdari", "k1")],
      [L("f2"), L("u2")],
      [L("f3"), M("akhdari", "k2")],
      [L("f4"), M("abushuja", "a2"), M("akhdari", "k3")],
      [L("f5")],
      [L("f6"), M("abushuja", "a3"), M("akhdari", "k4")],
      [M("abushuja", "a4")],
      [L("f7"), M("abushuja", "a5"), M("akhdari", "k5")],
      [L("f8"), M("abushuja", "a6"), M("akhdari", "k6")],
      [M("abushuja", "a7"), M("abushuja", "a8")],
      [L("f9"), L("f10")],
      [L("f11"), L("u11")],
      [L("f12")],
      [L("f13")],
    ],
  },
  {
    id: "light",
    title: "خمس دقائق يومياً",
    description: "لمن ضاق وقته: مسألة واحدة كل يوم من المتون المختارة، قليل دائم خير من كثير منقطع.",
    level: "مبتدئ",
    minutesPerDay: 5,
    days: [
      [M("arbain", "h1")],
      [M("waraqat", "w1")],
      [M("bayquniyya", "b2")],
      [M("akhdari", "k1")],
      [M("arbain", "h3")],
      [M("waraqat", "w3")],
      [M("bayquniyya", "b3")],
      [M("abushuja", "a1")],
      [M("arbain", "h5")],
      [M("waraqat", "w4")],
      [M("bayquniyya", "b5")],
      [M("akhdari", "k3")],
      [M("arbain", "h7")],
      [M("waraqat", "w8")],
      [M("bayquniyya", "b22")],
      [M("arbain", "h13")],
      [M("waraqat", "w11")],
      [M("arbain", "h16")],
      [M("waraqat", "w12")],
      [M("arbain", "h18")],
    ],
  },
];

export const getPlan = (id: string | null | undefined) => plans.find((p) => p.id === id);
