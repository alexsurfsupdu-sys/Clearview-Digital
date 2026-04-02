"use client";

import { useCallback, useMemo, useState } from "react";

import type {
  ActivityEntry,
  AgentMission,
  AgentSpecialty,
  AgentStatus,
  ClientAccount,
  MissionLogEntry,
  TaskPriority,
} from "@/lib/manager/types";

/* -------------------------------------------------------------------------- */
/* Agent roster config                                                         */
/* -------------------------------------------------------------------------- */

type AgentMeta = {
  specialty: AgentSpecialty;
  name: string;
  icon: string;
  role: string;
  bgClass: string;
  borderClass: string;
};

const AGENT_ROSTER: AgentMeta[] = [
  {
    specialty: "CodeEngineer",
    name: "Code Engineer",
    icon: "⌨",
    role: "Builds features, fixes bugs, wires APIs",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
  },
  {
    specialty: "Maintenance",
    name: "Maintenance",
    icon: "⚙",
    role: "Monitors health, updates dependencies",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-200",
  },
  {
    specialty: "ErrorDetector",
    name: "Error Detector",
    icon: "◎",
    role: "Scans for errors, broken links, anomalies",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
  },
  {
    specialty: "EmailReviewer",
    name: "Email Reviewer",
    icon: "✉",
    role: "Analyzes customer emails, drafts replies",
    bgClass: "bg-violet-50",
    borderClass: "border-violet-200",
  },
  {
    specialty: "CustomerSurveyor",
    name: "Customer Surveyor",
    icon: "◈",
    role: "Gathers client feedback, surfaces wants",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
  },
  {
    specialty: "ContentWriter",
    name: "Content Writer",
    icon: "✏",
    role: "Writes copy, blog posts, landing content",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
  },
  {
    specialty: "SEOAnalyst",
    name: "SEO Analyst",
    icon: "◇",
    role: "Optimizes meta, keywords, search rankings",
    bgClass: "bg-cyan-50",
    borderClass: "border-cyan-200",
  },
  {
    specialty: "AnalyticsAgent",
    name: "Analytics Agent",
    icon: "△",
    role: "Tracks traffic, conversions, and KPIs",
    bgClass: "bg-indigo-50",
    borderClass: "border-indigo-200",
  },
];

const STATUS_DOT: Record<AgentStatus, string> = {
  idle: "bg-slate-300",
  queued: "bg-amber-400",
  active: "bg-emerald-500",
  paused: "bg-yellow-400",
  done: "bg-blue-400",
  error: "bg-red-500",
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: "Idle",
  queued: "Queued",
  active: "Active",
  paused: "Paused",
  done: "Done",
  error: "Error",
};

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                      */
/* -------------------------------------------------------------------------- */

function formatRelative(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
}

function agentStatus(missions: AgentMission[], specialty: AgentSpecialty): AgentStatus {
  if (missions.some((m) => m.specialty === specialty && m.status === "active")) return "active";
  if (missions.some((m) => m.specialty === specialty && m.status === "queued")) return "queued";
  return "idle";
}

