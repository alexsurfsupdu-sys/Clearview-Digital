import type {
  ActivityEntry,
  AgentRole,
  AuditCheck,
  AuditResult,
  Baseline,
  ClientAccount,
  ManagerPersistedState,
  TaskItem,
  SectionKey,
} from "./types";

export const sectionOptions: Array<{ key: SectionKey; label: string; selector: string }> = [
  { key: "hero", label: "Hero", selector: "h1" },
  { key: "services", label: "Services", selector: "#services" },
  { key: "process", label: "Process", selector: "#process" },
  { key: "contact", label: "Contact", selector: "#contact" },
  { key: "faq", label: "FAQ", selector: "#faq" },
  { key: "trust", label: "Trust / Proof", selector: "section:nth-of-type(4)" },
];

export const defaultBaseline: Baseline = {
  businessName: "Clearview Digital",
  primaryGoal: "Get qualified leads for custom websites and monthly management.",
  targetAudience: "Small businesses and growing brands that need a better website.",
  notes:
    "The site should feel premium, trustworthy, and conversion-focused. It should clearly explain the offer and guide visitors to the contact form.",
  requiredSections: ["hero", "services", "process", "trust", "contact", "faq"],
  requiredChecks: {
    metaTitle: true,
    metaDescription: true,
    contactForm: true,
    primaryCta: true,
    analytics: true,
  },
};

/** Empty by default — add your real clients in the manager UI (or import later). */
export const defaultClients: ClientAccount[] = [];

export const defaultTasks: TaskItem[] = [];

export const SPECIALISTS: AgentRole[] = [
  "Unassigned",
  "Coding",
  "Visuals",
  "Maintenance",
  "Content",
  "SEO",
  "Ops",
];

function migrateAssignee(raw: unknown): AgentRole {
  const s = typeof raw === "string" ? raw : "Unassigned";
  if (SPECIALISTS.includes(s as AgentRole)) return s as AgentRole;
  if (s === "Dev") return "Coding";
  return "Unassigned";
}

export function migrateTaskFromStorage(raw: unknown): TaskItem | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Partial<TaskItem>;
  if (typeof t.id !== "string" || typeof t.title !== "string") return null;
  const pr = t.priority;
  const st = t.status;
  return {
    id: t.id,
    title: t.title,
    priority:
      pr === "low" || pr === "normal" || pr === "high" || pr === "urgent" ? pr : "normal",
    status:
      st === "pending" || st === "in_progress" || st === "done" ? st : "pending",
    assignee: migrateAssignee(t.assignee),
    clientId: typeof t.clientId === "string" ? t.clientId : "unlinked",
    due: typeof t.due === "string" ? t.due : undefined,
  };
}

function normalizeBaseline(raw: unknown): Baseline {
  if (!raw || typeof raw !== "object") return { ...defaultBaseline };
  const b = raw as Partial<Baseline>;
  const sections = Array.isArray(b.requiredSections)
    ? b.requiredSections.filter((x): x is SectionKey =>
        sectionOptions.some((o) => o.key === x),
      )
    : defaultBaseline.requiredSections;
  const rc = b.requiredChecks;
  return {
    businessName: typeof b.businessName === "string" ? b.businessName : defaultBaseline.businessName,
    primaryGoal: typeof b.primaryGoal === "string" ? b.primaryGoal : defaultBaseline.primaryGoal,
    targetAudience:
      typeof b.targetAudience === "string" ? b.targetAudience : defaultBaseline.targetAudience,
    notes: typeof b.notes === "string" ? b.notes : defaultBaseline.notes,
    requiredSections: sections.length ? sections : defaultBaseline.requiredSections,
    requiredChecks: {
      metaTitle: Boolean(rc?.metaTitle ?? defaultBaseline.requiredChecks.metaTitle),
      metaDescription: Boolean(
        rc?.metaDescription ?? defaultBaseline.requiredChecks.metaDescription,
      ),
      contactForm: Boolean(rc?.contactForm ?? defaultBaseline.requiredChecks.contactForm),
      primaryCta: Boolean(rc?.primaryCta ?? defaultBaseline.requiredChecks.primaryCta),
      analytics: Boolean(rc?.analytics ?? defaultBaseline.requiredChecks.analytics),
    },
  };
}

function normalizeClient(raw: unknown): ClientAccount | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Partial<ClientAccount>;
  if (typeof c.id !== "string" || typeof c.name !== "string") return null;
  const st = c.status;
  const status =
    st === "healthy" || st === "attention" || st === "risk" ? st : "healthy";
  return {
    id: c.id,
    name: c.name,
    siteLabel: typeof c.siteLabel === "string" ? c.siteLabel : "",
    status,
    lastUpdate: typeof c.lastUpdate === "string" ? c.lastUpdate : "",
    issueNote: typeof c.issueNote === "string" ? c.issueNote : undefined,
    billingCurrent: Boolean(c.billingCurrent),
  };
}

