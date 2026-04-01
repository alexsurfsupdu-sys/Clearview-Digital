# Handoff: Clearview Digital — internal manager + Vercel + Redis

**Give this whole file to Codex.** The human operator is a beginner, burned out on dashboard clicks, and should not be asked to guess what “Upstash” vs “Redis” means without you doing the verification yourself (Vercel API / MCP / CLI with their auth).

---

## 1. Repos and deploy

| Item | Value |
|------|--------|
| **GitHub repo** | `https://github.com/alexsurfsupdu-sys/Clearview-Digital` |
| **Local copy (Cursor workspace)** | `Clearview-Digital/` inside “New project” folder |
| **Duplicate / staging app** | `clearview-site/` in same workspace — same ideas, **Vercel should track `Clearview-Digital` only** unless they wired something else |
| **Framework** | Next.js **16.2.x**, App Router |
| **Edge note** | Manager API uses **`runtime = "nodejs"`** — Redis TCP is intentional for `REDIS_URL`. |

---

## 2. What we built (product behavior)

- **Public marketing site** at `/`.
- **Internal operations dashboard** (“manager”): tasks, clients, leads, homepage audit vs baseline, specialists, etc.
- **Not linked** from the marketing site.
- **Persistence:** `GET` / `PUT` **`/api/manager`** — JSON state, version `1`.
- **Secret entry when `MANAGER_ACCESS_TOKEN` is set (16+ chars):**
  - **`/manager` → 404** (hidden).
  - **`/internal/<exact token>`** loads the dashboard and sets an **HttpOnly** cookie (`cv_mgr_v1`) proving the browser opened the secret URL.
  - **`/internal`** (no token) shows a short help page.
  - **`/api/manager`** (not the agent route) requires that cookie when protection is on.
- **Agent hook:** `POST /api/manager/agent` with `Authorization: Bearer <MANAGER_AGENT_SECRET>` — bypasses cookie; actions `get_state`, `put_state`.

**Key files**

- `proxy.ts` — Next 16 “proxy” (middleware replacement): matcher for `/manager`, `/internal`, `/api/manager`; token trim + `decodeURIComponent` on path segment; cookie set on valid `/internal/<token>`.
- `app/internal/page.tsx`, `app/internal/[token]/page.tsx`
- `app/manager/page.tsx` — dashboard only when protection **off** (local dev).
- `app/api/manager/route.ts`, `app/api/manager/agent/route.ts`
- `lib/manager/persist.ts`, `state.ts`, `types.ts`, `manager-proof.ts`
- `components/manager/manager-dashboard.tsx`

---

## 3. Environment variables (intended)

| Variable | Role |
|----------|------|
| `MANAGER_ACCESS_TOKEN` | 16+ random chars; URL segment after `/internal/`. **Not** the Redis token. |
| `MANAGER_AGENT_SECRET` | Optional; 16+ for `/api/manager/agent` Bearer auth. |
| **Redis (any one working path):** | |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Upstash **REST** (HTTPS URL + token). `@upstash/redis`. |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Alternate REST-style names (supported in code). |
| `REDIS_URL` | Vercel **Redis** integration often injects **`redis://` or `rediss://` only**. Code now uses the **`redis`** npm package for TCP when REST creds are absent. |
| `REDIS_TOKEN` | Only used when `REDIS_URL` is **https** (REST pair); ignore if URL is `redis://`. |

**Do not put real secrets in this file.**

---

## 4. What the human said their Vercel shows

- **`REDIS_URL`** — type “Redis”, scope **“All Environments”**.
- **`MANAGER_ACCESS_TOKEN`** — present.
- They **do not** see separate “turn Preview on” toggles where they looked; they were confusing **Git branch “Environments”** with **per-variable environment scope**. Clarify in-product: **Settings → Environment Variables → edit each variable** for scope, or rely on **“All Environments”** (covers Preview + Production + Development).

---

## 5. Bugs / confusion we already hit

1. **404 on `/internal`** — first deploy was from GitHub **without** those routes; fixed by merging `clearview-site`-style code into `Clearview-Digital` and pushing.
2. **Wrong token type** — user pasted Redis/Upstash tokens vs `MANAGER_ACCESS_TOKEN`; `/internal/` must match **only** `MANAGER_ACCESS_TOKEN`.
3. **Preview URL vs env** — “All Environments” should include Preview; if something was Production-only, preview would break (less likely now).
4. **“Production data will not persist” banner** — `_meta.store === "file"` because app did not detect Redis. Common cause: **only `REDIS_URL` (TCP)** existed; older code only supported **HTTPS REST** env pairs. **Fix in code:** `lib/manager/persist.ts` now tries REST first, then **`REDIS_URL` TCP** via `redis` package. Dependency: `"redis": "^5.0.0"`.

---

## 6. Git state you should confirm after pulling

- Latest commits on `main` should include manager + proxy + internal routes + env fallbacks.
- **Local-only risk:** If `persist.ts` / `package.json` / `package-lock.json` changes exist that are **not pushed**, run `git status`, commit, push, then redeploy Vercel.

**Suggested Codex checklist**

1. `git pull` on `Clearview-Digital`, ensure `npm ci && npm run build` pass.
2. Push any missing commits; trigger **Redeploy** on Vercel (or wait for auto deploy).
3. With Vercel/Upstash access: open project env vars, confirm **`REDIS_URL`** exists and matches integration (no accidental typo). Do **not** ask the user to “find Upstash” unless integration is missing.
4. Hit **`/api/manager`** on the **same host** as the dashboard (with cookie if protection on): JSON should include `_meta.store: "redis"` when working.
5. If TCP Redis fails on Vercel (timeouts, TLS): consider switching that project to **REST** vars from Upstash console instead of TCP `REDIS_URL`, or document the error.

---

## 7. What Cursor / ChatGPT cannot do

- Cannot log into Vercel, Upstash, or GitHub as the user.
- Cannot run authenticated `vercel` CLI without the user’s session.

**Codex** may have **Vercel MCP or similar** — if so, use it and **stop asking the human to click through** except for one-time OAuth if required.

---

## 8. Human-facing one-liner (after you fix infra)

- Open: `https://<their-deployment-host>/internal/<MANAGER_ACCESS_TOKEN>`  
- If they see 401 on API: open the secret URL once in that browser (cookie).  
- Local dev without token: `http://localhost:3000/manager`.

---

## 9. Optional cleanup

- Delete stray **`.codex.bak-merge/`** in repo if still present (leftover from a merge).
- `.env*` is gitignored; use `.env.example` pattern in docs only if you add one (currently may be ignored by `.gitignore` — check).

---

*Generated for handoff from Cursor; keep this file updated if behavior or env contract changes.*
