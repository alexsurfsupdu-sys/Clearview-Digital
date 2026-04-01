import { NextResponse } from "next/server";

import { getPersistenceMode, readManagerState, writeManagerState } from "@/lib/manager/persist";
import { normalizeManagerState } from "@/lib/manager/state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const state = await readManagerState();
    const store = getPersistenceMode();
    const onVercel = Boolean(process.env.VERCEL);
    return NextResponse.json({
      ...state,
      _meta: {
        store,
        onVercel,
        /** Same host the browser uses — homepage scan uses this origin. */
        publicOrigin: new URL(request.url).origin,
      },
    });
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
    await writeManagerState(state);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "write_failed";
    return NextResponse.json({ error: "manager_write_failed", message }, { status: 500 });
  }
}
