import path from "path";
import fs from "fs/promises";

import type { ManagerPersistedState } from "./types";
import { getDefaultManagerState, normalizeManagerState } from "./state";

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

export async function readManagerStateFromDisk(): Promise<ManagerPersistedState> {
  const file = resolveDataPath();
  try {
    const raw = await fs.readFile(file, "utf-8");
    return normalizeManagerState(JSON.parse(raw) as unknown);
  } catch {
    return getDefaultManagerState();
  }
}

export async function writeManagerStateToDisk(state: ManagerPersistedState): Promise<void> {
  const file = resolveDataPath();
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const tmp = `${file}.tmp`;
  const payload = JSON.stringify(state, null, 2);
  await fs.writeFile(tmp, payload, "utf-8");
  await fs.rename(tmp, file);
}
