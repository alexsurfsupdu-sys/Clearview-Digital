"use client";

import { useMemo, useState } from "react";

const initialState = {
  name: "",
  email: "",
  phone: "",
  business: "",
  website: "",
  budget: "",
  description: "",
};

export function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(
      form.name &&
        form.email &&
        form.business &&
        form.budget &&
        form.description,
    );
  }, [form]);

  function updateField(name: keyof typeof initialState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="rounded-[1.75rem] border border-white/8 bg-white/3 p-6 shadow-[0_24px_120px_rgba(0,0,0,0.22)] sm:p-8 lg:p-10">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/30">
          Project details
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <InputField
            label="Full Name"
            name="name"
            onChange={updateField}
            required
            value={form.name}
          />
          <InputField
            label="Email Address"
            name="email"
            onChange={updateField}
            required
            type="email"
            value={form.email}
          />
          <InputField
            label="Phone Number"
            name="phone"
            onChange={updateField}
            value={form.phone}
          />
          <InputField
            label="Business Name"
            name="business"
            onChange={updateField}
            required
            value={form.business}
          />
        </div>

        <InputField
          label="Current website (if you have one)"
          name="website"
          onChange={updateField}
          type="url"
          value={form.website}
        />

        <label className="block">
          <span className="sr-only">Estimated budget</span>
          <select
            className="form-control"
            onChange={(event) => updateField("budget", event.target.value)}
            required
            value={form.budget}
          >
            <option value="">Estimated Budget</option>
            <option value="under500">Under $500</option>
            <option value="500-1000">$500 - $1,000</option>
            <option value="1000-3000">$1,000 - $3,000</option>
            <option value="3000+">$3,000+</option>
            <option value="notsure">Not sure yet</option>
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Project details</span>
          <textarea
            className="form-control min-h-36 resize-y"
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Tell us about your project — what you need, your goal, and who your customers are."
            required
            value={form.description}
          />
        </label>

        <button
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-6 py-4 text-base font-semibold text-white shadow-[0_0_45px_rgba(37,99,235,0.35)] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canSubmit}
          type="submit"
        >
          Get My Free Proposal →
        </button>

        <p className="text-center text-xs leading-6 text-white/28">
          Contact routing is intentionally disconnected for now. We&apos;ll wire
          this form to the business inbox once your official company email is
          ready.
        </p>

        {submitted ? (
          <p className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/8 px-4 py-3 text-sm leading-6 text-white/70">
            Form submission is in placeholder mode right now. When you set up
            the business email, we can connect this to a real inbox or form
            service.
          </p>
        ) : null}
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
