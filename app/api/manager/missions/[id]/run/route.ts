import { NextResponse } from "next/server";

import { readManagerState, writeManagerState } from "@/lib/manager/persist";
import type { AgentMission, ManagerPersistedState, MissionLogEntry } from "@/lib/manager/types";
import { analyzeLead } from "@/lib/manager/lead-analysis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* -------------------------------------------------------------------------- */
/* Agent execution logic — one function per specialty                         */
/* -------------------------------------------------------------------------- */

async function executeCustomerSurveyor(mission: AgentMission, state: ManagerPersistedState): Promise<string> {
  const leads = state.leads;
  if (leads.length === 0) {
    return "No leads in the pipeline yet. Submit your first quote request through the contact form to start gathering customer data.";
  }

  // Aggregate analysis results across leads
  const allSections: Record<string, number> = {};
  const allFeatures: Record<string, number> = {};
  const allBusinessTypes: Record<string, number> = {};
  const budgetCounts: Record<string, number> = {};
  const stageCounts: Record<string, number> = {};
  let analyzed = 0;

  for (const lead of leads) {
    // Count stages
    stageCounts[lead.stage] = (stageCounts[lead.stage] ?? 0) + 1;

    const a = lead.analysis ?? analyzeLead(lead);
    analyzed++;

    if (a.businessType) allBusinessTypes[a.businessType] = (allBusinessTypes[a.businessType] ?? 0) + 1;
    if (a.budget && a.budget !== "Not specified") budgetCounts[a.budget] = (budgetCounts[a.budget] ?? 0) + 1;
    for (const s of a.sections) allSections[s] = (allSections[s] ?? 0) + 1;
    for (const f of a.features) allFeatures[f] = (allFeatures[f] ?? 0) + 1;
  }

  const topSections = Object.entries(allSections).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topFeatures = Object.entries(allFeatures).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topBizTypes = Object.entries(allBusinessTypes).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const lines: string[] = [
    `═══ CUSTOMER SURVEYOR REPORT ═══`,
    `Analyzed ${analyzed} leads (${leads.length} total in pipeline)`,
    ``,
    `PIPELINE STAGES:`,
    ...Object.entries(stageCounts).map(([s, n]) => `  • ${s}: ${n} lead${n !== 1 ? "s" : ""}`),
    ``,
    `TOP REQUESTED WEBSITE SECTIONS:`,
    ...topSections.map(([s, n]) => `  ${n}× ${s}`),
    ``,
    `MOST REQUESTED FEATURES:`,
    ...topFeatures.map(([f, n]) => `  ${n}× ${f}`),
    ``,
    `CUSTOMER BUSINESS TYPES:`,
    ...topBizTypes.map(([t, n]) => `  ${n}× ${t}`),
    ``,
    `RECOMMENDATION: Focus your proposals on ${topSections[0]?.[0] ?? "standard sections"} and ${topFeatures[0]?.[0] ?? "core features"} as these appear most frequently in customer requests.`,
    `Report generated: ${new Date().toLocaleString()}`,
  ];

  return lines.join("\n");
}

async function executeEmailReviewer(mission: AgentMission, state: ManagerPersistedState): Promise<string> {
  const leads = state.leads.slice(0, 10); // Review last 10
  if (leads.length === 0) {
    return "No leads to review. Once customers submit through the contact form, their inquiries will appear here.";
  }

  const lines: string[] = [
    `═══ EMAIL / LEAD REVIEWER REPORT ═══`,
    `Reviewing ${leads.length} most recent leads:`,
    ``,
  ];

  for (const lead of leads) {
    lines.push(`─── ${lead.name} — ${lead.business} ───`);
    lines.push(`  Email: ${lead.email}${lead.phone ? ` · Phone: ${lead.phone}` : ""}`);
    lines.push(`  Stage: ${lead.stage} · Source: ${lead.source}`);
    if (lead.analysis?.summary) {
      lines.push(`  Summary: ${lead.analysis.summary}`);
    }
    if (lead.notes) {
      const shortNotes = lead.notes.slice(0, 180).replace(/\n/g, " ");
      lines.push(`  Notes: ${shortNotes}${lead.notes.length > 180 ? "…" : ""}`);
    }
    lines.push(`  Next step: ${lead.nextStep || "Not set"}`);
    lines.push(``);
  }

  const newLeads = leads.filter((l) => l.stage === "new").length;
  lines.push(`ACTION: ${newLeads} lead${newLeads !== 1 ? "s" : ""} still in "new" stage — contact them to move the pipeline forward.`);
  lines.push(`Report generated: ${new Date().toLocaleString()}`);

  return lines.join("\n");
}

