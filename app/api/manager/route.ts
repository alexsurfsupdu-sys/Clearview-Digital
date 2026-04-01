import { NextResponse } from "next/server";

import { readManagerStateFromDisk, writeManagerStateToDisk } from "@/lib/manager/persist";
import { normalizeManagerState } from "@/lib/manager/state";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const state = await readManagerStateFromDisk();
    return NextResponse.json(state);
  } catch (e) {
    const message = e instanceof Error ? e.message : "read_failed";
    return NextResponse.json({ error: "manager_read_failed", message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: unknown = await request.json();
    const state = normalizeManagerState(body);
    if (state.version !== 1) {
      return NextResponse.json({ error: "invalid_version" }, { status: 400 });
    }
    await writeManagerStateToDisk(state);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "write_failed";
    return NextResponse.json({ error: "manager_write_failed", message }, { status: 500 });
  }
}
