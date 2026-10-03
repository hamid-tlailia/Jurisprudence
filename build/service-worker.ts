import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";
import type { Plugin } from "vite";

/** يجمع ملفات مجلد public ليُخزَّن كل ما يحتاجه التطبيق للعمل دون اتصال. */
function listFiles(dir: string, root = dir): string[] {
  let out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out = out.concat(listFiles(p, root));
    else out.push(relative(root, p).split("\\").join("/"));
  }
  return out;
}

/**
 * يولّد ‎sw.js‎ عند البناء: يخزّن الواجهة كاملة (الصفحات والدروس والخطوط والأيقونات)
 * فيعمل التطبيق دون إنترنت، ويبقى المُعين وحده محتاجاً إلى الاتصال.
 */
export function serviceWorker(): Plugin {
  let publicDir = "";
  return {
    name: "riwaq-service-worker",
    apply: "build",
    configResolved(config) {
      publicDir = config.publicDir;
    },
    generateBundle(_options, bundle) {
      const files = new Set<string>(["/", "/index.html"]);
      for (const name of Object.keys(bundle)) if (!/\.(map|woff)$/.test(name)) files.add("/" + name);
      for (const name of listFiles(publicDir)) files.add("/" + name);
      const urls = [...files].sort();
      const hash = createHash("sha256");
      for (const name of Object.keys(bundle).sort()) {
        const item = bundle[name];
        hash.update(name);
        if (item.type === "asset") hash.update(typeof item.source === "string" ? item.source : Buffer.from(item.source));
      }
      const version = hash.digest("hex").slice(0, 12);
      this.emitFile({ type: "asset", fileName: "sw.js", source: swSource(version, urls) });
    },
  };
}

function swSource(version: string, urls: string[]) {
  return `/* رواق — يعمل دون اتصال. يُولَّد آلياً عند البناء. */
const CACHE = "riwaq-${version}";
const PRECACHE = ${JSON.stringify(urls)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("riwaq-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    // الصفحات كلها تُعرض من الواجهة المخزّنة؛ تحديث التطبيق يصل مع نسخة جديدة من هذا الملف.
    event.respondWith(caches.match("/index.html", { cacheName: CACHE }).then((hit) => hit || fetch(req)));
    return;
  }

  event.respondWith(
    caches.match(req, { cacheName: CACHE }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
`;
}
