import path from "path";
import fs from "fs/promises";
import { Redis } from "@upstash/redis";

import type { ManagerPersistedState } from "./types";
import { getDefaultManagerState, normalizeManagerState } from "./state";

const REDIS_KEY = "cv:manager:state:v1";

let redisSingleton: Redis | null | undefined;

/**
 * Upstash REST (HTTPS) — try names Vercel / Upstash / KV integrations use.
 * Ignores `redis://` style URLs (TCP); those need a different client.
 */
function getUpstashRestCredentials(): { url: string; token: string } | null {
  const pick = (u: string | undefined, t: string | undefined) => {
    const url = u?.trim();
    const token = t?.trim();
    if (!url || !token) return null;
    if (!url.startsWith("http")) return null;
    return { url, token };
  };

  return (
    pick(process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN) ??
    pick(process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN) ??
    pick(process.env.REDIS_URL, process.env.REDIS_TOKEN)
  );
}

function getRedis(): Redis | null {
  if (redisSingleton !== undefined) return redisSingleton;
  const creds = getUpstashRestCredentials();
  if (!creds) {
    redisSingleton = null;
    return null;
  }
  try {
    redisSingleton = new Redis({ url: creds.url, token: creds.token });
    return redisSingleton;
  } catch {
    redisSingleton = null;
    return null;
  }
}

/** `redis` when Upstash env is set (Vercel Redis integration); otherwise local JSON file. */
export function getPersistenceMode(): "redis" | "file" {
  return getRedis() ? "redis" : "file";
}

function resolveDataPath(): string {
  const override = process.env.MANAGER_DATA_PATH;
  if (override && override.trim()) return path.resolve(override.trim());
  return path.join(
    /* turbopackIgnore: true */
    process.cwd(),
    "data",
    "manager-state.json",
  );
}

export function getManagerStatePath(): string {
  return resolveDataPath();
}

async function readManagerStateFromFile(): Promise<ManagerPersistedState> {
  const file = resolveDataPath();
  try {
    const raw = await fs.readFile(file, "utf-8");
    return normalizeManagerState(JSON.parse(raw) as unknown);
  } catch {
    return getDefaultManagerState();
  }
}

async function writeManagerStateToFile(state: ManagerPersistedState): Promise<void> {
  const file = resolveDataPath();
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const tmp = `${file}.tmp`;
  const payload = JSON.stringify(state, null, 2);
  await fs.writeFile(tmp, payload, "utf-8");
  await fs.rename(tmp, file);
}

/** Read state: Upstash Redis on Vercel when linked; else local `data/manager-state.json`. */
export async function readManagerState(): Promise<ManagerPersistedState> {
  const r = getRedis();
  if (r) {
    try {
      const raw = await r.get<string>(REDIS_KEY);
      if (raw == null || raw === "") return getDefaultManagerState();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return normalizeManagerState(parsed as unknown);
    } catch {
      return getDefaultManagerState();
    }
  }
  return readManagerStateFromFile();
}

/** Write state to Redis or local file. */
export async function writeManagerState(state: ManagerPersistedState): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.set(REDIS_KEY, JSON.stringify(state));
    return;
  }
  await writeManagerStateToFile(state);
}