function normalizeActivity(raw: unknown): ActivityEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Partial<ActivityEntry>;
  if (typeof a.id !== "string" || typeof a.label !== "string") return null;
  const tone =
    a.tone === "info" || a.tone === "warning" || a.tone === "success" || a.tone === "neutral"
      ? a.tone
      : "neutral";
  return {
    id: a.id,
    at: typeof a.at === "string" ? a.at : "",
    label: a.label,
    tone,
  };
}

function normalizeAudit(raw: unknown): AuditResult | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "object") return null;
  const a = raw as Partial<AuditResult>;
  if (typeof a.homepageUrl !== "string" || typeof a.score !== "number") return null;
  if (!Array.isArray(a.checks)) return null;
  const checks = a.checks
    .map((c) => {
      if (!c || typeof c !== "object") return null;
      const x = c as Partial<AuditCheck>;
      if (typeof x.key !== "string" || typeof x.label !== "string") return null;
      const st = x.status;
      const status = st === "pass" || st === "warn" || st === "fail" ? st : "fail";
      return {
        key: x.key,
        label: x.label,
        status,
        detail: typeof x.detail === "string" ? x.detail : "",
      };
    })
    .filter(Boolean) as AuditCheck[];

  return {
    homepageUrl: a.homepageUrl,
    auditedAt: typeof a.auditedAt === "string" ? a.auditedAt : "",
    score: Math.min(100, Math.max(0, a.score)),
    checks,
    missingSections: Array.isArray(a.missingSections)
      ? a.missingSections.filter((x): x is string => typeof x === "string").slice(0, 32)
      : [],
    recommendedTasks: Array.isArray(a.recommendedTasks)
      ? a.recommendedTasks.filter((x): x is string => typeof x === "string").slice(0, 64)
      : [],
    generatedBrief: typeof a.generatedBrief === "string" ? a.generatedBrief : "",
  };
}

export function getDefaultManagerState(): ManagerPersistedState {
  return {
    version: 1,
    baseline: { ...defaultBaseline },
    tasks: defaultTasks.map((t) => ({ ...t })),
    clients: defaultClients.map((c) => ({ ...c })),
    activity: [
      {
        id: "seed",
        at: new Date().toISOString(),
        label: "Store ready — add your clients and tasks; nothing here is synced to a CRM yet.",
        tone: "neutral",
      },
    ],
    audit: null,
  };
}

export function normalizeManagerState(raw: unknown): ManagerPersistedState {
  const base = getDefaultManagerState();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Partial<ManagerPersistedState>;

  const tasksKeyPresent = Object.prototype.hasOwnProperty.call(o, "tasks");
  const clientsKeyPresent = Object.prototype.hasOwnProperty.call(o, "clients");
  const activityKeyPresent = Object.prototype.hasOwnProperty.call(o, "activity");

  const tasksRaw = Array.isArray(o.tasks) ? o.tasks : [];
  const tasks = tasksRaw
    .map(migrateTaskFromStorage)
    .filter(Boolean)
    .slice(0, 400) as TaskItem[];

  const clientsRaw = Array.isArray(o.clients) ? o.clients : [];
  const clients = clientsRaw
    .map(normalizeClient)
    .filter(Boolean)
    .slice(0, 200) as ClientAccount[];

  const activityRaw = Array.isArray(o.activity) ? o.activity : [];
  const activity = activityRaw
    .map(normalizeActivity)
    .filter(Boolean)
    .slice(0, 80) as ActivityEntry[];

  return {
    version: 1,
    baseline: normalizeBaseline(o.baseline),
    tasks: tasksKeyPresent ? tasks : base.tasks,
    clients: clientsKeyPresent ? clients : base.clients,
    activity: activityKeyPresent ? activity : base.activity,
    audit: normalizeAudit(o.audit),
  };
}

export function isTaskOverdue(t: TaskItem): boolean {
  if (!t.due || t.status === "done") return false;
  const due = new Date(t.due);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function suggestedSpecialtyForAuditKey(key: string): AgentRole | undefined {
  if (key.startsWith("section-")) return "Visuals";
  if (key === "meta-title" || key === "meta-description" || key === "primary-cta") return "SEO";
  if (key === "contact-form" || key === "analytics") return "Coding";
  return "Maintenance";
}
