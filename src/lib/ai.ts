import type { AiRequestBody } from "../shared/ai-core";

export type AiMode = NonNullable<AiRequestBody["mode"]>;

/**
 * يطلب إجابة متدفقة من المُعين عبر نقطة الخادم ‎/api/ai‎
 * (المفتاح محفوظ في بيئة الخادم ولا يصل إلى المتصفح).
 */
/** أقصى صمت مقبول من الخادم قبل اعتبار الطلب متعطلاً */
const SILENCE_LIMIT = 150_000;

export async function streamAi(
  body: AiRequestBody,
  onText: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const watchdog = new AbortController();
  let silent = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      silent = true;
      watchdog.abort();
    }, SILENCE_LIMIT);
  };
  const onUserAbort = () => watchdog.abort();
  signal?.addEventListener("abort", onUserAbort);
  const tooSlow = () => new Error("تأخّر المُعين كثيراً في الرد، أعد إرسال سؤالك.");
  try {
    arm();
    await request(body, (t) => {
      arm();
      onText(t);
    }, watchdog.signal);
  } catch (e) {
    if (silent) throw tooSlow();
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onUserAbort);
  }
  if (silent) throw tooSlow();
}

async function request(body: AiRequestBody, onText: (chunk: string) => void, signal: AbortSignal): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    throw new Error("تعذّر الوصول إلى المُعين. تحقق من اتصالك بالإنترنت.");
  }
  if (!res.ok || !res.body) {
    let msg = "خدمة المُعين غير متاحة حالياً.";
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* الرد ليس JSON */
    }
    if (res.status === 404) msg = "المُعين غير متاح على هذا الخادم.";
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      onText(decoder.decode(value, { stream: true }));
    }
  } catch (e) {
    if ((e as Error).name !== "AbortError") throw e;
  }
}
