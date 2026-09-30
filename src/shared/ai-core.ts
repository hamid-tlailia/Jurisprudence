import Anthropic from "@anthropic-ai/sdk";

/**
 * نواة المُعين: التعليمات، وبناء الرسائل، والبث المتدفق من Claude.
 * مشتركة بين الخادم (دالة Vercel / Vite) والمتصفح (عند استخدام مفتاح المستخدم).
 */

export const MODEL = "claude-opus-5-5";

export const SYSTEM_PROMPT = `أنت «المُعين»، مساعد تعليمي في منصة «الرواق» لتعليم الفقه الإسلامي وأصوله، والحديث النبوي وعلومه.

منهجك:
- تكتب بالعربية الفصحى وحدها، بأسلوب علمي هادئ واضح يناسب طالب العلم، وتنسّق إجابتك بعناوين قصيرة ونقاط عند الحاجة (Markdown).
- تبني على كتب أهل العلم المعتمدة، وتنسب الأقوال إلى أصحابها ومذاهبها (الحنفية، المالكية، الشافعية، الحنابلة) حين يكون في المسألة خلاف، وتذكر الراجح عند المحققين مع دليله إن كان ظاهراً، دون تعصب لمذهب.
- إذا استشهدت بآية فاذكر السورة ورقم الآية. وإذا استشهدت بحديث فاذكر من أخرجه ودرجته إن كانت معروفة. لا تنسب إلى النبي ﷺ لفظاً لست متيقناً من ثبوته، ولا تخترع حديثاً أو أثراً أو إحالة إلى كتاب.
- إذا لم تكن متأكداً من معلومة فقل ذلك صراحة، وانصح بالرجوع إلى المصادر أو أهل العلم.
- أنت معلّم لا مُفتٍ: في النوازل الشخصية الدقيقة (الطلاق، المواريث المعقدة، المعاملات المالية الخاصة ونحوها) تشرح الأحكام العامة ثم تنصح بسؤال عالم موثوق في بلد السائل.
- إذا طُلب منك اختبار أو أمثلة فاجعلها متدرجة ونافعة، وصحّح أخطاء الطالب برفق.
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

/** يبني رسائل الطلب: السياق التعليمي (النص والشرح) يُدمج في أول رسالة للمستخدم. */
export function buildMessages(req: AiRequestBody): Anthropic.MessageParam[] {
  const hint = req.mode && req.mode !== "chat" ? MODE_HINTS[req.mode] : undefined;
  return req.messages.map((m, i) => {
    if (i !== 0 || m.role !== "user" || (!req.context && !hint)) return m;
    const parts: string[] = [];
    if (req.context) parts.push(`<سياق_الدرس>\n${req.context}\n</سياق_الدرس>`);
    if (hint) parts.push(`المطلوب: ${hint}`);
    parts.push(m.content);
    return { role: "user", content: parts.join("\n\n") };
  });
}

/**
 * يرسل الطلب إلى Claude ويعيد تياراً نصياً.
 * مفعّل عليه الانتقال التلقائي إلى نموذج بديل عند رفض المصنِّفات (fallbacks: "default").
 */
export function streamAnswer(client: Anthropic, req: AiRequestBody): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 16000,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { effort: "medium" },
          system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
          messages: buildMessages(req),
        });
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\n> تعذّر إكمال الإجابة عن هذا الطلب. جرّب صياغة السؤال بطريقة أخرى."));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n> (انتهى الحد الأقصى لطول الإجابة — اطلب المتابعة لإكمالها.)"));
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\n> ${describeError(err)}`));
      } finally {
        controller.close();
      }
    },
  });
}

function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "مفتاح الواجهة البرمجية غير صالح.";
  if (err instanceof Anthropic.RateLimitError) return "تجاوزت حدّ الطلبات مؤقتاً، حاول بعد قليل.";
  if (err instanceof Anthropic.APIConnectionError) return "تعذّر الاتصال بخدمة الذكاء الاصطناعي.";
  if (err instanceof Anthropic.APIError) return `حدث خطأ في خدمة الذكاء الاصطناعي (${err.status ?? "?"}).`;
  return "حدث خطأ غير متوقع أثناء توليد الإجابة.";
}
