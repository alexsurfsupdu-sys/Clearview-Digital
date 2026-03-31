import Link from "next/link";

const overviewStats = [
  { label: "New Leads", value: "12", note: "4 need replies today" },
  { label: "Active Builds", value: "6", note: "2 ready for review" },
  { label: "Managed Sites", value: "18", note: "3 monthly updates due" },
  { label: "Automation Queue", value: "9", note: "Ready for agent handoff" },
];

const pipeline = [
  {
    stage: "Inquiry",
    items: [
      "HVAC site redesign proposal",
      "Local med spa landing page",
      "Roofing company instant quote page",
    ],
  },
  {
    stage: "Building",
    items: [
      "Clearview lead funnel polish",
      "Legal office mobile cleanup",
      "Salon services page migration",
    ],
  },
  {
    stage: "Review",
    items: ["Law firm testimonials pass", "Skincare studio copy approval"],
  },
  {
    stage: "Live / Managed",
    items: [
      "Tree service monthly edits",
      "Real estate landing page analytics review",
      "Pressure washing SEO refresh",
    ],
  },
];

const tasks = [
  {
    title: "Finalize business email routing",
    owner: "You",
    priority: "High",
    status: "Blocked until inbox is ready",
  },
  {
    title: "Set up Meta Pixel on landing page",
    owner: "Tomorrow",
    priority: "Medium",
    status: "Ready",
  },
  {
    title: "Create reusable proposal intake template",
    owner: "Agent-ready",
    priority: "High",
    status: "Ready",
  },
  {
    title: "Draft client portal IA",
    owner: "Agent-ready",
    priority: "Medium",
    status: "Can delegate",
  },
];

const agentCards = [
  {
    title: "Landing Polish Agent",
    description:
      "Tighten hero copy, CTA hierarchy, spacing, and mobile flow without changing the brand direction.",
    action: "Prepare brief",
  },
  {
    title: "Analytics Setup Agent",
    description:
      "Implement Meta Pixel, Vercel Analytics checks, and future GA4 placement notes.",
    action: "Queue next",
  },
  {
    title: "Portal Planning Agent",
    description:
      "Map the future client login, onboarding status screen, and co-admin feature set.",
    action: "Scope tomorrow",
  },
];

const builds = [
  {
    client: "Clearview Digital",
    phase: "Live landing page",
    nextStep: "Business email + manager polish",
  },
  {
    client: "HVAC Prospect",
    phase: "Proposal stage",
    nextStep: "Send first concept deck",
  },
  {
    client: "Law Firm",
    phase: "Review",
    nextStep: "Collect revision notes",
  },
  {
    client: "Skincare Studio",
    phase: "Managed",
    nextStep: "Monthly content refresh",
  },
];

export default function ManagerPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="border-b border-white/6 bg-[rgba(8,12,26,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-label">Internal Workspace</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] sm:text-5xl">
                Manager Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/42 sm:text-base">
                One place to organize leads, current builds, monthly client work,
                and the next tasks you want to hand off to agents.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
                href="/"
              >
                Back to Landing Page
              </Link>
              <button className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_40px_rgba(37,99,235,0.3)] transition hover:bg-[var(--primary-dark)]">
                Start Daily Review
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overviewStats.map((item) => (
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

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-10">
        <section className="space-y-6">
          <div className="rounded-[1.6rem] border border-white/7 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-label">Pipeline</p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em]">
                  Client workflow
                </h2>
              </div>
              <p className="text-sm text-white/35">Inquiry → Build → Review → Live</p>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-4">
              {pipeline.map((column) => (
                <article
                  key={column.stage}
                  className="rounded-[1.25rem] border border-white/7 bg-[rgba(255,255,255,0.025)] p-4"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    {column.stage}
                  </h3>
                  <div className="mt-4 space-y-3">
                    {column.items.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/6 bg-white/4 px-4 py-3 text-sm leading-6 text-white/72"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/7 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-label">Build Board</p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em]">
                  Active work
                </h2>
              </div>
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/8 hover:text-white">
                Add client
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-white/6">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-white/[0.03] text-white/45">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Phase</th>
                    <th className="px-4 py-3 font-medium">Next step</th>
                  </tr>
                </thead>
                <tbody>
                  {builds.map((build) => (
                    <tr key={build.client} className="border-t border-white/6">
                      <td className="px-4 py-4 font-medium text-white/82">
                        {build.client}
                      </td>
                      <td className="px-4 py-4 text-white/55">{build.phase}</td>
                      <td className="px-4 py-4 text-white/55">{build.nextStep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[1.6rem] border border-white/7 bg-white/[0.02] p-6">
            <p className="section-label">Today</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em]">
              Priority tasks
            </h2>
            <div className="mt-6 space-y-3">
              {tasks.map((task) => (
                <article
                  key={task.title}
                  className="rounded-[1.2rem] border border-white/6 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-semibold text-white/86">
                      {task.title}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                      {task.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/35">Owner: {task.owner}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--accent)]">
                    {task.status}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-white/7 bg-white/[0.02] p-6">
            <p className="section-label">Agent Handoff</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em]">
              Ready for delegation
            </h2>
            <div className="mt-6 space-y-4">
              {agentCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[1.2rem] border border-[var(--primary)]/18 bg-[var(--primary)]/8 p-4"
                >
                  <h3 className="text-sm font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/52">
                    {card.description}
                  </p>
                  <button className="mt-4 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white/65 transition hover:bg-white/10 hover:text-white">
                    {card.action}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-white/7 bg-white/[0.02] p-6">
            <p className="section-label">Tomorrow Setup</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.05em]">
              Workflow starter
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-white/55">
              <li>1. Create the business inbox and connect the contact form.</li>
              <li>2. Add Meta Pixel and verify analytics traffic.</li>
              <li>3. Define the first reusable proposal workflow.</li>
              <li>4. Scope the client portal and co-admin dashboard.</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