function agentActiveMission(
  missions: AgentMission[],
  specialty: AgentSpecialty,
): AgentMission | undefined {
  return missions
    .filter(
      (m) => m.specialty === specialty && (m.status === "active" || m.status === "queued"),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

/* -------------------------------------------------------------------------- */
/* Dispatch form type                                                           */
/* -------------------------------------------------------------------------- */

type DispatchForm = {
  title: string;
  brief: string;
  specialty: AgentSpecialty;
  priority: TaskPriority;
  clientId: string;
};

const EMPTY_FORM: DispatchForm = {
  title: "",
  brief: "",
  specialty: "CodeEngineer",
  priority: "normal",
  clientId: "none",
};

/* -------------------------------------------------------------------------- */
/* Props                                                                        */
/* -------------------------------------------------------------------------- */

type Props = {
  missions: AgentMission[];
  clients: ClientAccount[];
  onMissionsChange: (missions: AgentMission[]) => void;
  onPushActivity: (label: string, tone?: ActivityEntry["tone"]) => void;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                    */
/* -------------------------------------------------------------------------- */

export function AgentHub({ missions, clients, onMissionsChange, onPushActivity }: Props) {
  const [showDispatch, setShowDispatch] = useState(false);
  const [form, setForm] = useState<DispatchForm>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeMissions = useMemo(
    () => missions.filter((m) => m.status === "active" || m.status === "queued"),
    [missions],
  );
  const doneMissions = useMemo(() => missions.filter((m) => m.status === "done"), [missions]);
  const errorMissions = useMemo(() => missions.filter((m) => m.status === "error"), [missions]);

  /* Dispatch */
  const dispatch = useCallback(() => {
    if (!form.title.trim()) return;
    const agentName =
      AGENT_ROSTER.find((a) => a.specialty === form.specialty)?.name ?? form.specialty;
    const log: MissionLogEntry[] = [
      {
        at: new Date().toISOString(),
        message: "Mission dispatched by AI Manager.",
      },
      {
        at: new Date().toISOString(),
        message: form.brief
          ? `Brief: ${form.brief.slice(0, 160)}`
          : "No additional brief provided.",
      },
    ];
    const mission: AgentMission = {
      id: crypto.randomUUID(),
      specialty: form.specialty,
      title: form.title.trim(),
      brief: form.brief.trim(),
      status: "queued",
      priority: form.priority,
      clientId: form.clientId === "none" ? "" : form.clientId,
      createdAt: new Date().toISOString(),
      log,
    };
    onMissionsChange([mission, ...missions]);
    onPushActivity(
      `AI Manager dispatched: "${mission.title}" → ${agentName}`,
      "info",
    );
    setForm(EMPTY_FORM);
    setShowDispatch(false);
  }, [form, missions, onMissionsChange, onPushActivity]);

  /* Status update */
  const updateStatus = useCallback(
    (id: string, status: AgentStatus) => {
      onMissionsChange(
        missions.map((m) => {
          if (m.id !== id) return m;
          const entry: MissionLogEntry = {
            at: new Date().toISOString(),
            message: `Status updated to ${STATUS_LABEL[status]}.`,
          };
          return {
            ...m,
            status,
            log: [...m.log, entry],
            startedAt:
              status === "active" && !m.startedAt ? new Date().toISOString() : m.startedAt,
            completedAt:
              status === "done" || status === "error"
                ? new Date().toISOString()
                : m.completedAt,
          };
        }),
      );
    },
    [missions, onMissionsChange],
  );

  /* Remove */
  const removeMission = useCallback(
    (id: string) => {
      onMissionsChange(missions.filter((m) => m.id !== id));
    },
    [missions, onMissionsChange],
  );

  /* Quick-assign from agent card */
  const quickAssign = useCallback((specialty: AgentSpecialty) => {
    setForm({ ...EMPTY_FORM, specialty });
    setShowDispatch(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ------------------------------------------------------------------ */
  /* Render                                                               */
  /* ------------------------------------------------------------------ */
  return (
    <section aria-labelledby="agent-hub-heading">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* ---- Header ---- */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-[var(--trust)] to-slate-700 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                AI Command Center
              </p>
              <h2
                id="agent-hub-heading"
                className="mt-1 text-lg font-semibold text-white"
              >
                AI Manager Agent
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300">
                Dispatch specialist agents to any task — from fixing bugs and reviewing
                customer emails to surveying clients on what they want from their site. The
                AI Manager orchestrates everything and logs every action.
              </p>
            </div>
            <button
              className="shrink-0 self-start rounded-lg bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 hover:bg-white/25"
              onClick={() => setShowDispatch((o) => !o)}
              type="button"
            >
              {showDispatch ? "✕ Cancel" : "＋ Dispatch Mission"}
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              {
                label: "Active / Queued",
                value: activeMissions.length,
                cls: "text-emerald-300",
              },
              { label: "Completed", value: doneMissions.length, cls: "text-blue-300" },
              {
                label: "Errors",
                value: errorMissions.length,
                cls: errorMissions.length > 0 ? "text-red-300" : "text-slate-400",
              },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-white/10 px-3 py-2.5">
                <p className={`text-2xl font-bold tabular-nums ${s.cls}`}>{s.value}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Dispatch form ---- */}
        {showDispatch && (
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-5 sm:px-6">
            <p className="mb-4 text-sm font-semibold text-[var(--trust)]">
              New Mission Brief
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Mission title *
                </label>
                <input
                  className="form-control text-sm"
                  placeholder="e.g. Review contact form emails from the last 7 days"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Brief / Instructions
                </label>
                <textarea
                  className="form-control resize-none text-sm"
                  placeholder="Describe what the agent should do, what to look for, and any constraints..."
                  rows={3}
                  value={form.brief}
                  onChange={(e) => setForm((f) => ({ ...f, brief: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Assign to
                </label>
                <select
                  className="form-control text-sm"
                  value={form.specialty}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, specialty: e.target.value as AgentSpecialty }))
                  }
                >
                  {AGENT_ROSTER.map((a) => (
                    <option key={a.specialty} value={a.specialty}>
                      {a.icon} {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Priority
                </label>
                <select
                  className="form-control text-sm"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))
                  }
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              {clients.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Linked client (optional)
                  </label>
                  <select
                    className="form-control text-sm"
                    value={form.clientId}
                    onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                  >
                    <option value="none">None</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="rounded-lg bg-[var(--trust)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                disabled={!form.title.trim()}
                onClick={dispatch}
                type="button"
              >
                Dispatch
              </button>
              <button
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setShowDispatch(false);
                  setForm(EMPTY_FORM);
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ---- Specialist agents grid ---- */}
        <div className="px-5 py-5 sm:px-6">
          <p className="mb-4 text-sm font-semibold text-[var(--trust)]">Specialist Agents</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {AGENT_ROSTER.map((meta) => {
              const status = agentStatus(missions, meta.specialty);
              const current = agentActiveMission(missions, meta.specialty);
              const isActive = status === "active";
              return (
                <div
                  key={meta.specialty}
                  className={`rounded-xl border p-4 ${meta.bgClass} ${isActive ? "border-emerald-300" : meta.borderClass}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{meta.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-[var(--trust)]">
                          {meta.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]} ${isActive ? "animate-pulse" : ""}`}
                          />
                          <span className="text-[10px] text-slate-500">
                            {STATUS_LABEL[status]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="shrink-0 rounded-md bg-[var(--trust)] px-2 py-1 text-[10px] font-semibold text-white hover:opacity-80"
                      onClick={() => quickAssign(meta.specialty)}
                      type="button"
                    >
                      Assign
                    </button>
                  </div>
                  <p className="mt-2.5 text-[10px] leading-relaxed text-slate-500">
                    {meta.role}
                  </p>
                  {current && (
                    <div className="mt-2.5 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-2">
                      <p className="truncate text-[10px] font-medium text-slate-700">
                        {current.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {STATUS_LABEL[current.status]} · {formatRelative(current.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---- Active / queued missions ---- */}
        {activeMissions.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
            <p className="mb-3 text-sm font-semibold text-[var(--trust)]">Active missions</p>
            <ul className="space-y-2">
              {activeMissions.map((m) => {
                const agentMeta = AGENT_ROSTER.find((a) => a.specialty === m.specialty);
                const expanded = expandedId === m.id;
                return (
                  <li
                    key={m.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="flex items-start justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${STATUS_DOT[m.status]} ${m.status === "active" ? "animate-pulse" : ""}`}
                          />
                          <p className="truncate text-sm font-medium text-slate-900">
                            {m.title}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            {agentMeta?.icon} {agentMeta?.name}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              m.priority === "urgent"
                                ? "bg-red-100 text-red-700"
                                : m.priority === "high"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {m.priority}
                          </span>
                        </div>
                        {m.brief && (
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{m.brief}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                        <button
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                          onClick={() => setExpandedId(expanded ? null : m.id)}
                          type="button"
                        >
                          {expanded ? "Hide" : "Log"}
                        </button>
                        {m.status === "queued" && (
                          <button
                            className="rounded-md bg-[var(--trust)] px-2.5 py-1.5 text-[11px] font-medium text-white hover:opacity-90"
                            onClick={() => updateStatus(m.id, "active")}
                            type="button"
                          >
                            Start
                          </button>
                        )}
                        <button
                          className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-[11px] font-medium text-white hover:opacity-90"
                          onClick={() => updateStatus(m.id, "done")}
                          type="button"
                        >
                          Done
                        </button>
                        <button
                          className="rounded-md border border-slate-200 px-2 py-1.5 text-[11px] text-red-500 hover:bg-red-50"
                          onClick={() => removeMission(m.id)}
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    {expanded && m.log.length > 0 && (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Mission log
                        </p>
                        <ul className="space-y-1.5">
                          {m.log.map((entry, i) => (
                            <li key={i} className="flex gap-2.5">
                              <span className="shrink-0 text-[10px] text-slate-400">
                                {new Date(entry.at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="text-[11px] leading-relaxed text-slate-600">
                                {entry.message}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ---- Error missions ---- */}
        {errorMissions.length > 0 && (
          <div className="border-t border-red-100 bg-red-50/60 px-5 py-4 sm:px-6">
            <p className="mb-2 text-sm font-semibold text-red-700">Failed missions</p>
            <ul className="space-y-1.5">
              {errorMissions.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-white px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-800">{m.title}</p>
                    <p className="text-[10px] text-red-500">Error · {formatRelative(m.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
                      onClick={() => updateStatus(m.id, "queued")}
                      type="button"
                    >
                      Retry
                    </button>
                    <button
                      className="text-[11px] text-slate-400 hover:text-red-500"
                      onClick={() => removeMission(m.id)}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ---- Completed missions ---- */}
        {doneMissions.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
            <p className="mb-3 text-sm font-semibold text-[var(--trust)]">
              Completed missions
            </p>
            <ul className="space-y-1.5">
              {doneMissions.slice(0, 8).map((m) => {
                const agentMeta = AGENT_ROSTER.find((a) => a.specialty === m.specialty);
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-700">{m.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {agentMeta?.icon} {agentMeta?.name} ·{" "}
                        {m.completedAt ? formatRelative(m.completedAt) : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                        Done
                      </span>
                      <button
                        className="text-[10px] text-slate-400 hover:text-red-500"
                        onClick={() => removeMission(m.id)}
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ---- Empty state ---- */}
        {missions.length === 0 && (
          <div className="border-t border-slate-100 px-5 py-10 text-center">
            <p className="text-sm text-slate-500">
              No missions dispatched yet.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Click "＋ Dispatch Mission" to assign work to any specialist agent above.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
