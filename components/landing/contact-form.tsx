"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const initialState = {
  name: "",
  email: "",
  business: "",
  phone: "",
  budget: "",
  website: "",
  description: "",
};

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Honeypot field ref (must stay empty — bots fill it)
  const honeypotRef = useRef<HTMLInputElement>(null);
  // Track when the form was rendered (bot timing check)
  const loadedAtRef = useRef<number>(0);

  useEffect(() => {
    loadedAtRef.current = Date.now();
  }, []);

  const canSubmit = useMemo(
    () => Boolean(form.name && form.email && form.business && form.description),
    [form],
  );

  function updateField(name: keyof typeof initialState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    if (status === "error") setStatus("idle");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || status === "loading") return;

    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          _hp: honeypotRef.current?.value ?? "", // honeypot
          _t: loadedAtRef.current,               // load timestamp
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setForm(initialState);
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[1.75rem] border border-[var(--border)] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-2xl">✓</span>
          </div>
          <h3 className="text-xl font-bold text-[var(--trust)]">Request received!</h3>
          <p className="mt-2 max-w-xs text-sm leading-7 text-slate-600">
            We&apos;ll review your project and send a clear plan and price within 24 hours.
          </p>
          <button
            className="mt-6 text-sm font-medium text-[var(--trust)] underline underline-offset-4 hover:opacity-70"
            onClick={() => setStatus("idle")}
            type="button"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
          Project details
        </p>

        {/* Honeypot — invisible to humans, bots fill it */}
        <input
          ref={honeypotRef}
          aria-hidden="true"
          autoComplete="off"
          name="_hp"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
          tabIndex={-1}
          type="text"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <InputField
            label="Full Name"
            name="name"
            onChange={updateField}
            required
            value={form.name}
          />
          <InputField
            label="Email"
            name="email"
            onChange={updateField}
            required
            type="email"
            value={form.email}
          />
          <InputField
            label="Business Name"
            name="business"
            onChange={updateField}
            required
            value={form.business}
          />
          <InputField
            label="Phone (optional)"
            name="phone"
            onChange={updateField}
            value={form.phone}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="sr-only">Estimated budget</span>
            <select
              className="form-control"
              onChange={(event) => updateField("budget", event.target.value)}
              value={form.budget}
            >
              <option value="">Estimated Budget (optional)</option>
              <option value="Under $500">Under $500</option>
              <option value="$500 – $1,000">$500 – $1,000</option>
              <option value="$1,000 – $3,000">$1,000 – $3,000</option>
              <option value="$3,000+">$3,000+</option>
              <option value="Not sure yet">Not sure yet</option>
            </select>
          </label>

          <InputField
            label="Website (optional)"
            name="website"
            onChange={updateField}
            type="url"
            value={form.website}
          />
        </div>

        <label className="block">
          <span className="sr-only">Project details</span>
          <textarea
            className="form-control min-h-36 resize-y"
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Project Details"
            required
            value={form.description}
          />
        </label>

        {status === "error" && errorMsg && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </p>
        )}

        <button
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-6 py-4 text-base font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.22)] transition hover:bg-[var(--primary-dark)] hover:shadow-[0_14px_32px_rgba(234,88,12,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canSubmit || status === "loading"}
          type="submit"
        >
          {status === "loading" ? "Sending…" : "Get My Free Proposal →"}
        </button>

        <p className="text-center text-xs leading-6 text-slate-500">
          No spam. No pressure. Just a clear plan.
        </p>
      </form>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  name: keyof typeof initialState;
  onChange: (name: keyof typeof initialState, value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
};

function InputField({
  label,
  name,
  onChange,
  required = false,
  type = "text",
  value,
}: InputFieldProps) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <input
        className="form-control"
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={label}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}
