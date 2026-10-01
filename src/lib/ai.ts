import type { AiRequestBody } from "../shared/ai-core";
import { useStore } from "./store";

export type AiMode = NonNullable<AiRequestBody["mode"]>;

/**
 * يطلب إجابة متدفقة من المُعين.
 * - إن أدخل المستخدم مفتاح Gemini الخاص به في الإعدادات: يُستدعى Gemini من المتصفح مباشرة.
 * - وإلا: عبر نقطة الخادم ‎/api/ai‎ التي تحفظ المفتاح في بيئة الخادم.
 */
export async function streamAi(
  body: AiRequestBody,
  onText: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const userKey = useStore.getState().settings.userApiKey.trim();
  if (userKey) return streamDirect(userKey, body, onText, signal);

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
    throw new Error("تعذّر الوصول إلى خادم المُعين. تحقق من اتصالك بالإنترنت.");
  }
  if (!res.ok || !res.body) {
    let msg = "خدمة المُعين غير متاحة حالياً.";
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* الرد ليس JSON */
    }
    if (res.status === 404) msg = "نقطة ‎/api/ai‎ غير موجودة على هذا الخادم. أدخل مفتاح Gemini الخاص بك من الإعدادات لتفعيل المُعين.";
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

async function streamDirect(apiKey: string, body: AiRequestBody, onText: (s: string) => void, signal?: AbortSignal) {
  const { streamAnswer } = await import("../shared/ai-core");
  const reader = streamAnswer(apiKey, body).getReader();
  const decoder = new TextDecoder();
  const onAbort = () => reader.cancel();
  signal?.addEventListener("abort", onAbort);
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      onText(decoder.decode(value, { stream: true }));
    }
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}
