"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManagerLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/manager/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed. Check your credentials.");
        return;
      }
      router.push("/manager/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--trust)]">
              Clearview Digital
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--trust)]">
            Manager login
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in to access your control center.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-7 shadow-[0_16px_48px_rgba(15,23,42,0.07)]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold text-slate-600"
                htmlFor="username"
              >
                Username
              </label>
              <input
                autoComplete="username"
                className="form-control"
                id="username"
                placeholder="Your username"
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold text-slate-600"
                htmlFor="password"
              >
                Password
              </label>
              <input
                autoComplete="current-password"
                className="form-control"
                id="password"
                placeholder="Your password"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              className="w-full rounded-full bg-[var(--primary)] py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.2)] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || !username || !password}
              type="submit"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Clearview Digital — Internal only
        </p>
      </div>
    </main>
  );
}
