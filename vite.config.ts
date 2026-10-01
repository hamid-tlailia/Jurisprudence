import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { Readable } from "node:stream";

/** يخدم ‎/api/ai‎ أثناء التطوير بنفس معالج دالة Vercel. */
function devAiApi(apiKey: string | undefined, model: string | undefined): Plugin {
  return {
    name: "dev-ai-api",
    configureServer(server) {
      server.middlewares.use("/api/ai", async (req, res) => {
        const { handleAiRequest } = await server.ssrLoadModule("/server/ai-handler.ts");
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const request = new Request("http://localhost/api/ai", {
          method: req.method,
          headers: { "content-type": "application/json" },
          body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
        });
        const response: Response = await handleAiRequest(request, apiKey, model || undefined);
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        if (response.body) Readable.fromWeb(response.body as never).pipe(res);
        else res.end();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), devAiApi(env.GEMINI_API_KEY, env.GEMINI_MODEL)],
  };
});