async function executeSEOAnalyst(mission: AgentMission, state: ManagerPersistedState): Promise<string> {
  const baseline = state.baseline;
  const audit = state.audit;

  const lines: string[] = [
    `═══ SEO ANALYST REPORT ═══`,
    `Business: ${baseline.businessName}`,
    `Goal: ${baseline.primaryGoal}`,
    `Audience: ${baseline.targetAudience}`,
    ``,
    `LAST AUDIT RESULTS:`,
  ];

  if (audit) {
    lines.push(`  Score: ${audit.score}% · Audited: ${audit.auditedAt}`);
    lines.push(`  URL: ${audit.homepageUrl}`);
    lines.push(``);
    lines.push(`  CHECKS:`);
    for (const check of audit.checks) {
      lines.push(`  ${check.status === "pass" ? "✓" : "✗"} ${check.label}: ${check.detail}`);
    }
    if (audit.missingSections.length > 0) {
      lines.push(``);
      lines.push(`  MISSING SECTIONS: ${audit.missingSections.join(", ")}`);
    }
    lines.push(``);
    lines.push(`SEO RECOMMENDATIONS:`);
    if (audit.score < 80) {
      lines.push(`  • Run a fresh homepage scan to catch regressions`);
      lines.push(`  • Fix failing checks before optimizing further`);
    }
    lines.push(`  • Ensure meta title includes primary keyword + brand name`);
    lines.push(`  • Meta description should be 150-160 characters with a clear CTA`);
    lines.push(`  • All images should have descriptive alt text`);
    lines.push(`  • Use structured data (Schema.org) for local business / services`);
    lines.push(`  • Add a sitemap.xml and submit to Google Search Console`);
    lines.push(`  • Ensure page loads under 3 seconds on mobile (check Core Web Vitals)`);
  } else {
    lines.push(`  No audit data yet. Run "Run homepage scan" from the control center to get SEO data.`);
    lines.push(``);
    lines.push(`GENERAL SEO CHECKLIST:`);
    lines.push(`  • Page title: includes primary keyword + brand`);
    lines.push(`  • Meta description: 150-160 chars with call to action`);
    lines.push(`  • H1 heading: one per page, includes target keyword`);
    lines.push(`  • Image alt text: descriptive, includes keywords`);
    lines.push(`  • Internal links: service pages linked from homepage`);
    lines.push(`  • Google Business Profile: claimed and optimized`);
    lines.push(`  • Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms`);
  }

  lines.push(``);
  lines.push(`Report generated: ${new Date().toLocaleString()}`);
  return lines.join("\n");
}

