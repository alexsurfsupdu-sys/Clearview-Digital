"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SectionKey = "hero" | "services" | "process" | "contact" | "faq" | "trust";

type Baseline = {
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

type AuditCheck = {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

type AuditResult = {
  homepageUrl: string;
  auditedAt: string;
  score: number;
  checks: AuditCheck[];
  missingSections: string[];
  recommendedTasks: string[];
  generatedBrief: string;
};

const STORAGE_KEY = "clearview-manager-baseline-v2";

const sectionOptions: Array<{ key: SectionKey; label: string; selector: string }> = [
  { key: "hero", label: "Hero", selector: "h1" },
  { key: "services", label: "Services", selector: "#services" },
  { key: "process", label: "Process", selector: "#process" },
  { key: "contact", label: "Contact", selector: "#contact" },
  { key: "faq", label: "FAQ", selector: "#faq" },
  { key: "trust", label: "Trust / Proof", selector: "section:nth-of-type(4)" },
];

const defaultBaseline: Baseline = {
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

export function ManagerDashboard() {
  const [baseline, setBaseline] = useState<Baseline>(defaultBaseline);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBaseline(JSON.parse(saved) as Baseline);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(baseline));
  }, [baseline, hydrated]);

  const overview = useMemo(() => {
    const totalChecks = audit?.checks.length ?? 0;
    const passedChecks = audit?.checks.filter((check) => check.status === "pass").length ?? 0;
    const failedChecks = audit?.checks.filter((check) => check.status === "fail").length ?? 0;

    return [
      {
        label: "Baseline Sections",
        value: String(baseline.requiredSections.length),
        note: "What the site is expected to include",
      },
      {
        label: "Audit Score",
        value: audit ? `${audit.score}%` : "--",
        note: audit ? "Against your current baseline" : "Run audit to generate",
      },
      {
        label: "Passed Checks",
        value: String(passedChecks),
        note: totalChecks ? `${passedChecks} of ${totalChecks}` : "No audit yet",
      },
      {
        label: "Open Issues",
        value: String(failedChecks + (audit?.missingSections.length ?? 0)),
        note: audit ? "Failures and missing sections" : "Waiting for audit",
      },
    ];
  }, [audit, baseline.requiredSections.length]);

  async function runAudit() {
    setIsRunningAudit(true);
    try {
      const response = await fetch("/", { cache: "no-store" });
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const checks: AuditCheck[] = [];
      const missingSections: string[] = [];
      let points = 0;
      let possible = 0;

      const title = doc.querySelector("title")?.textContent?.trim() ?? "";
      const metaDescription =
        doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ??
        "";
      const contactForm = doc.querySelector("#contact form");
      const primaryCta = Array.from(doc.querySelectorAll('a[href="#contact"], button')).find(
        (node) => (node.textContent ?? "").toLowerCase().includes("proposal") ||
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

      setAudit({
        homepageUrl: window.location.origin,
        auditedAt: new Date().toLocaleString(),
        score,
        checks,
        missingSections,
        recommendedTasks,
        generatedBrief: buildAgentBrief({ baseline, checks, missingSections, recommendedTasks }),
      });
    } finally {
      setIsRunningAudit(false);
    }
  }

  function resetBaseline() {
    setBaseline(defaultBaseline);
    setAudit(null);
    window.localStorage.removeItem(STORAGE_KEY);
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

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="border-b border-white/6 bg-[rgba(8,12,26,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-label">Manager</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] sm:text-5xl">
                Site Baseline + Audit
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/42 sm:text-base">
                This manager is tied to the main site. First define what the site
                is supposed to include, then audit the homepage against that
                baseline so the missing pieces are real instead of guessed.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
                href="/"
              >
                Back to Landing Page
              </Link>
              <button
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
                onClick={resetBaseline}
                type="button"
              >
                Reset Baseline
              </button>
              <button
                className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_40px_rgba(37,99,235,0.3)] transition hover:bg-[var(--primary-dark)] disabled:opacity-70"
                disabled={isRunningAudit}
                onClick={runAudit}
                type="button"
              >
                {isRunningAudit ? "Running Audit..." : "Run Site Audit"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overview.map((item) => (
              <article
                key={item.label}
                className="rounded-[1.4rem] border border-white/7 bg-white/[0.025] p-5"
              >
                <p className="text-sm text-white/40">{item.label}</p>
                <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-[var(--accent)]">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <section className="space-y-6">
          <Panel eyebrow="Baseline" title="What the site is supposed to be">
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-white/55">Business name</span>
                <input
                  className="form-control"
                  onChange={(event) =>
                    setBaseline((current) => ({
                      ...current,
                      businessName: event.target.value,
                    }))
                  }
                  value={baseline.businessName}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-white/55">Primary goal</span>
                <input
                  className="form-control"
                  onChange={(event) =>
                    setBaseline((current) => ({
                      ...current,
                      primaryGoal: event.target.value,
                    }))
                  }
                  value={baseline.primaryGoal}
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm text-white/55">Target audience</span>
              <input
                className="form-control"
                onChange={(event) =>
                  setBaseline((current) => ({
                    ...current,
                    targetAudience: event.target.value,
                  }))
                }
                value={baseline.targetAudience}
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm text-white/55">Manager notes</span>
              <textarea
                className="form-control min-h-32 resize-y"
                onChange={(event) =>
                  setBaseline((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                value={baseline.notes}
              />
            </label>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Required sections
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {sectionOptions.map((section) => {
                  const active = baseline.requiredSections.includes(section.key);
                  return (
                    <button
                      key={section.key}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        active
                          ? "border-[var(--primary)]/35 bg-[var(--primary)]/10 text-white"
                          : "border-white/8 bg-white/[0.025] text-white/55"
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

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Required checks
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(baseline.requiredChecks).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 text-sm text-white/70"
                  >
                    <span>{formatCheckLabel(key)}</span>
                    <input
                      checked={value}
                      className="h-4 w-4 accent-[var(--primary)]"
                      onChange={(event) =>
                        setBaseline((current) => ({
                          ...current,
                          requiredChecks: {
                            ...current.requiredChecks,
                            [key]: event.target.checked,
                          },
                        }))
                      }
                      type="checkbox"
                    />
                  </label>
                ))}
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Audit Output" title="Live homepage results">
            {audit ? (
              <>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/45">
                  <span>Homepage: {audit.homepageUrl}</span>
                  <span>Audited: {audit.auditedAt}</span>
                </div>

                <div className="mt-6 space-y-3">
                  {audit.checks.map((check) => (
                    <div
                      key={check.key}
                      className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {check.label}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-white/45">
                            {check.detail}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${
                            check.status === "pass"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : check.status === "warn"
                                ? "bg-amber-500/15 text-amber-300"
                                : "bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {check.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState text="Run the audit after setting your baseline. This manager will inspect the real homepage and compare it against what you marked as required." />
            )}
          </Panel>
        </section>

        <aside className="space-y-6">
          <Panel eyebrow="Missing" title="What still needs work">
            {audit ? (
              <>
                {audit.missingSections.length ? (
                  <ul className="mt-6 space-y-3 text-sm text-white/60">
                    {audit.missingSections.map((section) => (
                      <li
                        key={section}
                        className="rounded-2xl border border-rose-500/20 bg-rose-500/8 px-4 py-3"
                      >
                        Missing required section: {section}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState text="No required sections are currently missing from the homepage audit." />
                )}
              </>
            ) : (
              <EmptyState text="Missing-section analysis appears here after the first audit." />
            )}
          </Panel>

          <Panel eyebrow="Next Tasks" title="Recommended fixes">
            {audit ? (
              <ul className="mt-6 space-y-3 text-sm text-white/60">
                {audit.recommendedTasks.map((task) => (
                  <li
                    key={task}
                    className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3"
                  >
                    {task}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState text="Recommended tasks will be generated from the audit results." />
            )}
          </Panel>

          <Panel eyebrow="Agent Brief" title="Copy-ready handoff">
            {audit ? (
              <>
                <textarea
                  className="form-control mt-6 min-h-72 resize-y"
                  readOnly
                  value={audit.generatedBrief}
                />
                <button
                  className="mt-4 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
                  onClick={() => navigator.clipboard.writeText(audit.generatedBrief)}
                  type="button"
                >
                  Copy Agent Brief
                </button>
              </>
            ) : (
              <EmptyState text="Once the audit runs, this section will create a structured brief you can hand to an agent or use as your own implementation checklist." />
            )}
          </Panel>
        </aside>
      </div>
    </main>
  );
}

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

function Panel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/7 bg-white/[0.02] p-6">
      <p className="section-label">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em]">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm leading-7 text-white/35">
      {text}
    </div>
  );
}
