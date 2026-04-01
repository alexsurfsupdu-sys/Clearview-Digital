export type SectionKey = "hero" | "services" | "process" | "contact" | "faq" | "trust";

export type Baseline = {
  businessName: string;
  primaryGoal: string;
  targetAudience: string;
  notes: string;
  requiredSections: SectionKey[];
  requiredChecks: {
    metaTitle: boolean;
    metaDescription: boolean;
    contactForm: boolean;
    primaryCta: boolean;
    analytics: boolean;
  };
};

export type AuditCheck = {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

export type AuditResult = {
  homepageUrl: string;
  auditedAt: string;
  score: number;
  checks: AuditCheck[];
  missingSections: string[];
  recommendedTasks: string[];
  generatedBrief: string;
};

export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "done";

export type AgentRole =
  | "Unassigned"
  | "Coding"
  | "Visuals"
  | "Maintenance"
  | "Content"
  | "SEO"
  | "Ops";

export type TaskItem = {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: AgentRole;
  clientId: string;
  due?: string;
};

export type ClientAccount = {
  id: string;
  name: string;
  siteLabel: string;
  status: "healthy" | "attention" | "risk";
  lastUpdate: string;
  issueNote?: string;
  billingCurrent: boolean;
};

export type ActivityEntry = {
  id: string;
  at: string;
  label: string;
  tone: "neutral" | "info" | "warning" | "success";
};

export type LeadStage = "new" | "contacted" | "qualified" | "won" | "lost";

export type LeadItem = {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  source: string;
  stage: LeadStage;
  notes: string;
  nextStep: string;
  createdAt: string;
};

export type ManagerPersistedState = {
  version: 1;
  baseline: Baseline;
  tasks: TaskItem[];
  clients: ClientAccount[];
  leads: LeadItem[];
  activity: ActivityEntry[];
  audit: AuditResult | null;
};
