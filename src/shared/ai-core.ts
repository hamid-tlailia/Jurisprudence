import { ApiError, FinishReason, GoogleGenAI, type Content } from "@google/genai";

/**
 * نواة المُعين: التعليمات، وبناء الرسائل، والبث المتدفق.
 * تعمل على الخادم فقط، والمفتاح محفوظ في متغيرات البيئة.
 */

/** النموذج المفضل (من الطبقة المجانية) */
export const DEFAULT_MODEL = "gemini-3.8-flash";

export const SYSTEM_PROMPT = `أنت «المُعين»، مساعد تعليمي في تطبيق «رواق» لتعليم الفقه الإسلامي وأصوله، والحديث النبوي وعلومه.

منهجك:
- تكتب بالعربية الفصحى وحدها، بأسلوب علمي هادئ واضح يناسب طالب العلم، وتنسّق إجابتك بعناوين قصيرة ونقاط عند الحاجة (Markdown).
- تبني على كتب أهل العلم المعتمدة، وتنسب الأقوال إلى أصحابها ومذاهبها (الحنفية، المالكية، الشافعية، الحنابلة) حين يكون في المسألة خلاف، وتذكر الراجح عند المحققين مع دليله إن كان ظاهراً، دون تعصب لمذهب.
- إذا استشهدت بآية فاذكر السورة ورقم الآية. وإذا استشهدت بحديث فاذكر من أخرجه ودرجته إن كانت معروفة. لا تنسب إلى النبي ﷺ لفظاً لست متيقناً من ثبوته، ولا تخترع حديثاً أو أثراً أو إحالة إلى كتاب.
- إذا لم تكن متأكداً من معلومة فقل ذلك صراحة، وانصح بالرجوع إلى المصادر أو أهل العلم.
- أنت معلّم لا مُفتٍ: في النوازل الشخصية الدقيقة (الطلاق، المواريث المعقدة، المعاملات المالية الخاصة ونحوها) تشرح الأحكام العامة ثم تنصح بسؤال عالم موثوق في بلد السائل.
- إذا طُلب منك اختبار أو أمثلة فاجعلها متدرجة ونافعة، وصحّح أخطاء الطالب برفق.
- إن سُئلت عن هويتك أو التقنية التي تعمل بها، فقل: أنا «المُعين»، مساعد تطبيق رواق التعليمي، ولا تذكر اسم شركة أو نموذج.
- لا تخرج عن نطاق العلوم الشرعية وما يخدمها (اللغة، التاريخ الإسلامي، مناهج الطلب) إلا بلطف واختصار.`;

const MODE_HINTS: Record<string, string> = {
  expand: "وسّع شرح هذا الموضع: وضّح المعنى، والمصطلحات، والأدلة، وأقوال العلماء إن وُجد خلاف، ثم خلاصة في نقاط.",
  example: "أعطِ أمثلة تطبيقية واقعية متدرجة توضّح هذه المسألة، مع بيان وجه الحكم في كل مثال.",
  quiz: "اصنع اختباراً قصيراً من خمسة أسئلة متنوعة (اختيار من متعدد وصح/خطأ وسؤال مقالي قصير) حول هذا الموضع، وضع الإجابات في آخر الرد تحت عنوان «الإجابات».",
  compare: "قارن بين المذاهب الفقهية الأربعة في هذه المسألة في جدول موجز، ثم اذكر أدلة كل قول باختصار والراجح عند المحققين.",
  simplify: "اشرح هذا الموضع بأبسط عبارة ممكنة لطالب مبتدئ، مع تشبيه أو مثال قريب.",
};

type InMessage = { role: "user" | "assistant"; content: string };

export type AiRequestBody = {
  messages: InMessage[];
  context?: string;
  mode?: keyof typeof MODE_HINTS | "chat";
};

export function sanitize(body: unknown): AiRequestBody | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.messages) || b.messages.length === 0) return null;
  const messages: InMessage[] = [];
  for (const m of b.messages.slice(-30)) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    messages.push({ role, content: content.slice(0, 12000) });
  }
  if (messages[0].role !== "user" || messages[messages.length - 1].role !== "user") return null;
  return {
    messages,
    context: typeof b.context === "string" ? b.context.slice(0, 8000) : undefined,
    mode: typeof b.mode === "string" ? (b.mode as AiRequestBody["mode"]) : "chat",
  };
}

