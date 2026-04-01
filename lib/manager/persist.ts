import path from "path";
import fs from "fs/promises";
import { createClient } from "redis";
import { Redis } from "@upstash/redis";

import type { ManagerPersistedState } from "./types";
import { getDefaultManagerState, normalizeManagerState } from "./state";

const REDIS_KEY = "cv:manager:state:v1";

let redisSingleton: Redis | null | undefined;

/**
 * Upstash REST (HTTPS) — try names Vercel / Upstash / KV integrations use.
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

function getRestRedis(): Redis | null {
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

/** Vercel “Redis” integration: single `REDIS_URL` (redis:// or rediss://). */
function getTcpRedisUrl(): string | null {
  const url = process.env.REDIS_URL?.trim();
  if (!url || url.startsWith("http")) return null;
  if (!url.startsWith("redis://") && !url.startsWith("rediss://")) return null;
  return url;
}

type TcpRedis = Awaited<ReturnType<typeof createClient>>;
let tcpClient: TcpRedis | undefined;
let tcpInitPromise: Promise<TcpRedis | null> | null = null;

async function getTcpClient(): Promise<TcpRedis | null> {
  const url = getTcpRedisUrl();
  if (!url) return null;
  if (tcpClient?.isOpen) return tcpClient;

  if (!tcpInitPromise) {
    tcpInitPromise = (async () => {
      try {
        const client = createClient({ url });
        client.on("error", () => {});
        await client.connect();
        tcpClient = client;
        return client;
      } catch {
        tcpInitPromise = null;
        return null;
      }
    })();
  }
  return tcpInitPromise;
}

/** `redis` when REST or TCP Redis env is set; otherwise local file. */
export function getPersistenceMode(): "redis" | "file" {
  if (getRestRedis()) return "redis";
  if (getTcpRedisUrl()) return "redis";
  return "file";
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

/** Read state: Upstash REST, then Vercel `REDIS_URL` (TCP), else file. */
export async function readManagerState(): Promise<ManagerPersistedState> {
  const rest = getRestRedis();
  if (rest) {
    try {
      const raw = await rest.get<string>(REDIS_KEY);
      if (raw == null || raw === "") return getDefaultManagerState();
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return normalizeManagerState(parsed as unknown);
    } catch {
      return getDefaultManagerState();
    }
  }

  const tcp = await getTcpClient();
  if (tcp) {
    try {
      const raw = await tcp.get(REDIS_KEY);
      if (raw == null || raw === "") return getDefaultManagerState();
      return normalizeManagerState(JSON.parse(raw) as unknown);
    } catch {
      return getDefaultManagerState();
    }
  }

  return readManagerStateFromFile();
}

/** Write state to Redis (REST or TCP) or local file. */
export async function writeManagerState(state: ManagerPersistedState): Promise<void> {
  const payload = JSON.stringify(state);

  const rest = getRestRedis();
  if (rest) {
    await rest.set(REDIS_KEY, payload);
    return;
  }

  const tcp = await getTcpClient();
  if (tcp) {
    await tcp.set(REDIS_KEY, payload);
    return;
  }

  await writeManagerStateToFile(state);
}
