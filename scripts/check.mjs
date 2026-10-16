// Checks this repository the way play.rarefriends.com serves it. No dependencies; Node 20+.
//   node scripts/check.mjs                 every game, listing and version in the working tree
//   node scripts/check.mjs --base <ref>    also the rules for a pull request against <ref>
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname } from "node:path";

const ID = /^[a-z][a-z0-9-]{1,31}$/;
const RESERVED = new Set(["friendsdk", "nexus", "care", "commerce", "scripts"]);
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const ROOT_FILES = new Set(["README.md", "games.json", "vercel.json", ".vercelignore", ".gitignore", "serve-local.mjs"]);
const ROOT_DIRS = new Set(["scripts", ".github"]);
// Files only maintainers change; a submission never needs them (`friendsdk site` rewrites vercel.json identically).
const PROTECTED = [/^vercel\.json$/, /^\.vercelignore$/, /^\.gitignore$/, /^serve-local\.mjs$/, /^scripts\//, /^\.github\//, /^README\.md$/];
const ASSET_TYPES = new Set([".png", ".webp", ".jpg", ".jpeg", ".gif", ".svg", ".woff", ".woff2", ".ttf", ".otf",
  ".mp3", ".ogg", ".wav", ".m4a", ".webm", ".mp4", ".json", ".glb", ".gltf", ".bin", ".wasm", ".txt"]);
const MAX_FILE = 10 * 1024 * 1024;
const MAX_VERSION = 50 * 1024 * 1024;
const MAX_THUMBNAIL = 512 * 1024;
const MAX_ABOUT = 20 * 1024;

// The game document `friendsdk build` writes (FriendSDK src/build/game.ts gameHtml). Only the title varies.
const CSP = ["default-src 'self'", "script-src 'self' 'wasm-unsafe-eval'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:",
  "font-src 'self' data:", "media-src 'self' data: blob:", "connect-src 'self' data: blob:", "worker-src 'self' blob:",
  "base-uri 'none'", "form-action 'none'", "object-src 'none'"].join("; ");
const escapeHtml = text => text.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[c]);
const gameHtml = (title, hasCss) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<title>${escapeHtml(title)}</title>
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}#root{width:100%;height:100%}</style>
${hasCss ? '<link rel="stylesheet" href="./game.css">\n' : ""}</head>
<body>
<div id="root"></div>
<script type="module" src="./game.js"></script>
</body>
</html>
`;

const errors = [];
const notes = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
const readJson = path => { try { return JSON.parse(readFileSync(path, "utf8")); } catch (error) { fail(path, `not valid JSON (${error.message})`); return undefined; } };
const isObject = value => typeof value === "object" && value !== null && !Array.isArray(value);
const compareVersions = (a, b) => { const x = a.split(".").map(Number), y = b.split(".").map(Number); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; };

// Tracked files plus new, unignored ones, so a submission can be checked before it is committed.
const files = git("ls-files", "--cached", "--others", "--exclude-standard", "-z").split("\0").filter(path => path && existsSync(path));

const games = new Map();
for (const path of files) {
  const [top, ...rest] = path.split("/");
  if (!rest.length) { if (!ROOT_FILES.has(top)) fail(path, "unexpected file at the top level"); continue; }
  if (ROOT_DIRS.has(top)) continue;
  if (!ID.test(top) || top.endsWith("-") || RESERVED.has(top)) { fail(top, "game ids are 2-32 characters of a-z, 0-9 and -, start with a letter, and do not end with -"); continue; }
  if (!games.has(top)) games.set(top, { listing: new Set(), versions: new Map() });
  const game = games.get(top);
  if (rest.length === 1) { game.listing.add(rest[0]); continue; }
  const [version, ...inner] = rest;
  if (!VERSION.test(version)) { fail(`${top}/${version}`, "versions are folders named MAJOR.MINOR.PATCH"); continue; }
  if (!game.versions.has(version)) game.versions.set(version, []);
  game.versions.get(version).push(inner.join("/"));
}

// ---------------------------------------------------------------- listings
const httpsUrl = (where, value, host) => {
  let url;
  try { url = new URL(value); } catch { fail(where, "is not a URL"); return; }
  if (url.protocol !== "https:") fail(where, "must be an https URL");
  else if (host && !host.test(url.hostname)) fail(where, `must be on ${host.source.replace(/\\|\^|\$|\(|\)|\?:/g, "")}`);
};
const strictKeys = (where, value, required, optional) => {
  if (!isObject(value)) { fail(where, "must be an object"); return false; }
  for (const key of required) if (!(key in value)) fail(where, `is missing "${key}"`);
  for (const key of Object.keys(value)) if (!required.includes(key) && !optional.includes(key)) fail(where, `has an unknown key "${key}"`);
  return true;
};
const text = (where, value, max) => {
  if (typeof value !== "string" || !value.trim()) fail(where, "must be a non-empty string");
  else if (value.length > max) fail(where, `must be at most ${max} characters`);
};

for (const [id, game] of games) {
  for (const name of game.listing) if (!["listing.json", "about.md", "thumbnail.webp"].includes(name)) fail(`${id}/${name}`, "a game folder holds listing.json, about.md, thumbnail.webp and version folders only");
  for (const name of ["listing.json", "about.md", "thumbnail.webp"]) if (!game.listing.has(name)) fail(`${id}/${name}`, "is missing");
  if (!game.versions.size) fail(id, "has no published version folder");

  if (game.listing.has("listing.json")) {
    const where = `${id}/listing.json`;
    const listing = readJson(where);
    if (listing !== undefined && strictKeys(where, listing, ["title", "category", "developer"], ["source"])) {
      text(`${where} title`, listing.title, 60);
      text(`${where} category`, listing.category, 40);
      if (listing.source !== undefined && listing.source !== null) httpsUrl(`${where} source`, listing.source);
      if (strictKeys(`${where} developer`, listing.developer, ["name"], ["x", "discord", "github"])) {
        const developer = listing.developer;
        text(`${where} developer.name`, developer.name, 40);
        if (developer.x != null) httpsUrl(`${where} developer.x`, developer.x, /^(x\.com|twitter\.com)$/);
        if (developer.discord != null) httpsUrl(`${where} developer.discord`, developer.discord, /^(discord\.gg|discord\.com)$/);
        if (developer.github != null) httpsUrl(`${where} developer.github`, developer.github, /^github\.com$/);
      }
    }
  }
  if (game.listing.has("about.md")) {
    const about = readFileSync(`${id}/about.md`, "utf8");
    if (!about.trim()) fail(`${id}/about.md`, "is empty");
    if (Buffer.byteLength(about) > MAX_ABOUT) fail(`${id}/about.md`, `must be at most ${MAX_ABOUT / 1024} KB`);
  }
  if (game.listing.has("thumbnail.webp")) {
    const image = readFileSync(`${id}/thumbnail.webp`);
    if (image.subarray(0, 4).toString("latin1") !== "RIFF" || image.subarray(8, 12).toString("latin1") !== "WEBP") fail(`${id}/thumbnail.webp`, "is not a WebP image");
    if (image.length > MAX_THUMBNAIL) fail(`${id}/thumbnail.webp`, `must be at most ${MAX_THUMBNAIL / 1024} KB`);
  }

  // -------------------------------------------------------------- versions
  for (const [version, contents] of game.versions) {
    const dir = `${id}/${version}`;
    for (const name of ["index.html", "friendsdk.json", "game.js"]) if (!contents.includes(name)) fail(`${dir}/${name}`, "is missing; publish the client folder from `friendsdk build`");
    let total = 0;
    for (const name of contents) {
      const size = statSync(`${dir}/${name}`).size;
      total += size;
      if (size > MAX_FILE) fail(`${dir}/${name}`, `is over ${MAX_FILE / 1024 / 1024} MB`);
      if (["index.html", "friendsdk.json", "game.js", "game.css"].includes(name)) continue;
      // assets/ from the bundler and the game's public/ folder; no other documents or scripts.
      if (!ASSET_TYPES.has(extname(name).toLowerCase())) fail(`${dir}/${name}`, `${extname(name) || "a file without an extension"} is not an allowed asset type`);
    }
    if (total > MAX_VERSION) fail(dir, `is over ${MAX_VERSION / 1024 / 1024} MB`);
    if (!contents.includes("friendsdk.json")) continue;
    const manifest = readJson(`${dir}/friendsdk.json`);
    if (!isObject(manifest)) continue;
    if (manifest.id !== id) fail(`${dir}/friendsdk.json`, `id is "${manifest.id}", but the folder is ${id}`);
    if (manifest.version !== version) fail(`${dir}/friendsdk.json`, `version is "${manifest.version}", but the folder is ${version}`);
    if (typeof manifest.title !== "string") { fail(`${dir}/friendsdk.json`, "has no title"); continue; }
    if (contents.includes("index.html") && readFileSync(`${dir}/index.html`, "utf8") !== gameHtml(manifest.title, contents.includes("game.css"))) {
      fail(`${dir}/index.html`, "differs from the document `friendsdk build` writes; do not edit it");
    }
  }
}

// ---------------------------------------------------------------- games.json
const index = readJson("games.json");
if (index !== undefined && strictKeys("games.json", index, ["games"], []) && isObject(index.games)) {
  for (const [id, entry] of Object.entries(index.games)) {
    const where = `games.json games.${id}`;
    if (!games.has(id)) { fail(where, "has no game folder"); continue; }
    if (!strictKeys(where, entry, ["versions", "latest"], []) || !Array.isArray(entry.versions)) continue;
    const listed = [...entry.versions].sort(compareVersions);
    const folders = [...games.get(id).versions.keys()].sort(compareVersions);
    if (listed.join() !== folders.join()) fail(where, `lists ${listed.join(", ") || "nothing"}, but the folders are ${folders.join(", ") || "none"}`);
    if (new Set(entry.versions).size !== entry.versions.length) fail(where, "lists a version twice");
    if (entry.latest !== entry.versions.at(-1)) fail(where, "latest must be the last version listed");
  }
  for (const id of games.keys()) if (!(id in index.games)) fail(`games.json games.${id}`, "is missing; `friendsdk site` adds it");
}

// ---------------------------------------------------------------- pull request rules
const baseAt = process.argv.indexOf("--base");
if (baseAt !== -1) {
  const base = process.argv[baseAt + 1];
  if (!base) { console.error("--base needs a git ref."); process.exit(2); }
  try { git("rev-parse", "--verify", "--quiet", `${base}^{commit}`); } catch { console.error(`--base ${base} is not a commit here; fetch it first (git fetch origin main).`); process.exit(2); }
  const changes = git("diff", "--name-status", "--no-renames", "-z", `${base}...HEAD`).split("\0").filter(Boolean);
  // Uncommitted work counts too when the check runs locally.
  const local = git("status", "--porcelain", "--no-renames", "-z", "--untracked-files=all").split("\0").filter(Boolean)
    .map(line => [line.slice(0, 2).includes("D") ? "D" : line.slice(0, 2).includes("?") || line.slice(0, 2).includes("A") ? "A" : "M", line.slice(3)]);
  const changed = new Map();
  for (let i = 0; i < changes.length; i += 2) changed.set(changes[i + 1], changes[i]);
  for (const [status, path] of local) if (!changed.has(path)) changed.set(path, status);
  const existed = path => { try { git("cat-file", "-e", `${base}:${path}`); return true; } catch { return false; } };

  const touched = new Set();
  for (const [path, status] of changed) {
    if (PROTECTED.some(rule => rule.test(path))) { fail(path, "is maintained by Rare Friends; leave it out of the pull request (run `git checkout <base> -- " + path + "`)"); continue; }
    const [top, version, ...inner] = path.split("/");
    if (path === "games.json") continue;
    touched.add(top);
    if (version && inner.length && VERSION.test(version) && (status !== "A" || existed(path))) {
      fail(path, "published versions never change; publish a new version instead");
    }
  }
  if (touched.size > 1) fail("pull request", `changes ${[...touched].join(", ")}; submit one game per pull request`);
  for (const id of touched) {
    const before = (() => { try { return JSON.parse(git("show", `${base}:games.json`)).games[id]?.versions ?? []; } catch { return []; } })();
    const added = [...(games.get(id)?.versions.keys() ?? [])].filter(version => !before.includes(version));
    const newest = before.length ? before.at(-1) : null;
    for (const version of added) if (newest && compareVersions(version, newest) <= 0) fail(`${id}/${version}`, `must be newer than ${newest}`);
    for (const version of added) {
      const manifest = JSON.parse(readFileSync(`${id}/${version}/friendsdk.json`, "utf8"));
      const priced = Object.values(manifest.actions ?? {}).filter(action => action?.price !== undefined || ["draw", "custom", "external"].includes(action?.type));
      notes.push(`${id} ${version}: ${before.length ? "update" : "new game"}`);
      if (manifest.server) notes.push(`${id} ${version}: has server rules; Rare Friends deploys them from the listed source`);
      if (priced.length && !before.length) notes.push(`${id} ${version}: ${priced.length} paid actions need contract registration before they go live`);
    }
  }
}

for (const note of notes) console.log(`note  ${note}`);
if (errors.length) {
  for (const error of errors) console.log(`FAIL  ${error}`);
  process.exit(1);
}
console.log(`ok    ${games.size} games, ${[...games.values()].reduce((sum, game) => sum + game.versions.size, 0)} versions`);
