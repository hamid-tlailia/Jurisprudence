import { DEFAULT_MODEL, sanitize, streamAnswer, type AiRequestBody } from "../src/shared/ai-core.js";

/**
 * معالج طلبات الذكاء الاصطناعي المشترك بين دالة Vercel وخادم التطوير في Vite.
 * يستقبل { messages, context?, mode? } ويعيد نصاً متدفقاً (text/plain).
 */
export async function handleAiRequest(
  request: Request,
  apiKey = process.env.GEMINI_API_KEY,
  model = process.env.GEMINI_MODEL || DEFAULT_MODEL,
): Promise<Response> {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!apiKey) {
    console.error("[ai] GEMINI_API_KEY is not set");
    return Response.json(
      { error: "المُعين غير مفعّل على هذا الخادم بعد." },
      { status: 503 },
    );
  }
  let parsed: AiRequestBody | null = null;
  try {
    parsed = sanitize(await request.json());
  } catch {
    parsed = null;
  }
  if (!parsed) return Response.json({ error: "طلب غير صالح." }, { status: 400 });

  return new Response(streamAnswer(apiKey, parsed, model), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
