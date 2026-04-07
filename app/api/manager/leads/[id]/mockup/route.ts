import { readManagerState } from "@/lib/manager/persist";
import { analyzeLead, generateMockupHtml } from "@/lib/manager/lead-analysis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/manager/leads/[id]/mockup — generate wireframe HTML for a lead */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const state = await readManagerState();
    const lead = state.leads.find((l) => l.id === id);
    if (!lead) {
      return new Response("<h1>Lead not found</h1>", {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Use stored analysis or generate fresh
    const analysis = lead.analysis ?? analyzeLead(lead);
    const html = generateMockupHtml(lead, analysis);

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "mockup_failed";
    return new Response(`<p>Error generating mockup: ${message}</p>`, {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}
