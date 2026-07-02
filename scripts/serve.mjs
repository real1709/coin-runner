import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "0.0.0.0";

const dataDir = path.join(rootDir, "data");
const leaderboardFilePath = path.join(dataDir, "leaderboard.json");
const MAX_SERVER_LEADERBOARD = 200;
const DEFAULT_LEADERBOARD_LIMIT = 50;
const MAX_BODY_BYTES = 24 * 1024;

const mimeByExt = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav"
};

let leaderboardCache = null;
let leaderboardWriteQueue = Promise.resolve();

function resolveSafePath(urlPathname) {
  const clean = urlPathname === "/" ? "/index.html" : urlPathname;
  const normalized = path.normalize(clean).replace(/^(\.\.[/\\])+/, "");
  return path.join(rootDir, normalized);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0"
  });
  res.end(JSON.stringify(payload));
}

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, n));
}

function sanitizeNickname(raw) {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 12);
}

function sanitizeTaunt(raw) {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 20);
}

function normalizeSingleEntry(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const safeId = String(source.id || "").trim().slice(0, 64);
  const id =
    safeId ||
    "run_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  return {
    id,
    nickname: sanitizeNickname(source.nickname || "플레이어") || "플레이어",
    taunt: sanitizeTaunt(source.taunt || ""),
    distance: Math.max(0, Math.round(Number(source.distance) || 0)),
    level: Math.max(1, Math.round(Number(source.level) || 1)),
    timestamp: Number(source.timestamp) || Date.now()
  };
}

function normalizeLeaderboard(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }
  return entries
    .map(normalizeSingleEntry)
    .filter(function (entry) {
      return !!entry.id;
    })
    .sort(function (a, b) {
      return b.distance - a.distance || b.level - a.level || a.timestamp - b.timestamp;
    })
    .slice(0, MAX_SERVER_LEADERBOARD);
}

async function readLeaderboard() {
  if (leaderboardCache) {
    return leaderboardCache.slice();
  }
  try {
    const text = await readFile(leaderboardFilePath, "utf8");
    leaderboardCache = normalizeLeaderboard(JSON.parse(text));
  } catch {
    leaderboardCache = [];
  }
  return leaderboardCache.slice();
}

async function writeLeaderboard(entries) {
  const next = normalizeLeaderboard(entries);
  leaderboardCache = next;
  const payload = JSON.stringify(next, null, 2);
  leaderboardWriteQueue = leaderboardWriteQueue
    .catch(function () {
      // Ignore previous write failures and continue queue.
    })
    .then(async function () {
      await mkdir(dataDir, { recursive: true });
      await writeFile(leaderboardFilePath, payload, "utf8");
    });
  await leaderboardWriteQueue;
  return leaderboardCache.slice();
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      const error = new Error("Payload too large");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error("Invalid JSON");
    error.statusCode = 400;
    throw error;
  }
}

function parseLimit(url) {
  return clampInt(
    url.searchParams.get("limit"),
    1,
    MAX_SERVER_LEADERBOARD,
    DEFAULT_LEADERBOARD_LIMIT
  );
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Cache-Control": "no-store, max-age=0"
    });
    res.end();
    return true;
  }

  if (url.pathname === "/api/leaderboard" && req.method === "GET") {
    const leaderboard = await readLeaderboard();
    sendJson(res, 200, {
      leaderboard: leaderboard.slice(0, parseLimit(url))
    });
    return true;
  }

  if (url.pathname === "/api/leaderboard" && req.method === "POST") {
    const body = await readJsonBody(req);
    const entry = normalizeSingleEntry(body);
    const current = await readLeaderboard();
    const withoutDup = current.filter(function (item) {
      return item.id !== entry.id;
    });
    const saved = await writeLeaderboard(withoutDup.concat(entry));
    sendJson(res, 200, {
      ok: true,
      entry,
      leaderboard: saved.slice(0, parseLimit(url))
    });
    return true;
  }

  if (url.pathname === "/api/leaderboard/taunt" && req.method === "POST") {
    const body = await readJsonBody(req);
    const targetId = String(body.id || "").trim();
    if (!targetId) {
      sendJson(res, 400, { ok: false, message: "id is required" });
      return true;
    }

    const taunt = sanitizeTaunt(body.taunt || "");
    const nickname = sanitizeNickname(body.nickname || "");
    const current = await readLeaderboard();
    let matched = false;
    const updated = current.map(function (entry) {
      if (entry.id !== targetId) {
        return entry;
      }
      matched = true;
      return Object.assign({}, entry, {
        taunt,
        nickname: nickname || entry.nickname
      });
    });

    if (!matched) {
      sendJson(res, 404, { ok: false, message: "entry not found" });
      return true;
    }

    const saved = await writeLeaderboard(updated);
    sendJson(res, 200, {
      ok: true,
      leaderboard: saved.slice(0, parseLimit(url))
    });
    return true;
  }

  return false;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(req, res, url);
      if (!handled) {
        sendJson(res, 404, { ok: false, message: "Not found" });
      }
      return;
    }

    const fullPath = resolveSafePath(url.pathname);
    if (!fullPath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const data = await readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = mimeByExt[ext] ?? "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store, max-age=0"
    });
    res.end(data);
  } catch (error) {
    const statusCode = Number(error && error.statusCode) || 500;
    if (statusCode >= 400 && statusCode < 500) {
      sendJson(res, statusCode, {
        ok: false,
        message: error.message || "Bad request"
      });
      return;
    }
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`Demo server running: http://${displayHost}:${port}`);
});
