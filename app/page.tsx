import Link from "next/link";
import { ContactForm } from "@/components/landing/contact-form";
import { FAQAccordion } from "@/components/landing/faq-accordion";
import { Logo } from "@/components/landing/logo";
import {
  credibilityPills,
  faqs,
  processSteps,
  serviceCards,
  stats,
  testimonials,
  valueBullets,
  valueItems,
} from "@/components/landing/data";

export default function Home() {
  return (
    <main className="relative overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(24,49,83,0.08),transparent_42%)]" />

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[rgba(251,251,249,0.94)] backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link className="transition hover:text-slate-950" href="#services">
              Services
            </Link>
            <Link className="transition hover:text-slate-950" href="#process">
              How It Works
            </Link>
            <Link className="transition hover:text-slate-950" href="#faq">
              FAQ
            </Link>
            <Link
              className="rounded-full bg-[var(--primary)] px-5 py-2.5 font-semibold text-white shadow-[0_12px_26px_rgba(249,115,22,0.18)] transition hover:bg-[var(--primary-dark)] hover:shadow-[0_14px_30px_rgba(234,88,12,0.2)]"
              href="#contact"
            >
              Get My Free Proposal
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-24">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--trust)]">
            <span className="h-2 w-2 rounded-full bg-[var(--trust)]" />
            Clearview Digital
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-[-0.04em] text-balance text-slate-950 sm:text-6xl lg:text-7xl">
            Custom websites that bring you more customers.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            We design, build, and manage your site so it actually brings in leads,
            not just looks pretty.
          </p>

          <div className="mt-9">
            <Link
              className="inline-flex rounded-full bg-[var(--primary)] px-8 py-4 text-base font-semibold text-white shadow-[0_16px_34px_rgba(249,115,22,0.2)] transition hover:bg-[var(--primary-dark)] hover:shadow-[0_18px_38px_rgba(234,88,12,0.22)]"
              href="#contact"
            >
              Get My Free Proposal
            </Link>
            <p className="mt-3 text-sm font-medium text-slate-500">
              Free proposal. No pressure.
            </p>
            <div className="mt-4">
              <Link className="secondary-link" href="#services">
                See what we build
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-5 border-t border-slate-200 pt-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold tracking-[-0.04em] text-[var(--trust)]">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[1.8rem] border border-[var(--border)] bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="mb-6 rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--trust)]">
                What You Get
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-[var(--trust)]">
                A site built to win trust and bring in leads.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
                Clear messaging, faster launch, stronger visibility, and ongoing
                support without you managing the tech.
              </p>
            </div>

            <div className="space-y-3">
              {valueItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--trust)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--trust)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link
                className="inline-flex rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(249,115,22,0.18)] transition hover:bg-[var(--primary-dark)]"
                href="#contact"
              >
                Get My Free Proposal
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="border-t border-slate-200 px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-[700px]">
            <p className="section-label">What we do</p>
            <h2 className="section-heading mt-4">
              We build the kind of website that makes your business look real,
              trustworthy, and worth contacting.
            </h2>
            <p className="section-copy mt-5">
              We design it, build it, and keep it managed so you are not stuck
              chasing designers, developers, and support people separately.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {serviceCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[1.45rem] border border-slate-200 bg-white p-7 shadow-[0_14px_40px_rgba(15,23,42,0.04)]"
              >
                <span className="mb-4 block h-2.5 w-2.5 rounded-full bg-[var(--trust)]" />
                <h3 className="text-lg font-semibold text-[var(--trust)]">{card.title}</h3>
                <p className="mt-3 max-w-[32ch] text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10">
            <Link
              className="inline-flex rounded-full bg-[var(--primary)] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_32px_rgba(249,115,22,0.18)] transition hover:bg-[var(--primary-dark)] hover:shadow-[0_16px_36px_rgba(234,88,12,0.2)]"
              href="#contact"
            >
              Get My Free Proposal
            </Link>
          </div>
        </div>
      </section>

      <section id="process" className="border-t border-slate-200 bg-white px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-[700px]">
            <p className="section-label">How it works</p>
            <h2 className="section-heading mt-4">Simple process, fast launch.</h2>
            <p className="section-copy mt-5">
              Transparent, fast, and built to launch within days, not months.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {processSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-[1.45rem] border border-[var(--border)] bg-[var(--surface)] p-6"
              >
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trust)]">
                  {step.number}
                </p>
                <h3 className="mt-3 text-base font-semibold text-[var(--trust)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <Link className="secondary-link" href="#contact">
              Ready? Get My Free Proposal.
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-[700px]">
            <p className="section-label">Proof</p>
            <h2 className="section-heading mt-4">
              This is for businesses that want a site that helps bring in work.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-[1.45rem] border border-slate-200 bg-white p-8 shadow-[0_14px_40px_rgba(15,23,42,0.04)]"
              >
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trust)]">
                  {item.result}
                </p>
                <p className="mt-4 text-[15px] leading-7 text-slate-600">
                  “{item.quote}”
                </p>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-[var(--trust)]">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.role}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {credibilityPills.map((item) => (
              <article
                key={item.label}
                className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-5"
              >
                <span className="mt-1 text-[var(--trust)]">●</span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--trust)]">{item.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10">
            <Link
              className="inline-flex rounded-full bg-[var(--primary)] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_32px_rgba(249,115,22,0.18)] transition hover:bg-[var(--primary-dark)] hover:shadow-[0_16px_36px_rgba(234,88,12,0.2)]"
              href="#contact"
            >
              Get My Free Proposal
            </Link>
            <p className="mt-3 text-sm font-medium text-slate-500">
              Free proposal. No pressure.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-slate-200 bg-[var(--surface)] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <p className="section-label">Free proposal</p>
            <h2 className="section-heading mt-4 max-w-[700px]">
              Tell us about your business. We&apos;ll send a plan and price in 24 hours.
            </h2>
            <p className="section-copy mt-5 max-w-[700px]">
              No pressure, no fluff, just a clear website strategy and fixed quote.
            </p>

            <div className="mt-8 rounded-[1.4rem] border border-[var(--border)] bg-white px-5 py-4">
              <p className="text-sm font-medium text-slate-700">
                Takes less than 2 minutes. We reply within 24 hours.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {valueBullets.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--trust)]" />
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--trust)]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <section id="faq" className="border-t border-slate-200 px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="max-w-[700px]">
            <p className="section-label">FAQ</p>
            <h2 className="section-heading mt-4">
              The questions people ask before they decide.
            </h2>
            <p className="section-copy mt-5">
              The goal is to make the next step feel easy, clear, and low-risk.
            </p>
          </div>

          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section className="border-t border-slate-200 px-5 py-20 text-center sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[700px]">
          <h2 className="mx-auto text-4xl font-black leading-[1.15] tracking-[-0.04em] text-balance text-[var(--trust)] sm:text-5xl lg:text-6xl">
            Stop sending customers to a website that doesn&apos;t work.
          </h2>
          <p className="section-copy mx-auto mt-5">
            Get a custom site that looks sharp and actually brings in leads.
          </p>
          <Link
            className="mt-10 inline-flex rounded-full bg-[var(--primary)] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_32px_rgba(249,115,22,0.18)] transition hover:bg-[var(--primary-dark)] hover:shadow-[0_16px_36px_rgba(234,88,12,0.2)]"
            href="#contact"
          >
            Get My Free Proposal
          </Link>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Free proposal. No pressure.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Logo compact />
          <nav className="flex flex-wrap gap-6 text-sm text-slate-500">
            <Link className="transition hover:text-slate-950" href="#services">
              Services
            </Link>
            <Link className="transition hover:text-slate-950" href="#process">
              How It Works
            </Link>
            <Link className="transition hover:text-slate-950" href="#faq">
              FAQ
            </Link>
            <Link className="transition hover:text-slate-950" href="#contact">
              Free Proposal
            </Link>
          </nav>
          <div className="text-sm text-slate-500 md:text-right">
            <p>Business inbox coming soon</p>
            <p className="mt-1">© 2026 Clearview Digital</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
