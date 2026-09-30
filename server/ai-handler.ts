import Anthropic from "@anthropic-ai/sdk";
import { sanitize, streamAnswer, type AiRequestBody } from "../src/shared/ai-core.js";

/**
 * معالج طلبات الذكاء الاصطناعي المشترك بين دالة Vercel وخادم التطوير في Vite.
 * يستقبل { messages, context?, mode? } ويعيد نصاً متدفقاً (text/plain).
 */
export async function handleAiRequest(request: Request, apiKey = process.env.ANTHROPIC_API_KEY): Promise<Response> {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!apiKey) {
    return Response.json(
      { error: "لم يُضبط مفتاح ANTHROPIC_API_KEY على الخادم. أضفه في متغيرات البيئة، أو أدخل مفتاحك الخاص من الإعدادات." },
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

  const client = new Anthropic({ apiKey });
  return new Response(streamAnswer(client, parsed), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
