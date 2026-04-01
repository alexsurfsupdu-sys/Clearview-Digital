"use client";

import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  ActivityEntry,
  AgentRole,
  AuditCheck,
  AuditResult,
  Baseline,
  ClientAccount,
  LeadItem,
  LeadStage,
  SectionKey,
  TaskItem,
  TaskPriority,
  TaskStatus,
} from "@/lib/manager/types";
import {
  defaultBaseline,
  defaultClients,
  defaultTasks,
  isTaskOverdue,
  sectionOptions,
  SPECIALISTS,
  suggestedSpecialtyForAuditKey,
} from "@/lib/manager/state";

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

export function ManagerDashboard() {
  const [baseline, setBaseline] = useState<Baseline>(defaultBaseline);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>(defaultTasks);
  const [clients, setClients] = useState<ClientAccount[]>(defaultClients);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [baselineOpen, setBaselineOpen] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [storeMeta, setStoreMeta] = useState<{
    store: "redis" | "file";
    onVercel: boolean;
    publicOrigin: string;
  } | null>(null);
  const skipNextSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/manager", {
          cache: "no-store",
          credentials: "include",
        });
        const data = (await r.json()) as Record<string, unknown>;
        if (!r.ok) {
          if (r.status === 401) {
            throw new Error(
              "Not authorized — open your secret /internal/… link once in this browser so the session cookie is set.",
            );
          }
          const msg =
            typeof data.message === "string"
              ? data.message
              : typeof data.error === "string"
                ? data.error
                : "Could not load manager data from the server.";
          throw new Error(msg);
        }
        if (cancelled) return;
        const meta = data._meta as
          | { store?: string; onVercel?: boolean; publicOrigin?: string }
          | undefined;
        if (meta?.store === "redis" || meta?.store === "file") {
          setStoreMeta({
            store: meta.store,
            onVercel: Boolean(meta.onVercel),
            publicOrigin: typeof meta.publicOrigin === "string" ? meta.publicOrigin : "",
          });
        } else {
          setStoreMeta(null);
        }
        setBaseline(data.baseline as Baseline);
        setTasks(data.tasks as TaskItem[]);
        setClients(data.clients as ClientAccount[]);
        setLeads(Array.isArray(data.leads) ? (data.leads as LeadItem[]) : []);
        setActivity(Array.isArray(data.activity) ? (data.activity as ActivityEntry[]) : []);
        setAudit((data.audit as AuditResult | null) ?? null);
        setLoadError(null);
        skipNextSave.current = true;
        setRemoteReady(true);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load manager data.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!remoteReady) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const t = setTimeout(() => {
      (async () => {
        try {
          const body = {
            version: 1 as const,
            baseline,
            tasks,
            clients,
            leads,
            activity: activity.slice(0, 40),
            audit,
          };
          const r = await fetch("/api/manager", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body),
          });
          const j = (await r.json().catch(() => ({}))) as { error?: string; message?: string };
          if (!r.ok) {
            throw new Error(j.message ?? j.error ?? "Save failed");
          }
          setSaveError(null);
        } catch (e) {
          setSaveError(e instanceof Error ? e.message : "Save failed");
        }
      })();
    }, 500);
    return () => clearTimeout(t);
  }, [baseline, tasks, clients, leads, activity, audit, remoteReady]);

  const pushActivity = useCallback((label: string, tone: ActivityEntry["tone"] = "neutral") => {
    setActivity((prev) => {
      const entry: ActivityEntry = {
        id: crypto.randomUUID(),
        at: new Date().toLocaleString(),
        label,
        tone,
      };
      return [entry, ...prev].slice(0, 40);
    });
  }, []);

  const clientOptions = useMemo(
    () => clients.map((c) => ({ id: c.id, name: c.name })),
    [clients],
  );

  const openLeadsCount = useMemo(
    () => leads.filter((l) => l.stage !== "won" && l.stage !== "lost").length,
    [leads],
  );

  const auditFailures = useMemo(
    () => audit?.checks.filter((c) => c.status === "fail") ?? [],
    [audit],
  );

  const urgentTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (t.priority === "urgent" || t.priority === "high") && t.status !== "done",
      ),
    [tasks],
  );

  const unassignedOpen = useMemo(
    () => tasks.filter((t) => t.assignee === "Unassigned" && t.status !== "done"),
    [tasks],
  );

  const clientsNeedingAttention = useMemo(
    () => clients.filter((c) => c.status !== "healthy"),
    [clients],
  );

  const urgentActions = useMemo(() => {
    const rows: { id: string; title: string; kind: "task" | "audit" | "client"; meta: string }[] =
      [];

    urgentTasks.forEach((t) => {
      rows.push({
        id: `task-${t.id}`,
        title: t.title,
        kind: "task",
        meta: `${t.assignee === "Unassigned" ? "Unassigned" : t.assignee} · ${formatPriority(t.priority)}`,
      });
    });

    auditFailures.slice(0, 4).forEach((c) => {
      rows.push({
        id: `audit-${c.key}`,
        title: c.label,
        kind: "audit",
        meta: c.detail.slice(0, 72) + (c.detail.length > 72 ? "…" : ""),
      });
    });

    clientsNeedingAttention.forEach((c) => {
      rows.push({
        id: `client-${c.id}`,
        title: `${c.name} needs attention`,
        kind: "client",
        meta: c.issueNote ?? `Status: ${c.status}`,
      });
    });

    return rows;
  }, [urgentTasks, auditFailures, clientsNeedingAttention]);

  const summaryStats = useMemo(
    () => [
      {
        label: "Urgent / high open",
        value: String(urgentTasks.length),
        hint: "Tasks requiring focus",
        tone: urgentTasks.length ? ("warn" as const) : ("ok" as const),
      },
      {
        label: "Unassigned",
        value: String(unassignedOpen.length),
        hint: "Needs delegation",
        tone: unassignedOpen.length ? ("info" as const) : ("ok" as const),
      },
      {
        label: "Clients flagged",
        value: String(clientsNeedingAttention.length),
        hint: "Attention or risk",
        tone: clientsNeedingAttention.length ? ("warn" as const) : ("ok" as const),
      },
      {
        label: "Audit issues",
        value: audit ? String(auditFailures.length) : "—",
        hint: audit ? "Marketing homepage" : "Run health scan",
        tone:
          audit && auditFailures.length > 0
            ? ("bad" as const)
            : audit
              ? ("ok" as const)
              : ("neutral" as const),
      },
      {
        label: "Open leads",
        value: String(openLeadsCount),
        hint: "Pipeline (excludes won/lost)",
        tone: openLeadsCount ? ("info" as const) : ("ok" as const),
      },
    ],
    [
      urgentTasks.length,
      unassignedOpen.length,
      clientsNeedingAttention.length,
      audit,
      auditFailures.length,
      openLeadsCount,
    ],
  );

  const overdueOpen = useMemo(
    () => tasks.filter((t) => t.status !== "done" && isTaskOverdue(t)),
    [tasks],
  );

  const unassignedHot = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.assignee === "Unassigned" &&
          t.status !== "done" &&
          (t.priority === "urgent" || t.priority === "high"),
      ),
    [tasks],
  );

  const billingRiskClients = useMemo(
    () => clients.filter((c) => !c.billingCurrent),
    [clients],
  );

  /** Rule-based “AI manager” signals — same data a careful operator would scan; replace with LLM/API later. */
  const managerSignals = useMemo(() => {
    type Sig = {
      id: string;
      severity: "critical" | "warning" | "info";
      title: string;
      detail: string;
      suggest?: AgentRole;
      taskTemplate?: {
        title: string;
        priority: TaskPriority;
        assignee: AgentRole;
        clientId?: string;
      };
    };
    const signals: Sig[] = [];

    if (!audit) {
      signals.push({
        id: "signal-no-audit",
        severity: "info",
        title: "Homepage not scanned yet",
        detail:
          "Run a homepage scan so the manager layer can compare the live site to your baseline (meta, sections, forms, analytics).",
      });
    }

    for (const check of auditFailures) {
      if (check.status !== "fail") continue;
      const spec = suggestedSpecialtyForAuditKey(check.key) ?? "Unassigned";
      signals.push({
        id: `signal-audit-${check.key}`,
        severity: "critical",
        title: `Homepage check failed: ${check.label}`,
        detail: check.detail,
        suggest: spec === "Unassigned" ? undefined : spec,
        taskTemplate: {
          title: `Fix homepage: ${check.label}`,
          priority: "high",
          assignee: spec,
        },
      });
    }

    if (unassignedHot.length > 0) {
      signals.push({
        id: "signal-unassigned-urgent",
        severity: "critical",
        title: `${unassignedHot.length} urgent/high task${unassignedHot.length === 1 ? "" : "s"} unassigned`,
        detail:
          "Assign each to a specialty (coding, visuals, maintenance, etc.) so specialist agents only pull their lane.",
        suggest: undefined,
        taskTemplate: {
          title: `Assign ${unassignedHot.length} urgent/high task(s) to specialties`,
          priority: "urgent",
          assignee: "Unassigned",
        },
      });
    }

    if (overdueOpen.length > 0) {
      signals.push({
        id: "signal-overdue",
        severity: "warning",
        title: `${overdueOpen.length} open task${overdueOpen.length === 1 ? "" : "s"} past due`,
        detail: overdueOpen.map((t) => t.title).slice(0, 3).join(" · ") +
          (overdueOpen.length > 3 ? "…" : ""),
        suggest: "Ops",
        taskTemplate: {
          title: `Review ${overdueOpen.length} overdue open task(s)`,
          priority: "high",
          assignee: "Ops",
        },
      });
    }

    for (const c of clients.filter((x) => x.status === "risk")) {
      signals.push({
        id: `signal-client-risk-${c.id}`,
        severity: "critical",
        title: `Client risk: ${c.name}`,
        detail: c.issueNote ?? "Marked as risk — review and stabilize.",
        suggest: "Maintenance",
        taskTemplate: {
          title: `Stabilize client: ${c.name}`,
          priority: "urgent",
          assignee: "Maintenance",
          clientId: c.id,
        },
      });
    }

    for (const c of clients.filter((x) => x.status === "attention")) {
      signals.push({
        id: `signal-client-attn-${c.id}`,
        severity: "warning",
        title: `Client needs attention: ${c.name}`,
        detail: c.issueNote ?? "Follow up before it escalates.",
        suggest: "Ops",
        taskTemplate: {
          title: `Follow up: ${c.name}`,
          priority: "normal",
          assignee: "Ops",
          clientId: c.id,
        },
      });
    }

    if (billingRiskClients.length > 0) {
      signals.push({
        id: "signal-billing",
        severity: "warning",
        title: `${billingRiskClients.length} account${billingRiskClients.length === 1 ? "" : "s"} with billing flagged`,
        detail: billingRiskClients.map((c) => c.name).join(", "),
        suggest: "Ops",
        taskTemplate: {
          title: `Billing follow-up: ${billingRiskClients.map((c) => c.name).join(", ")}`,
          priority: "high",
          assignee: "Ops",
          clientId: billingRiskClients[0]?.id,
        },
      });
    }

    if (signals.length === 0) {
      signals.push({
        id: "signal-clear",
        severity: "info",
        title: "No automated issues detected",
        detail:
          "Keep running scans and updating tasks. When you connect an AI manager API, this panel can run continuously without duplicating specialist work.",
      });
    }

    return signals;
  }, [
    audit,
    auditFailures,
    unassignedHot,
    overdueOpen,
    clients,
    billingRiskClients,
  ]);

  async function runAudit() {
    setIsRunningAudit(true);
    try {
      const response = await fetch(`${window.location.origin}/`, { cache: "no-store" });
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const checks: AuditCheck[] = [];
      const missingSections: string[] = [];
      let points = 0;
      let possible = 0;

      const title = doc.querySelector("title")?.textContent?.trim() ?? "";
      const metaDescription =
        doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "";
      const contactForm = doc.querySelector("#contact form");
      const primaryCta = Array.from(doc.querySelectorAll('a[href="#contact"], button')).find(
        (node) =>
          (node.textContent ?? "").toLowerCase().includes("proposal") ||
          (node.textContent ?? "").toLowerCase().includes("get started"),
      );

      function addCheck(label: string, pass: boolean, detail: string, key: string) {
        possible += 1;
        if (pass) points += 1;
        checks.push({
          key,
          label,
          status: pass ? "pass" : "fail",
          detail,
        });
      }

      if (baseline.requiredChecks.metaTitle) {
        addCheck(
          "Meta title",
          title.length > 10,
          title.length > 10 ? `Found: ${title}` : "Missing or too short.",
          "meta-title",
        );
      }

      if (baseline.requiredChecks.metaDescription) {
        addCheck(
          "Meta description",
          metaDescription.length > 40,
          metaDescription.length > 40
            ? `Found: ${metaDescription}`
            : "Missing or too short.",
          "meta-description",
        );
      }

      if (baseline.requiredChecks.contactForm) {
        addCheck(
          "Contact form",
          Boolean(contactForm),
          contactForm ? "Contact form is present on the homepage." : "No contact form found.",
          "contact-form",
        );
      }

      if (baseline.requiredChecks.primaryCta) {
        addCheck(
          "Primary CTA",
          Boolean(primaryCta),
          primaryCta
            ? `Detected CTA: ${(primaryCta.textContent ?? "").trim()}`
            : "No clear primary CTA found.",
          "primary-cta",
        );
      }

      if (baseline.requiredChecks.analytics) {
        const analyticsScript = html.includes("__vercel") || html.includes("/_vercel/insights");
        addCheck(
          "Analytics present",
          analyticsScript,
          analyticsScript
            ? "Vercel analytics markers were found in the page output."
            : "Analytics markers were not detected in the current response.",
          "analytics",
        );
      }

      for (const section of sectionOptions) {
        if (!baseline.requiredSections.includes(section.key)) continue;

        const found = doc.querySelector(section.selector);
        possible += 1;
        if (found) {
          points += 1;
          checks.push({
            key: `section-${section.key}`,
            label: `${section.label} section`,
            status: "pass",
            detail: `Found selector: ${section.selector}`,
          });
        } else {
          missingSections.push(section.label);
          checks.push({
            key: `section-${section.key}`,
            label: `${section.label} section`,
            status: "fail",
            detail: `Missing selector: ${section.selector}`,
          });
        }
      }

      const recommendedTasks = buildRecommendedTasks({
        baseline,
        checks,
        missingSections,
      });

      const score = possible ? Math.round((points / possible) * 100) : 0;
      const failedCount = checks.filter((c) => c.status === "fail").length;

      setAudit({
        homepageUrl: window.location.origin,
        auditedAt: new Date().toLocaleString(),
        score,
        checks,
        missingSections,
        recommendedTasks,
        generatedBrief: buildAgentBrief({ baseline, checks, missingSections, recommendedTasks }),
      });
      pushActivity(
        `Homepage audit completed — score ${score}% · ${failedCount} failed check${failedCount === 1 ? "" : "s"}`,
        failedCount === 0 ? "success" : "warning",
      );
    } finally {
      setIsRunningAudit(false);
    }
  }

  function resetBaseline() {
    setBaseline(structuredClone(defaultBaseline));
    setAudit(null);
    pushActivity("Baseline reset to defaults", "info");
  }

  function toggleSection(section: SectionKey) {
    setBaseline((current) => {
      const exists = current.requiredSections.includes(section);
      return {
        ...current,
        requiredSections: exists
          ? current.requiredSections.filter((item) => item !== section)
          : [...current.requiredSections, section],
      };
    });
  }

  function updateTask(id: string, patch: Partial<TaskItem>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    if (patch.status === "done") pushActivity(`Task marked done`, "success");
    if (patch.assignee && patch.assignee !== "Unassigned")
      pushActivity(`Task assigned to ${patch.assignee}`, "info");
  }

  function addTask() {
    const id = crypto.randomUUID();
    setTasks((prev) => [
      {
        id,
        title: "New task — edit title",
        priority: "normal",
        status: "pending",
        assignee: "Unassigned",
        clientId: clients[0]?.id ?? "unlinked",
      },
      ...prev,
    ]);
    pushActivity("New task created", "neutral");
  }

  function addClient() {
    const id = crypto.randomUUID();
    setClients((prev) => [
      ...prev,
      {
        id,
        name: "New client",
        siteLabel: "",
        status: "healthy",
        lastUpdate: "",
        billingCurrent: true,
      },
    ]);
    pushActivity("Client added", "neutral");
  }

  const addTaskFromSignal = useCallback(
    (tpl: {
      title: string;
      priority: TaskPriority;
      assignee: AgentRole;
      clientId?: string;
    }) => {
      const id = crypto.randomUUID();
      setTasks((prev) => [
        {
          id,
          title: tpl.title.slice(0, 200),
          priority: tpl.priority,
          status: "pending",
          assignee: tpl.assignee,
          clientId: tpl.clientId ?? clients[0]?.id ?? "unlinked",
        },
        ...prev,
      ]);
      pushActivity(`Task from signal: ${tpl.title.slice(0, 80)}`, "info");
    },
    [clients, pushActivity],
  );

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    pushActivity("Task removed", "neutral");
  }

  function removeClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) =>
      prev.map((t) => (t.clientId === id ? { ...t, clientId: "unlinked" } : t)),
    );
    pushActivity("Client removed", "info");
  }

  function addLead() {
    const id = crypto.randomUUID();
    setLeads((prev) => [
      {
        id,
        name: "New lead",
        business: "",
        email: "",
        phone: "",
        source: "Website",
        stage: "new",
        notes: "",
        nextStep: "",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    pushActivity("Lead added", "neutral");
  }

  function removeLead(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    pushActivity("Lead removed", "neutral");
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-[var(--trust)]">Manager data unavailable</p>
          <p className="mt-2 text-sm text-slate-600">{loadError}</p>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Run <code className="rounded bg-slate-100 px-1 py-0.5">npm run dev</code> from the{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5">clearview-site</code> folder. The API
            stores state under <code className="rounded bg-slate-100 px-1 py-0.5">data/manager-state.json</code>{" "}
            (created automatically).
          </p>
          <button
            className="mt-6 rounded-lg bg-[var(--trust)] px-5 py-2.5 text-sm font-medium text-white"
            onClick={() => window.location.reload()}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!remoteReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--surface)] text-slate-600">
        <p className="text-sm font-medium text-slate-700">Loading operations…</p>
        <p className="max-w-xs text-center text-xs text-slate-500">Syncing with server store</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--foreground)]">
      {saveError ? (
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950"
          role="status"
        >
          <span className="font-medium">Save failed:</span> {saveError}. Check server logs and disk
          permissions for <code className="rounded bg-amber-100/80 px-1">data/manager-state.json</code>.
        </div>
      ) : null}
      {storeMeta?.onVercel && storeMeta.store === "file" ? (
        <div
          className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-950"
          role="alert"
        >
          <span className="font-medium">Production data will not persist reliably.</span> This deploy is
          using the local file store. In Vercel → Storage → create/link{" "}
          <strong>Redis (Upstash)</strong> so <code className="rounded bg-rose-100/80 px-1">UPSTASH_REDIS_*</code>{" "}
          env vars appear, then redeploy. Manager state will then save to Redis.
        </div>
      ) : null}
      {storeMeta?.store === "redis" ? (
        <div
          className="border-b border-emerald-200 bg-emerald-50/90 px-4 py-2 text-center text-xs text-emerald-900"
          role="status"
        >
          Connected to <strong>Redis</strong> for persistent manager data.
          {storeMeta.publicOrigin ? (
            <>
              {" "}
              Homepage scan uses <code className="rounded bg-white/80 px-1">{storeMeta.publicOrigin}</code>.
            </>
          ) : null}
        </div>
      ) : null}
      {/* Top bar */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Internal · Operations
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--trust)] sm:text-3xl">
              Control center
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
              Your operational view for clients and tasks. Data lives in this app’s server store only
              (not your CRM, billing, or email). Homepage scan checks your marketing site against a
              baseline you define. Assign specialties so work is split across coding, visuals,
              maintenance, and other lanes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              href="/"
            >
              View live site
            </Link>
            <button
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() => setBaselineOpen((o) => !o)}
              type="button"
            >
              {baselineOpen ? "Hide baseline" : "Baseline & audit setup"}
            </button>
            <button
              className="rounded-lg bg-[var(--trust)] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-95 disabled:opacity-60"
              disabled={isRunningAudit}
              onClick={runAudit}
              type="button"
            >
              {isRunningAudit ? "Scanning…" : "Run homepage scan"}
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="border-t border-[var(--border)] bg-slate-50/80">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
            {summaryStats.map((s) => (
              <SummaryStat key={s.label} {...s} />
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* AI manager — automated oversight (rule-based today; plug in LLM later) */}
        <section aria-labelledby="ai-manager-heading">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Automated oversight
                </p>
                <h2
                  id="ai-manager-heading"
                  className="mt-1 text-lg font-semibold tracking-tight text-[var(--trust)]"
                >
                  AI manager signals
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                  This layer watches for the same kinds of problems you would: homepage regressions,
                  stuck work, client risk, and billing flags. Today it uses deterministic checks
                  plus your tasks and clients; later you can pipe this to a real AI manager that
                  runs on a schedule. Specialist agents (coding, visuals, maintenance, …) only see
                  work assigned in their lane.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SPECIALISTS.filter((s) => s !== "Unassigned").map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <ul className="mt-6 divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/80">
              {managerSignals.map((sig) => (
                <li
                  key={sig.id}
                  className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SignalSeverityBadge severity={sig.severity} />
                      <p className="text-sm font-medium text-slate-900">{sig.title}</p>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{sig.detail}</p>
                    {sig.suggest ? (
                      <p className="mt-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-600">Suggested specialty:</span>{" "}
                        {sig.suggest}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                    {sig.taskTemplate ? (
                      <button
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        onClick={() => addTaskFromSignal(sig.taskTemplate!)}
                        type="button"
                      >
                        Add task from signal
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Urgent */}
        <section aria-labelledby="urgent-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2
                id="urgent-heading"
                className="text-lg font-semibold tracking-tight text-[var(--trust)]"
              >
                Needs attention now
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Urgent tasks, homepage audit failures, and flagged clients.
              </p>
            </div>
          </div>
          {urgentActions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              Nothing urgent in the queue. Run a homepage scan to surface technical issues.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {urgentActions.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{row.title}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{row.meta}</p>
                  </div>
                  <KindBadge kind={row.kind} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Main column: tasks + clients */}
          <div className="space-y-8 lg:col-span-7">
            <section aria-labelledby="tasks-heading">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2
                    id="tasks-heading"
                    className="text-lg font-semibold tracking-tight text-[var(--trust)]"
                  >
                    Active tasks
                  </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Pick a <span className="font-medium text-slate-700">specialty</span> so coding,
                visuals, maintenance, and other agents only pull relevant work.
              </p>
                </div>
                <button
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={addTask}
                  type="button"
                >
                  Add task
                </button>
              </div>

              <div className="hidden rounded-t-xl border border-b-0 border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 md:grid md:grid-cols-[1fr_88px_100px_100px_100px_72px] md:gap-2 md:px-4">
                <span>Task</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Specialty</span>
                <span className="text-right">Due</span>
                <span className="text-right"> </span>
              </div>
              <div className="overflow-hidden rounded-b-xl border border-slate-200 bg-white shadow-sm md:rounded-t-none">
                {tasks.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    No tasks yet. Add one, or link it to a client after you add clients below.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {tasks.map((t) => (
                      <TaskRow
                        key={t.id}
                        clientOptions={clientOptions}
                        onChange={updateTask}
                        onRemove={() => removeTask(t.id)}
                        task={t}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section aria-labelledby="clients-heading">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2
                    id="clients-heading"
                    className="text-lg font-semibold tracking-tight text-[var(--trust)]"
                  >
                    Client accounts
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    Only people you add here — not imported from anywhere yet.
                  </p>
                </div>
                <button
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={addClient}
                  type="button"
                >
                  Add client
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-medium">Client</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">Site</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Last update</th>
                      <th className="px-4 py-3 text-right font-medium">Billing</th>
                      <th className="w-20 px-4 py-3 text-right font-medium"> </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clients.length === 0 ? (
                      <tr>
                        <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={6}>
                          No clients yet. Use &quot;Add client&quot; to create your real list.
                        </td>
                      </tr>
                    ) : (
                      clients.map((c) => (
                        <ClientRow
                          key={c.id}
                          client={c}
                          onChange={setClients}
                          onRemove={() => removeClient(c.id)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="leads-heading">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2
                    id="leads-heading"
                    className="text-lg font-semibold tracking-tight text-[var(--trust)]"
                  >
                    Leads pipeline
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    Track inquiries and stages here. Same server store as tasks — not wired to your
                    contact form yet.
                  </p>
                </div>
                <button
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={addLead}
                  type="button"
                >
                  Add lead
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-medium">Lead</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">Contact</th>
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium">Stage</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Next step</th>
                      <th className="w-20 px-4 py-3 text-right font-medium"> </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.length === 0 ? (
                      <tr>
                        <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={6}>
                          No leads yet. Add manually or connect the contact form later.
                        </td>
                      </tr>
                    ) : (
                      leads.map((l) => (
                        <LeadRow
                          key={l.id}
                          lead={l}
                          onChange={setLeads}
                          onRemove={() => removeLead(l.id)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Side column: health, analytics, activity */}
          <div className="space-y-8 lg:col-span-5">
            <section aria-labelledby="health-heading">
              <div className="mb-3">
                <h2
                  id="health-heading"
                  className="text-lg font-semibold tracking-tight text-[var(--trust)]"
                >
                  Site health
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  Marketing homepage checks from your baseline. Client uptime monitors can plug in
                  here later.
                </p>
              </div>
              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Primary property
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">Marketing homepage</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                    <span className="text-sm text-slate-600">Reachable</span>
                  </div>
                </div>
                {audit ? (
                  <>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-2xl font-semibold tabular-nums text-[var(--trust)]">
                        {audit.score}%
                      </p>
                      <p className="text-xs text-slate-500">Last scan · {audit.auditedAt}</p>
                    </div>
                    <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
                      {audit.checks.map((c) => (
                        <li
                          key={c.key}
                          className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                        >
                          <span className="text-slate-700">{c.label}</span>
                          <StatusDot status={c.status} />
                        </li>
                      ))}
                    </ul>
                    {audit.missingSections.length > 0 && (
                      <p className="text-xs text-amber-800">
                        Missing sections: {audit.missingSections.join(", ")}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-slate-600">
                    No scan yet. Run a homepage scan to compare the live page against your baseline
                    rules.
                  </p>
                )}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Maintenance queue (sample)
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    <li className="flex justify-between gap-2">
                      <span>Dependency audit</span>
                      <span className="text-slate-400">Scheduled</span>
                    </li>
                    <li className="flex justify-between gap-2">
                      <span>SSL — Atlas Mfg.</span>
                      <span className="font-medium text-rose-700">Action</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section aria-labelledby="analytics-heading">
              <div className="mb-3">
                <h2
                  id="analytics-heading"
                  className="text-lg font-semibold tracking-tight text-[var(--trust)]"
                >
                  Analytics snapshot
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  Decision-oriented signals only. Replace placeholders when data is connected.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <SnapshotCard
                  label="Sessions"
                  value="12.4k"
                  delta="+4.2%"
                  deltaPositive
                  foot="vs prior 7d"
                />
                <SnapshotCard
                  label="Form starts"
                  value="186"
                  delta="−2%"
                  deltaPositive={false}
                  foot="watch contact funnel"
                />
                <SnapshotCard
                  label="Anomalies"
                  value="0"
                  delta="—"
                  foot="no spike alerts"
                />
              </div>
            </section>

            <section aria-labelledby="activity-heading">
              <div className="mb-3">
                <h2
                  id="activity-heading"
                  className="text-lg font-semibold tracking-tight text-[var(--trust)]"
                >
                  Recent activity
                </h2>
                <p className="mt-0.5 text-sm text-slate-600">
                  Audits, assignments, and status changes (stored locally in this browser).
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <ul className="divide-y divide-slate-100">
                  {activity.map((a) => (
                    <li key={a.id} className="px-4 py-3">
                      <p className="text-sm text-slate-800">{a.label}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{a.at}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {audit && (
              <section aria-labelledby="brief-heading">
                <div className="mb-3">
                  <h2
                    id="brief-heading"
                    className="text-lg font-semibold tracking-tight text-[var(--trust)]"
                  >
                    Agent handoff
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-600">
                    Copy a structured brief after each scan.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <textarea
                    className="form-control min-h-48 resize-y text-sm"
                    readOnly
                    value={audit.generatedBrief}
                  />
                  <button
                    className="mt-3 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-900"
                    onClick={() => {
                      void navigator.clipboard.writeText(audit.generatedBrief);
                      pushActivity("Agent brief copied to clipboard", "info");
                    }}
                    type="button"
                  >
                    Copy brief
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Baseline configuration — secondary */}
        {baselineOpen && (
          <section
            aria-label="Baseline and audit configuration"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Configuration
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--trust)]">
                  Site baseline &amp; audit rules
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  These rules define what the homepage scan expects. They power the health checks
                  above.
                </p>
              </div>
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={resetBaseline}
                type="button"
              >
                Reset baseline
              </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      Business name
                    </span>
                    <input
                      className="form-control text-sm"
                      onChange={(e) =>
                        setBaseline((cur) => ({ ...cur, businessName: e.target.value }))
                      }
                      value={baseline.businessName}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      Primary goal
                    </span>
                    <input
                      className="form-control text-sm"
                      onChange={(e) =>
                        setBaseline((cur) => ({ ...cur, primaryGoal: e.target.value }))
                      }
                      value={baseline.primaryGoal}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Target audience
                  </span>
                  <input
                    className="form-control text-sm"
                    onChange={(e) =>
                      setBaseline((cur) => ({ ...cur, targetAudience: e.target.value }))
                    }
                    value={baseline.targetAudience}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Notes
                  </span>
                  <textarea
                    className="form-control min-h-28 resize-y text-sm"
                    onChange={(e) => setBaseline((cur) => ({ ...cur, notes: e.target.value }))}
                    value={baseline.notes}
                  />
                </label>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Required sections
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sectionOptions.map((section) => {
                      const active = baseline.requiredSections.includes(section.key);
                      return (
                        <button
                          key={section.key}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            active
                              ? "border-slate-800 bg-slate-800 text-white"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                          }`}
                          onClick={() => toggleSection(section.key)}
                          type="button"
                        >
                          {section.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Required checks
                  </h3>
                  <div className="mt-3 space-y-2">
                    {Object.entries(baseline.requiredChecks).map(([key, value]) => (
                      <label
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm"
                      >
                        <span className="text-slate-700">{formatCheckLabel(key)}</span>
                        <input
                          checked={value}
                          className="h-4 w-4 rounded border-slate-300 text-slate-800"
                          onChange={(e) =>
                            setBaseline((cur) => ({
                              ...cur,
                              requiredChecks: {
                                ...cur.requiredChecks,
                                [key]: e.target.checked,
                              },
                            }))
                          }
                          type="checkbox"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function SignalSeverityBadge({
  severity,
}: {
  severity: "critical" | "warning" | "info";
}) {
  const cls =
    severity === "critical"
      ? "bg-rose-50 text-rose-800 ring-rose-200"
      : severity === "warning"
        ? "bg-amber-50 text-amber-900 ring-amber-200"
        : "bg-sky-50 text-sky-900 ring-sky-200";
  const label = severity === "critical" ? "Critical" : severity === "warning" ? "Warning" : "Info";
  return (
    <span
      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}

function SummaryStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "ok" | "warn" | "bad" | "info" | "neutral";
}) {
  const ring =
    tone === "bad"
      ? "ring-1 ring-rose-200"
      : tone === "warn"
        ? "ring-1 ring-amber-200"
        : tone === "info"
          ? "ring-1 ring-sky-200"
          : "";
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm ${ring}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function KindBadge({ kind }: { kind: "task" | "audit" | "client" }) {
  const label = kind === "task" ? "Task" : kind === "audit" ? "Homepage" : "Client";
  const cls =
    kind === "audit"
      ? "bg-sky-50 text-sky-800 ring-sky-100"
      : kind === "client"
        ? "bg-amber-50 text-amber-900 ring-amber-100"
        : "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: "pass" | "warn" | "fail" }) {
  if (status === "pass")
    return (
      <span className="shrink-0 text-xs font-medium text-emerald-700" title="Pass">
        OK
      </span>
    );
  if (status === "warn")
    return (
      <span className="shrink-0 text-xs font-medium text-amber-700" title="Warning">
        Warn
      </span>
    );
  return (
    <span className="shrink-0 text-xs font-medium text-rose-700" title="Fail">
      Fail
    </span>
  );
}

function TaskRow({
  task,
  clientOptions,
  onChange,
  onRemove,
}: {
  task: TaskItem;
  clientOptions: Array<{ id: string; name: string }>;
  onChange: (id: string, patch: Partial<TaskItem>) => void;
  onRemove: () => void;
}) {
  const urgent = task.priority === "urgent" || task.priority === "high";
  const rowClass =
    task.priority === "urgent"
      ? "bg-rose-50/50"
      : task.priority === "high"
        ? "bg-amber-50/40"
        : "";

  return (
    <li className={`px-3 py-3 md:grid md:grid-cols-[1fr_88px_100px_100px_100px_72px] md:items-center md:gap-2 md:px-4 ${rowClass}`}>
      <div className="min-w-0 md:pr-2">
        <input
          className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-0"
          onChange={(e) => onChange(task.id, { title: e.target.value })}
          value={task.title}
        />
        <label className="sr-only" htmlFor={`cl-${task.id}`}>
          Linked client
        </label>
        <select
          className="mt-2 w-full max-w-[220px] rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-6 text-xs text-slate-700"
          id={`cl-${task.id}`}
          onChange={(e) => onChange(task.id, { clientId: e.target.value })}
          value={task.clientId}
        >
          <option value="unlinked">No client</option>
          {clientOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 md:mt-0">
        <label className="sr-only" htmlFor={`p-${task.id}`}>
          Priority
        </label>
        <select
          className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-6 text-xs font-medium text-slate-800"
          id={`p-${task.id}`}
          onChange={(e) => onChange(task.id, { priority: e.target.value as TaskPriority })}
          value={task.priority}
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <div className="mt-2 md:mt-0">
        <label className="sr-only" htmlFor={`s-${task.id}`}>
          Status
        </label>
        <select
          className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-6 text-xs font-medium text-slate-800"
          id={`s-${task.id}`}
          onChange={(e) => onChange(task.id, { status: e.target.value as TaskStatus })}
          value={task.status}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div className="mt-2 md:mt-0">
        <label className="sr-only" htmlFor={`a-${task.id}`}>
          Specialty
        </label>
        <select
          className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-6 text-xs font-medium text-slate-800"
          id={`a-${task.id}`}
          onChange={(e) => onChange(task.id, { assignee: e.target.value as AgentRole })}
          value={task.assignee}
        >
          {SPECIALISTS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 md:mt-0 md:text-right">
        <label className="sr-only" htmlFor={`d-${task.id}`}>
          Due
        </label>
        <input
          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 md:max-w-[100px] md:ml-auto"
          id={`d-${task.id}`}
          onChange={(e) => onChange(task.id, { due: e.target.value || undefined })}
          type="date"
          value={task.due ?? ""}
        />
      </div>
      <div className="mt-2 flex justify-end md:mt-0">
        <button
          className="text-xs font-medium text-rose-700 hover:text-rose-900"
          onClick={onRemove}
          type="button"
        >
          Remove
        </button>
      </div>
      {urgent && (
        <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-rose-700 md:col-span-6 md:mt-1">
          Escalated priority
        </p>
      )}
    </li>
  );
}

function ClientRow({
  client,
  onChange,
  onRemove,
}: {
  client: ClientAccount;
  onChange: Dispatch<SetStateAction<ClientAccount[]>>;
  onRemove: () => void;
}) {
  function patch(p: Partial<ClientAccount>) {
    onChange((prev) => prev.map((c) => (c.id === client.id ? { ...c, ...p } : c)));
  }

  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <input
          className="w-full max-w-xs border-0 bg-transparent p-0 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-0"
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Client name"
          value={client.name}
        />
        <input
          className="mt-2 w-full max-w-xs border-0 bg-transparent p-0 text-xs text-slate-600 placeholder:text-slate-400 focus:ring-0"
          onChange={(e) => patch({ issueNote: e.target.value || undefined })}
          placeholder="Issue / note (optional)"
          value={client.issueNote ?? ""}
        />
      </td>
      <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
        <input
          className="w-full min-w-[8rem] border-0 bg-transparent p-0 text-xs focus:ring-0"
          onChange={(e) => patch({ siteLabel: e.target.value })}
          placeholder="domain or label"
          value={client.siteLabel}
        />
      </td>
      <td className="px-4 py-3">
        <label className="sr-only" htmlFor={`st-${client.id}`}>
          Status
        </label>
        <select
          className="w-full min-w-[7.5rem] rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-5 text-xs font-medium text-slate-800"
          id={`st-${client.id}`}
          onChange={(e) =>
            onChange((prev) =>
              prev.map((c) =>
                c.id === client.id
                  ? { ...c, status: e.target.value as ClientAccount["status"] }
                  : c,
              ),
            )
          }
          value={client.status}
        >
          <option value="healthy">Healthy</option>
          <option value="attention">Attention</option>
          <option value="risk">Risk</option>
        </select>
      </td>
      <td className="hidden px-4 py-3 text-xs text-slate-600 md:table-cell">
        <input
          className="w-full min-w-[7rem] border-0 bg-transparent p-0 text-xs focus:ring-0"
          onChange={(e) => patch({ lastUpdate: e.target.value })}
          placeholder="e.g. Mar 30 — deploy"
          value={client.lastUpdate}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            client.billingCurrent
              ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
              : "bg-rose-50 text-rose-800 ring-rose-100"
          }`}
          onClick={() =>
            onChange((prev) =>
              prev.map((c) =>
                c.id === client.id ? { ...c, billingCurrent: !c.billingCurrent } : c,
              ),
            )
          }
          type="button"
        >
          {client.billingCurrent ? "Current" : "Overdue"}
        </button>
      </td>
      <td className="px-4 py-3 text-right align-top">
        <button
          className="text-xs font-medium text-rose-700 hover:text-rose-900"
          onClick={onRemove}
          type="button"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

const LEAD_STAGES: LeadStage[] = ["new", "contacted", "qualified", "won", "lost"];

function LeadRow({
  lead,
  onChange,
  onRemove,
}: {
  lead: LeadItem;
  onChange: Dispatch<SetStateAction<LeadItem[]>>;
  onRemove: () => void;
}) {
  function patch(p: Partial<LeadItem>) {
    onChange((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...p } : l)));
  }

  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <input
          className="w-full min-w-[6rem] border-0 bg-transparent p-0 text-sm font-medium text-slate-900 focus:ring-0"
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Name"
          value={lead.name}
        />
        <input
          className="mt-2 w-full border-0 bg-transparent p-0 text-xs text-slate-600 focus:ring-0"
          onChange={(e) => patch({ business: e.target.value })}
          placeholder="Business"
          value={lead.business}
        />
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <input
          className="w-full border-0 bg-transparent p-0 text-xs focus:ring-0"
          onChange={(e) => patch({ email: e.target.value })}
          placeholder="Email"
          value={lead.email}
        />
        <input
          className="mt-2 w-full border-0 bg-transparent p-0 text-xs focus:ring-0"
          onChange={(e) => patch({ phone: e.target.value })}
          placeholder="Phone"
          value={lead.phone}
        />
      </td>
      <td className="px-4 py-3">
        <input
          className="w-full border-0 bg-transparent p-0 text-xs focus:ring-0"
          onChange={(e) => patch({ source: e.target.value })}
          value={lead.source}
        />
      </td>
      <td className="px-4 py-3">
        <select
          className="w-full min-w-[6.5rem] rounded-md border border-slate-200 bg-white py-1.5 pl-2 pr-4 text-xs font-medium"
          onChange={(e) => patch({ stage: e.target.value as LeadStage })}
          value={lead.stage}
        >
          {LEAD_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <input
          className="w-full border-0 bg-transparent p-0 text-xs focus:ring-0"
          onChange={(e) => patch({ nextStep: e.target.value })}
          placeholder="Next step"
          value={lead.nextStep}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          className="text-xs font-medium text-rose-700 hover:text-rose-900"
          onClick={onRemove}
          type="button"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

function SnapshotCard({
  label,
  value,
  delta,
  deltaPositive,
  foot,
}: {
  label: string;
  value: string;
  delta: string;
  deltaPositive?: boolean;
  foot: string;
}) {
  const deltaColor =
    delta === "—"
      ? "text-slate-400"
      : deltaPositive
        ? "text-emerald-700"
        : "text-rose-700";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
      <p className={`mt-1 text-xs font-medium ${deltaColor}`}>{delta}</p>
      <p className="mt-2 text-xs text-slate-500">{foot}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers (audit copy)                                                       */
/* -------------------------------------------------------------------------- */

function buildRecommendedTasks({
  baseline,
  checks,
  missingSections,
}: {
  baseline: Baseline;
  checks: AuditCheck[];
  missingSections: string[];
}) {
  const tasks: string[] = [];

  if (missingSections.length) {
    tasks.push(`Add the missing required sections: ${missingSections.join(", ")}.`);
  }

  for (const check of checks) {
    if (check.status === "fail") {
      if (check.key === "meta-title") {
        tasks.push("Improve the page title so it clearly reflects the offer and brand.");
      } else if (check.key === "meta-description") {
        tasks.push("Write a stronger meta description for search and social previews.");
      } else if (check.key === "contact-form") {
        tasks.push("Restore or connect the contact form so the landing page can capture leads.");
      } else if (check.key === "primary-cta") {
        tasks.push("Make the primary CTA more obvious and ensure it is easy to find.");
      } else if (check.key === "analytics") {
        tasks.push("Verify analytics installation and confirm that production tracking is active.");
      }
    }
  }

  if (!tasks.length) {
    tasks.push(
      `The page is matching the current baseline well. Next focus on polish, tracking accuracy, and future portal planning for ${baseline.businessName}.`,
    );
  }

  return tasks;
}

function buildAgentBrief({
  baseline,
  checks,
  missingSections,
  recommendedTasks,
}: {
  baseline: Baseline;
  checks: AuditCheck[];
  missingSections: string[];
  recommendedTasks: string[];
}) {
  const failures = checks
    .filter((check) => check.status === "fail")
    .map((check) => `- ${check.label}: ${check.detail}`)
    .join("\n");

  const missing = missingSections.length
    ? missingSections.map((section) => `- ${section}`).join("\n")
    : "- None currently missing";

  const tasks = recommendedTasks.map((task) => `- ${task}`).join("\n");

  return `Project: ${baseline.businessName}
Primary goal: ${baseline.primaryGoal}
Target audience: ${baseline.targetAudience}

Baseline notes:
${baseline.notes}

Missing required sections:
${missing}

Failed audit checks:
${failures || "- No failed checks in the latest audit"}

Recommended next tasks:
${tasks}

Instruction:
Use this brief to improve the current marketing site without changing the overall brand direction. Prioritize missing requirements first, then any broken or weak conversion elements.`;
}

function formatCheckLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function formatPriority(p: TaskPriority) {
  return p.charAt(0).toUpperCase() + p.slice(1);
}
