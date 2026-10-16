// Local HTTPS games origin for testing the website on a LAN (Privy needs HTTPS there).
// Serves this folder like play.rarefriends.com, but lets the local website frame it.
//   node serve-local.mjs <cert.pem> <key.pem> [port=3005] [frame-ancestors="https://localhost:3000"]
import { createServer } from "node:https";
import { readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const [cert, key, port = "3005", ancestors = "https://localhost:3000"] = process.argv.slice(2);
const root = resolve(import.meta.dirname);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".woff2": "font/woff2", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };
createServer({ cert: readFileSync(cert), key: readFileSync(key) }, (request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url ?? "/", "https://local").pathname)).replace(/^\/+/, "");
  const file = join(root, path);
  const headers = { "Content-Security-Policy": `frame-ancestors ${ancestors}`, "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" };
  if (!file.startsWith(root) || path.startsWith(".") || path.endsWith(".mjs")) { response.writeHead(404, headers).end(); return; }
  try {
    if (!statSync(file).isFile()) throw new Error();
    response.writeHead(200, { ...headers, "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
  } catch { response.writeHead(404, headers).end(); }
}).listen(Number(port), "0.0.0.0", () => console.log(`Local games origin on https://0.0.0.0:${port} (frame-ancestors ${ancestors})`));
