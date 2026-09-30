import { handleAiRequest } from "../server/ai-handler.js";

export const config = { maxDuration: 300 };

export function POST(request: Request): Promise<Response> {
  return handleAiRequest(request);
}
