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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_20%_25%,rgba(37,99,235,0.18),transparent_30%)]" />

      <header className="sticky top-0 z-50 border-b border-white/6 bg-[rgba(8,12,26,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-white/55 md:flex">
            <Link className="transition hover:text-white" href="#services">
              Services
            </Link>
            <Link className="transition hover:text-white" href="#process">
              How It Works
            </Link>
            <Link className="transition hover:text-white" href="#faq">
              FAQ
            </Link>
            <Link
              className="rounded-full bg-[var(--primary)] px-5 py-2.5 font-semibold text-white shadow-[0_0_40px_rgba(37,99,235,0.35)] transition hover:bg-[var(--primary-dark)]"
              href="#contact"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 pb-24 pt-18 sm:px-8 sm:pt-24 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20 lg:px-10 lg:pb-32 lg:pt-28">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/25 bg-[var(--primary)]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            Custom Websites & Monthly Management
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.06em] text-balance sm:text-6xl lg:text-7xl">
            Your Business Deserves
            <span className="mt-2 block bg-[linear-gradient(95deg,#38bdf8_0%,#2563ff_100%)] bg-clip-text text-transparent">
              a Website That Actually Converts.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">
            We design and build fully custom websites for small businesses and
            growing brands, then manage and optimize them every month so you
            never have to worry about it again.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/38 sm:text-base">
            No templates. No page builders. No disappearing after launch. Just a
            dedicated team that treats your website like a real business asset.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              className="rounded-full bg-[var(--primary)] px-7 py-4 text-base font-semibold text-white shadow-[0_0_55px_rgba(37,99,235,0.35)] transition hover:bg-[var(--primary-dark)]"
              href="#contact"
            >
              Get Your Free Proposal
            </Link>
            <Link
              className="border-b border-white/15 pb-0.5 text-sm font-medium text-white/55 transition hover:border-white/45 hover:text-white"
              href="#services"
            >
              See what we build
            </Link>
          </div>

          <div className="mt-14 grid gap-8 border-t border-white/8 pt-10 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-extrabold tracking-[-0.04em] text-[var(--accent)]">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-white/35">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.16)_0%,transparent_70%)] blur-xl" />
          <div className="relative rounded-[1.75rem] border border-white/8 bg-white/3 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.25)] sm:p-9">
            <div className="mb-5 rounded-2xl border border-[var(--primary)]/25 bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(56,189,248,0.08))] p-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                What You Get
              </p>
              <h2 className="text-xl font-extrabold leading-tight text-white">
                A website built for growth and a team that keeps it that way.
              </h2>
              <p className="mt-2 text-sm leading-7 text-white/48">
                One-time build plus an optional monthly plan to keep your site
                fast, fresh, and converting.
              </p>
            </div>

            <div className="space-y-2">
              {valueItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/6 bg-white/4 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--accent)]" />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs leading-6 text-white/38">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="border-t border-white/6 px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-18">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-label">What we do</p>
            <h2 className="section-heading mt-4 max-w-xl">
              Everything your website needs, built and managed under one roof.
            </h2>
            <p className="section-copy mt-5 max-w-lg">
              We handle the full lifecycle: design, build, launch, and ongoing
              care, so you can focus on running your business.
            </p>
            <Link className="secondary-link mt-8 inline-flex" href="#contact">
              Get a free proposal
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {serviceCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[1.35rem] border border-white/7 bg-white/[0.025] p-7 transition duration-200 hover:border-[var(--primary)]/35 hover:bg-[var(--primary)]/6"
              >
                <span className="mb-4 block h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                <h3 className="text-base font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/42">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="process"
        className="border-t border-white/6 bg-white/[0.015] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <p className="section-label">How it works</p>
          <h2 className="section-heading mt-4 max-w-3xl">
            From first conversation to ongoing growth.
          </h2>
          <p className="section-copy mt-4 max-w-2xl">
            A simple, transparent process designed to get you live fast and keep
            your site performing long after launch.
          </p>

          <div className="mt-14 grid gap-8 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <article key={step.number} className="relative">
                {index < processSteps.length - 1 ? (
                  <span className="pointer-events-none absolute left-[4.5rem] top-8 hidden h-px w-[calc(100%-3rem)] bg-[linear-gradient(90deg,rgba(37,99,235,0.45),rgba(37,99,235,0.05))] lg:block" />
                ) : null}
                <p className="text-5xl font-black leading-none tracking-[-0.08em] text-[rgba(37,99,235,0.22)]">
                  {step.number}
                </p>
                <h3 className="mt-5 text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/42">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/6 px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="section-label">Why clients choose us</p>
          <h2 className="section-heading mt-4 max-w-3xl">
            Built for businesses that want results, not just a pretty site.
          </h2>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-[1.45rem] border border-white/8 bg-white/[0.025] p-8"
              >
                <div className="mb-5 flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} className="text-[var(--accent)]">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-[15px] leading-8 text-white/62">
                  “{item.quote}”
                </p>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-white/35">{item.role}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {credibilityPills.map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-[var(--primary)]/16 bg-[var(--primary)]/7 px-5 py-6"
              >
                <h3 className="text-sm font-semibold text-white">
                  {item.label}
                </h3>
                <p className="mt-2 text-xs leading-6 text-white/38">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="border-t border-white/6 px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.2fr] lg:gap-18">
          <div>
            <p className="section-label">Start a project</p>
            <h2 className="section-heading mt-4 max-w-xl">
              Let&apos;s build something that works for you.
            </h2>
            <p className="section-copy mt-5 max-w-lg">
              Tell us about your business. We&apos;ll come back within 24 hours
              with a clear strategy, timeline, and fixed-price quote with no
              pressure and no fluff.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 text-sm text-white/55">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                ✦
              </span>
              Business inbox coming soon
            </div>

            <div className="mt-10 space-y-5">
              {valueBullets.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-white/38">
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

      <section
        id="faq"
        className="border-t border-white/6 px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.4fr] lg:gap-18">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-label">FAQ</p>
            <h2 className="section-heading mt-4 max-w-lg">
              Questions we get all the time.
            </h2>
            <p className="section-copy mt-5 max-w-md">
              Everything you need to know before getting started. Don&apos;t see
              your question? Reach out and we&apos;ll answer it personally.
            </p>
            <Link className="secondary-link mt-8 inline-flex" href="#contact">
              Ask us anything
            </Link>
          </div>

          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section className="border-t border-white/6 px-5 py-20 text-center sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="section-label justify-center">Ready when you are</p>
          <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight tracking-[-0.06em] text-balance sm:text-5xl lg:text-6xl">
            Stop losing customers to a website that doesn&apos;t do its job.
          </h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            Tell us about your business. We&apos;ll handle the rest: design,
            build, launch, and the support that comes after.
          </p>
          <Link
            className="mt-10 inline-flex rounded-full bg-[var(--primary)] px-8 py-4 text-base font-semibold text-white shadow-[0_0_55px_rgba(37,99,235,0.35)] transition hover:bg-[var(--primary-dark)]"
            href="#contact"
          >
            Get Your Free Proposal
          </Link>
          <p className="mt-5 text-sm text-white/22">
            No contracts. No commitments. Just results.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/6 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Logo compact />
          <nav className="flex flex-wrap gap-6 text-sm text-white/35">
            <Link className="transition hover:text-white/70" href="#services">
              Services
            </Link>
            <Link className="transition hover:text-white/70" href="#process">
              How It Works
            </Link>
            <Link className="transition hover:text-white/70" href="#faq">
              FAQ
            </Link>
            <Link className="transition hover:text-white/70" href="#contact">
              Contact
            </Link>
          </nav>
          <div className="text-sm text-white/30 md:text-right">
            <p>Business inbox coming soon</p>
            <p className="mt-1">© 2026 Clearview Digital</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