async function executeAnalyticsAgent(mission: AgentMission, state: ManagerPersistedState): Promise<string> {
  const leads = state.leads;
  const now = new Date();

  // Group leads by month
  const byMonth: Record<string, number> = {};
  for (const lead of leads) {
    const d = new Date(lead.createdAt);
    if (!isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] ?? 0) + 1;
    }
  }

  const recentLeads = leads.filter((l) => {
    const d = new Date(l.createdAt);
    return !isNaN(d.getTime()) && now.getTime() - d.getTime() < 30 * 24 * 3600 * 1000;
  });

  const wonLeads = leads.filter((l) => l.stage === "won");
  const lostLeads = leads.filter((l) => l.stage === "lost");
  const conversionRate = leads.length > 0 ? ((wonLeads.length / leads.length) * 100).toFixed(1) : "0.0";

  const lines: string[] = [
    `═══ ANALYTICS AGENT REPORT ═══`,
    `Analysis period: All time (${leads.length} total leads)`,
    ``,
    `PIPELINE OVERVIEW:`,
    `  Total leads: ${leads.length}`,
    `  Last 30 days: ${recentLeads.length}`,
    `  Won: ${wonLeads.length} · Lost: ${lostLeads.length}`,
    `  Conversion rate: ${conversionRate}%`,
    ``,
    `LEADS BY MONTH:`,
    ...Object.entries(byMonth).sort().reverse().slice(0, 6).map(([m, n]) => `  ${m}: ${n} lead${n !== 1 ? "s" : ""}`),
  ];

  if (Object.keys(byMonth).length === 0) {
    lines.push(`  No dated leads yet — add leads via the contact form to start tracking.`);
  }

  const clients = state.clients;
  lines.push(``);
  lines.push(`CLIENT HEALTH SUMMARY:`);
  lines.push(`  Total clients: ${clients.length}`);
  lines.push(`  Healthy: ${clients.filter((c) => c.status === "healthy").length}`);
  lines.push(`  Needs attention: ${clients.filter((c) => c.status === "attention").length}`);
  lines.push(`  At risk: ${clients.filter((c) => c.status === "risk").length}`);
  lines.push(`  Billing overdue: ${clients.filter((c) => !c.billingCurrent).length}`);
  lines.push(``);
  lines.push(`RECOMMENDATION: ${recentLeads.length === 0 ? "No new leads in 30 days — consider a marketing push." : `${recentLeads.length} leads this month. Focus on converting the ${leads.filter((l) => l.stage === "new" || l.stage === "contacted").length} leads still in early stages.`}`);
  lines.push(`Report generated: ${new Date().toLocaleString()}`);
  return lines.join("\n");
}

async function executeErrorDetector(mission: AgentMission, state: ManagerPersistedState): Promise<string> {
  const lines: string[] = [
    `═══ ERROR DETECTOR REPORT ═══`,
    ``,
    `TASK LIST ERRORS:`,
  ];

  const tasks = state.tasks;
  const overdueTasks = tasks.filter((t) => {
    if (!t.due || t.status === "done") return false;
    const due = new Date(t.due);
    return !isNaN(due.getTime()) && due < new Date();
  });

  if (overdueTasks.length > 0) {
    lines.push(`  ⚠ ${overdueTasks.length} overdue task${overdueTasks.length !== 1 ? "s" : ""} detected:`);
    for (const t of overdueTasks.slice(0, 5)) {
      lines.push(`    - "${t.title}" (due ${t.due})`);
    }
  } else {
    lines.push(`  ✓ No overdue tasks`);
  }

  const unassigned = tasks.filter((t) => t.assignee === "Unassigned" && t.status !== "done");
  if (unassigned.length > 0) {
    lines.push(`  ⚠ ${unassigned.length} task${unassigned.length !== 1 ? "s" : ""} unassigned (no specialty set)`);
  } else {
    lines.push(`  ✓ All tasks have assigned specialties`);
  }

  lines.push(``);
  lines.push(`CLIENT HEALTH ERRORS:`);
  const riskClients = state.clients.filter((c) => c.status === "risk");
  const attnClients = state.clients.filter((c) => c.status === "attention");
  const billingIssues = state.clients.filter((c) => !c.billingCurrent);

  if (riskClients.length > 0) {
    lines.push(`  🔴 ${riskClients.length} client${riskClients.length !== 1 ? "s" : ""} at risk: ${riskClients.map((c) => c.name).join(", ")}`);
  }
  if (attnClients.length > 0) {
    lines.push(`  🟡 ${attnClients.length} client${attnClients.length !== 1 ? "s" : ""} needing attention: ${attnClients.map((c) => c.name).join(", ")}`);
  }
  if (billingIssues.length > 0) {
    lines.push(`  💰 ${billingIssues.length} billing overdue: ${billingIssues.map((c) => c.name).join(", ")}`);
  }
  if (riskClients.length + attnClients.length + billingIssues.length === 0) {
    lines.push(`  ✓ All clients healthy`);
  }

  lines.push(``);
  lines.push(`AUDIT STATUS:`);
  if (!state.audit) {
    lines.push(`  ⚠ No homepage audit run yet — run "Run homepage scan" to detect site errors`);
  } else {
    const failed = state.audit.checks.filter((c) => c.status === "fail");
    if (failed.length > 0) {
      lines.push(`  ⚠ ${failed.length} homepage check${failed.length !== 1 ? "s" : ""} failing:`);
      for (const f of failed) {
        lines.push(`    - ${f.label}: ${f.detail}`);
      }
    } else {
      lines.push(`  ✓ Homepage passing all checks (score: ${state.audit.score}%)`);
    }
  }

  const totalErrors = overdueTasks.length + riskClients.length + billingIssues.length + (!state.audit ? 1 : state.audit.checks.filter((c) => c.status === "fail").length);
  lines.push(``);
  lines.push(`SUMMARY: ${totalErrors} error${totalErrors !== 1 ? "s" : ""} detected requiring attention.`);
  lines.push(`Report generated: ${new Date().toLocaleString()}`);
  return lines.join("\n");
}

