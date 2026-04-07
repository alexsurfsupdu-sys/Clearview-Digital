import { NextResponse } from "next/server";

import { readManagerState, writeManagerState } from "@/lib/manager/persist";
import { analyzeLead } from "@/lib/manager/lead-analysis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/manager/leads/[id]/analysis — (re-)analyze a lead and persist results */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const state = await readManagerState();
    const lead = state.leads.find((l) => l.id === id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const analysis = analyzeLead(lead);
    const updatedLead = { ...lead, analysis };

    await writeManagerState({
      ...state,
      leads: state.leads.map((l) => (l.id === id ? updatedLead : l)),
      activity: [
        {
          id: crypto.randomUUID(),
          at: new Date().toLocaleString(),
          label: `AI analysis complete: ${lead.name} — ${lead.business}`,
          tone: "info" as const,
        },
        ...state.activity,
      ].slice(0, 80),
    });

    return NextResponse.json({ ok: true, analysis });
  } catch (e) {
    const message = e instanceof Error ? e.message : "analysis_failed";
    return NextResponse.json({ error: "analysis_failed", message }, { status: 500 });
  }
}
