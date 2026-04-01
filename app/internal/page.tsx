import { headers } from "next/headers";

/**
 * Shown at /internal (no token segment). Helps fix “404 / wrong token” confusion.
 */
export default async function InternalHelpPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : "(your deployment URL)";
  const raw = process.env.MANAGER_ACCESS_TOKEN ?? "";
  const secret = raw.trim();
  const configured = secret.length >= 16;

  return (
    <div className="min-h-screen bg-[#fbfbf9] px-4 py-12 text-[#132238]">
      <div className="mx-auto max-w-xl rounded-2xl border border-[#dbe2ea] bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Clearview · Manager
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">How to open the live manager</h1>

        {!configured ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            <strong>MANAGER_ACCESS_TOKEN</strong> is not set on this deployment (or is shorter than 16
            characters). Add it under Vercel → Project → Settings → Environment Variables, then{" "}
            <strong>redeploy</strong>. Use a long random string — not your Redis/Upstash token.
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              The path after <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/internal/</code>{" "}
              must be <strong>exactly</strong> the same as{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">MANAGER_ACCESS_TOKEN</code> in
              Vercel — same deployment (Production vs Preview), no extra spaces, no quotes.
            </p>
            <p className="mt-4 text-sm font-medium text-slate-800">Bookmark this shape:</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
              {base}/internal/&lt;paste MANAGER_ACCESS_TOKEN here&gt;
            </pre>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              <strong className="text-rose-800">Wrong tokens:</strong>{" "}
              <code className="text-xs">UPSTASH_REDIS_REST_TOKEN</code>,{" "}
              <code className="text-xs">VERCEL_TOKEN</code>, GitHub tokens — those do{" "}
              <em>not</em> go in the URL. Only <code className="text-xs">MANAGER_ACCESS_TOKEN</code>.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              If you changed the env var, <strong>redeploy</strong>. If this URL is a{" "}
              <strong>Preview</strong> deployment, add <code className="text-xs">MANAGER_ACCESS_TOKEN</code>{" "}
              for the <strong>Preview</strong> environment too (or use your Production domain).
            </p>
          </>
        )}

        <p className="mt-8 text-xs text-slate-500">
          Local dev without <code className="rounded bg-slate-100 px-1">MANAGER_ACCESS_TOKEN</code>: use{" "}
          <code className="rounded bg-slate-100 px-1">/manager</code>.
        </p>
      </div>
    </div>
  );
}