async function executeContentWriter(mission: AgentMission, state: ManagerPersistedState): Promise<string> {
  const baseline = state.baseline;

  return [
    `═══ CONTENT WRITER REPORT ═══`,
    `Generated copy suggestions for: ${baseline.businessName}`,
    `Goal: ${baseline.primaryGoal}`,
    ``,
    `━━━ HERO SECTION ━━━`,
    `Headline: "Professional Websites That Turn Visitors Into Clients"`,
    `Sub-headline: "We design and build high-converting websites for ${baseline.targetAudience.toLowerCase()}. Fast delivery, full support, results guaranteed."`,
    `CTA: "Get Your Free Proposal"`,
    ``,
    `━━━ SERVICES SECTION ━━━`,
    `Headline: "Everything You Need to Win Online"`,
    `Service 1: Custom Website Design — Mobile-optimized, conversion-focused design tailored to your brand.`,
    `Service 2: Monthly Management — We handle updates, security, performance, and uptime so you don't have to.`,
    `Service 3: SEO & Growth — More organic traffic, better search rankings, and measurable results.`,
    ``,
    `━━━ TRUST / SOCIAL PROOF ━━━`,
    `Headline: "Trusted by Growing Businesses"`,
    `Sub-text: "From first-time business owners to established brands, we've helped clients across dozens of industries grow their online presence."`,
    ``,
    `━━━ CONTACT / CTA SECTION ━━━`,
    `Headline: "Ready to Get Started?"`,
    `Sub-text: "Tell us about your project and we'll send you a free, no-obligation proposal within 24 hours."`,
    `CTA Button: "Request a Free Proposal"`,
    ``,
    `━━━ META DESCRIPTION (SEO) ━━━`,
    `"${baseline.businessName} — professional website design and management for ${baseline.targetAudience.toLowerCase()}. Fast, modern, conversion-focused sites. Get a free proposal today."`,
    `(${(`${baseline.businessName} — professional website design and management for ${baseline.targetAudience.toLowerCase()}. Fast, modern, conversion-focused sites. Get a free proposal today.`).length} chars — ideal: 150–160)`,
    ``,
    `Report generated: ${new Date().toLocaleString()}`,
  ].join("\n");
}

async function executeMaintenance(mission: AgentMission, state: ManagerPersistedState): Promise<string> {
  const tasks = state.tasks;
  const clients = state.clients;
  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const maintenanceTasks = pendingTasks.filter((t) => t.assignee === "Maintenance");

  return [
    `═══ MAINTENANCE AGENT REPORT ═══`,
    ``,
    `TASK QUEUE:`,
    `  Total open: ${pendingTasks.length}`,
    `  Maintenance lane: ${maintenanceTasks.length}`,
    `  Unassigned: ${pendingTasks.filter((t) => t.assignee === "Unassigned").length}`,
    ``,
    `MAINTENANCE TASKS:`,
    ...(maintenanceTasks.length > 0
      ? maintenanceTasks.slice(0, 8).map((t) => `  [${t.status}] ${t.title}`)
      : ["  No maintenance tasks in queue"]),
    ``,
    `CLIENT MAINTENANCE STATUS:`,
    ...clients.slice(0, 10).map((c) => `  ${c.status === "healthy" ? "✓" : c.status === "attention" ? "⚠" : "🔴"} ${c.name} — ${c.siteLabel || "no URL"} — last update: ${c.lastUpdate || "not recorded"}`),
    ``,
    `STANDARD MAINTENANCE CHECKLIST:`,
    `  □ Run homepage scan to check all sections and meta`,
    `  □ Review open tasks and clear stale items`,
    `  □ Check client billing status`,
    `  □ Update client "last update" timestamps`,
    `  □ Verify contact form is functional`,
    `  □ Test page load speed`,
    ``,
    `Report generated: ${new Date().toLocaleString()}`,
  ].join("\n");
}

