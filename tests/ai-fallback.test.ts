import { afterAll, beforeAll, describe, expect, it } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { streamAnswer } from "../src/shared/ai-core";

/** خادم وهمي يحاكي واجهة Gemini: النموذج الأول مشغول، والثاني ينقطع في منتصف الإجابة، والثالث يكمل */
let server: http.Server;
let base = "";
const calls: { model: string; body: { contents: { role: string; parts: { text: string }[] }[] } }[] = [];

const sse = (res: http.ServerResponse, texts: string[], end = true) => {
  res.writeHead(200, { "content-type": "text/event-stream" });
  for (const t of texts) res.write(`data: ${JSON.stringify({ candidates: [{ content: { role: "model", parts: [{ text: t }] } }] })}\n\n`);
  if (end) {
    res.write(`data: ${JSON.stringify({ candidates: [{ content: { role: "model", parts: [{ text: "" }] }, finishReason: "STOP" }] })}\n\n`);
    res.end();
  } else setTimeout(() => res.destroy(), 80);
};

beforeAll(async () => {
  server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const model = /models\/([^:]+):/.exec(req.url ?? "")?.[1] ?? "?";
      calls.push({ model, body: JSON.parse(raw) });
      if (model === "m-busy") {
        res.writeHead(503, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: { code: 503, message: "overloaded", status: "UNAVAILABLE" } }));
      } else if (model === "m-cut") sse(res, ["الجزء الأول، "], false);
      else sse(res, ["والجزء الثاني."]);
    });
  });
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => server.close());

describe("streamAnswer fallback", () => {
  it("skips a busy model, resumes a cut answer on the next model, and never names the provider", async () => {
    const { FALLBACK_MODELS } = await import("../src/shared/ai-core");
    FALLBACK_MODELS.splice(0, FALLBACK_MODELS.length, "m-busy", "m-cut", "m-ok");
    const text = await new Response(streamAnswer("k", { messages: [{ role: "user", content: "سؤال" }] }, "m-busy", base)).text();
    expect(calls.map((c) => c.model)).toEqual(["m-busy", "m-cut", "m-ok"]);
    expect(text).toBe("الجزء الأول، والجزء الثاني.");
    const resume = calls[2].body.contents;
    expect(resume.at(-2)).toMatchObject({ role: "model", parts: [{ text: "الجزء الأول، " }] });
    expect(resume.at(-1)!.parts[0].text).toContain("أكمل");
  });

  it("returns a neutral message when every model is busy", async () => {
    const { FALLBACK_MODELS } = await import("../src/shared/ai-core");
    FALLBACK_MODELS.splice(0, FALLBACK_MODELS.length, "m-busy");
    const text = await new Response(streamAnswer("k", { messages: [{ role: "user", content: "سؤال" }] }, "m-busy", base)).text();
    expect(text).toContain("المُعين مشغول");
    expect(text).not.toMatch(/gemini|google/i);
  });
});
