import { NextResponse } from "next/server";

import { readManagerState, writeManagerState } from "@/lib/manager/persist";
import { normalizeManagerState } from "@/lib/manager/state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Machine / AI agent hook. Auth: `Authorization: Bearer <MANAGER_AGENT_SECRET>`.
 * Extend the POST body schema as you add automations (e.g. append tasks, log activity).
 */
export async function POST(request: Request) {
  const secret = process.env.MANAGER_AGENT_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json(
      { error: "MANAGER_AGENT_SECRET not set (16+ chars in Vercel env)" },
      { status: 503 },
    );
  }
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  if (o.action === "get_state") {
    const state = await readManagerState();
    return NextResponse.json({ ok: true, state });
  }

  if (o.action === "put_state" && o.state) {
    const state = normalizeManagerState(o.state);
    if (state.version !== 1) {
      return NextResponse.json({ error: "invalid_version" }, { status: 400 });
    }
    await writeManagerState(state);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    {
      ok: true,
      message:
        "Supported actions: get_state, put_state (with full state object). Add more actions as your agents grow.",
    },
    { status: 200 },
  );
}