async function executeCodeEngineer(mission: AgentMission, state: ManagerPersistedState): Promise<string> {
  const codingTasks = state.tasks.filter((t) => t.assignee === "Coding" && t.status !== "done");

  return [
    `═══ CODE ENGINEER REPORT ═══`,
    `Mission: "${mission.title}"`,
    ``,
    `CODING TASKS IN QUEUE:`,
    ...(codingTasks.length > 0
      ? codingTasks.slice(0, 10).map((t) => `  [${t.priority.toUpperCase()}] ${t.title}`)
      : ["  No coding tasks assigned"]),
    ``,
    `TECHNICAL RECOMMENDATIONS:`,
    `  • Keep dependencies updated (run npm audit regularly)`,
    `  • Use TypeScript strict mode for type safety`,
    `  • Implement proper error boundaries in React components`,
    `  • Add loading states for all async operations`,
    `  • Ensure all forms have proper validation and error messages`,
    `  • Test contact form end-to-end after any changes`,
    `  • Monitor Vercel deployment logs for runtime errors`,
    ``,
    `NEXT STEPS:`,
    `  1. Review coding tasks above and assign priorities`,
    `  2. Use "Add task" to log any new development work`,
    `  3. Link tasks to specific clients so nothing falls through`,
    ``,
    `Report generated: ${new Date().toLocaleString()}`,
  ].join("\n");
}

/* -------------------------------------------------------------------------- */
/* Route handler                                                               */
/* -------------------------------------------------------------------------- */

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const state = await readManagerState();
    const mission = state.missions.find((m) => m.id === id);
    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    }

    // Execute based on specialty
    let output: string;
    switch (mission.specialty) {
      case "CustomerSurveyor":
        output = await executeCustomerSurveyor(mission, state);
        break;
      case "EmailReviewer":
        output = await executeEmailReviewer(mission, state);
        break;
      case "SEOAnalyst":
        output = await executeSEOAnalyst(mission, state);
        break;
      case "AnalyticsAgent":
        output = await executeAnalyticsAgent(mission, state);
        break;
      case "ErrorDetector":
        output = await executeErrorDetector(mission, state);
        break;
      case "ContentWriter":
        output = await executeContentWriter(mission, state);
        break;
      case "Maintenance":
        output = await executeMaintenance(mission, state);
        break;
      case "CodeEngineer":
        output = await executeCodeEngineer(mission, state);
        break;
      default:
        output = `Mission "${mission.title}" completed. Specialty: ${mission.specialty}.\nNo automated executor for this specialty yet — mark done manually or add a custom handler.`;
    }

    const newLogEntries: MissionLogEntry[] = [
      { at: new Date().toISOString(), message: "Mission execution started." },
      { at: new Date().toISOString(), message: "Analysis complete. Output generated." },
    ];

    const updatedMission: AgentMission = {
      ...mission,
      status: "done",
      startedAt: mission.startedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
      output,
      log: [...mission.log, ...newLogEntries],
    };

    await writeManagerState({
      ...state,
      missions: state.missions.map((m) => (m.id === id ? updatedMission : m)),
      activity: [
        {
          id: crypto.randomUUID(),
          at: new Date().toLocaleString(),
          label: `Mission completed: "${mission.title}" → ${mission.specialty}`,
          tone: "success" as const,
        },
        ...state.activity,
      ].slice(0, 80),
    });

    return NextResponse.json({ ok: true, output, updatedMission });
  } catch (e) {
    const message = e instanceof Error ? e.message : "mission_run_failed";
    return NextResponse.json({ error: "mission_run_failed", message }, { status: 500 });
  }
}