/** يبني محتوى المحادثة: السياق التعليمي (النص والشرح) يُدمج في أول رسالة للمستخدم. */
export function buildContents(req: AiRequestBody): Content[] {
  const hint = req.mode && req.mode !== "chat" ? MODE_HINTS[req.mode] : undefined;
  return req.messages.map((m, i) => {
    let text = m.content;
    if (i === 0 && m.role === "user" && (req.context || hint)) {
      const parts: string[] = [];
      if (req.context) parts.push(`<سياق_الدرس>\n${req.context}\n</سياق_الدرس>`);
      if (hint) parts.push(`المطلوب: ${hint}`);
      parts.push(m.content);
      text = parts.join("\n\n");
    }
    return { role: m.role === "assistant" ? "model" : "user", parts: [{ text }] };
  });
}

/** النماذج المجانية بالترتيب: يُنتقل إلى التالي إذا كان السابق مشغولاً أو غير متاح */
export const FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash-lite"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** أخطاء عابرة تستحق إعادة المحاولة بنموذج آخر */
function isRetryable(err: unknown): boolean {
  if (err instanceof ApiError) return err.status === 429 || err.status === 404 || err.status >= 500;
  return true; // انقطاع الشبكة ونحوه
}

/**
 * يرسل الطلب ويعيد تياراً نصياً.
 * - يجرّب النماذج بالترتيب عند الانشغال أو تجاوز الحد.
 * - إذا انقطعت الإجابة في منتصفها، يطلب من النموذج التالي إكمالها من حيث توقفت.
 */
export function streamAnswer(apiKey: string, req: AiRequestBody, preferred = DEFAULT_MODEL, baseUrl?: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const ai = new GoogleGenAI({ apiKey, ...(baseUrl ? { httpOptions: { baseUrl } } : {}) });
  const models = [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)];
  const base = buildContents(req);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let produced = "";
      let lastErr: unknown = null;
      try {
        for (let attempt = 0; attempt < models.length; attempt++) {
          const model = models[attempt];
          // عند الاستئناف: نعطي النموذج ما كُتب ونطلب الإكمال دون تكرار
          const contents: Content[] = produced
            ? [
                ...base,
                { role: "model", parts: [{ text: produced }] },
                { role: "user", parts: [{ text: "انقطعت إجابتك. أكمل من الموضع الذي توقفت عنده بالضبط، دون تكرار ما سبق ودون مقدمة." }] },
              ]
            : base;
          try {
            const stream = await ai.models.generateContentStream({
              model,
              contents,
              config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.4, maxOutputTokens: 8192 },
            });
            let finish: FinishReason | undefined;
            for await (const chunk of stream) {
              const text = chunk.text;
              if (text) {
                produced += text;
                controller.enqueue(encoder.encode(text));
              }
              finish = chunk.candidates?.[0]?.finishReason ?? finish;
            }
            if (finish === FinishReason.MAX_TOKENS) {
              controller.enqueue(encoder.encode("\n\n> (انتهى الحد الأقصى لطول الإجابة — اطلب المتابعة لإكمالها.)"));
            } else if (finish === FinishReason.SAFETY || (!produced && finish && finish !== FinishReason.STOP)) {
              controller.enqueue(encoder.encode("\n\n> تعذّر إكمال الإجابة عن هذا الطلب. جرّب صياغة السؤال بطريقة أخرى."));
            }
            return;
          } catch (err) {
            lastErr = err;
            console.error(`[ai] model=${model} failed`, err instanceof ApiError ? `${err.status} ${err.message.slice(0, 300)}` : String(err));
            if (!isRetryable(err)) break;
            await sleep(Math.min(400 * (attempt + 1), 1500));
          }
        }
        controller.enqueue(encoder.encode(`\n\n> ${describeError(lastErr)}`));
      } finally {
        controller.close();
      }
    },
  });
}

/** رسائل خطأ لا تذكر مزوّد الخدمة: المستخدم يتعامل مع «المُعين» فقط */
export function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return "المُعين مشغول بكثرة الأسئلة الآن، أعد المحاولة بعد دقيقة.";
    if (err.status >= 500) return "المُعين مشغول حالياً، أعد المحاولة بعد قليل.";
    return "تعذّر على المُعين الإجابة الآن، أعد المحاولة لاحقاً.";
  }
  return "تعذّر الاتصال بالمُعين، تحقق من الاتصال وأعد المحاولة.";
}
