# Handoff: Clearview Digital — live manager, Vercel, Redis

**Give this whole file to Claude.** The project is already live, the internal manager is reachable, and Redis persistence is working in production. The next step is not “make it deploy” — that part is already done. The next step is to help the user make it feel “fully functional” based on what they still want added or wired up.

---

## 1. Source of truth

Use this repo/folder as the real project:

- `/Users/aleksandr/Documents/New project/Clearview-Digital`

There is also a duplicate/staging-style folder:

- `/Users/aleksandr/Documents/New project/clearview-site`

Treat `Clearview-Digital` as the source of truth. Do not use `clearview-site` unless you are explicitly comparing older/staging code.

---

## 2. Current live deployment

Production is live at:

- `https://clearview-digital-zu7h.vercel.app`

The internal manager is live behind the secret route:

- `https://clearview-digital-zu7h.vercel.app/internal/<MANAGER_ACCESS_TOKEN>`

The user confirmed they can open the manager on the live site.

---

## 3. What is already working

- Public marketing site at `/`
- Internal manager dashboard
- Secret manager route flow:
  - `/manager` is hidden in production when `MANAGER_ACCESS_TOKEN` is set
  - `/internal` shows a help page
  - `/internal/<MANAGER_ACCESS_TOKEN>` opens the dashboard
  - opening the secret URL sets the `cv_mgr_v1` HttpOnly cookie
- `GET /api/manager` works
- `PUT /api/manager` works
- Production persistence is now using Redis, not file fallback

Verified live behavior:

- secret manager URL returned `200`
- it set the `cv_mgr_v1` cookie
- `/manager` returned `404` in production
- `/api/manager` returned `200`
- live `_meta.store` returned `"redis"`
- live `_meta.publicOrigin` returned `"https://clearview-digital-zu7h.vercel.app"`

---

## 4. Vercel status

Vercel project:

- `clearview-digital-zu7h`

Confirmed environment variables on Vercel:

- `MANAGER_ACCESS_TOKEN`
- `REDIS_URL`

Not currently configured:

- `MANAGER_AGENT_SECRET`

Important history:

- Production had been on an older commit and was still falling back to file storage.
- That was fixed by deploying the current `main`.
- Production now reports Redis correctly.

---

## 5. Important recent deploy/debug result

This was the key issue that got resolved:

- the production deployment was still on commit `d49dfc7`
- the Redis TCP fallback fix was in commit `b34a116`
- once current `main` was deployed, live production switched from `_meta.store: "file"` to `_meta.store: "redis"`

Key commit:

- `b34a116` — `Add CODEX handoff doc; support Vercel REDIS_URL (TCP) for manager state`

---

## 6. Key files

Core manager/auth/persistence files:

- `proxy.ts`
- `app/api/manager/route.ts`
- `app/api/manager/agent/route.ts`
- `app/internal/page.tsx`
- `app/internal/[token]/page.tsx`
- `app/manager/page.tsx`
- `lib/manager/persist.ts`
- `lib/manager/state.ts`
- `lib/manager/types.ts`
- `lib/manager/manager-proof.ts`
- `components/manager/manager-dashboard.tsx`

Docs/context:

- `CODEX_HANDOFF.md`
- `DEPLOYMENT_VERIFICATION.md`
- `README.md`
- `CLAUDE_HANDOFF.md` (this file)

Vercel link:

- `.vercel/project.json`

---

## 7. Changes made in the last Codex session

These repo-side changes were made:

- updated `README.md` so it reflects the real manager + Vercel + Redis setup instead of an old landing-page-only description
- added `DEPLOYMENT_VERIFICATION.md`
- fixed stale wording in `components/manager/manager-dashboard.tsx`
  - it previously told the user to run from the wrong folder name
- changed package metadata from `clearview-site` to `clearview-digital`
  - `package.json`
  - `package-lock.json`
- removed stray `.codex.bak-merge/`

These infra-side actions were also completed:

- linked the local repo to the correct Vercel project
- inspected env vars
- verified the protected deployment with authenticated `vercel` CLI access
- redeployed production so current `main` is live

---

## 8. What is probably still unfinished

The manager is live and usable, but “fully functional” probably still needs one or more of these:

1. `MANAGER_AGENT_SECRET` has not been set
   - so `/api/manager/agent` is not active yet for bearer-auth agent calls
2. the public contact form is still placeholder-only
3. the user may want more manager actions/features beyond the current dashboard
4. some CRUD/user-flow testing may still need to be done manually in the live UI

Do not assume “fully functional” means only one thing. Help the user narrow it down, but avoid making them do unnecessary setup themselves if you can verify it directly.

---

## 9. Recommended next steps for Claude

If continuing immediately, do this:

1. Confirm what the user means by “fully functional”
   - likely meanings:
     - enable manager agent API
     - wire the contact form
     - test/add missing manager workflows
2. If agent API is wanted:
   - add `MANAGER_AGENT_SECRET` in Vercel
   - verify `POST /api/manager/agent`
3. If contact form is wanted:
   - inspect current placeholder implementation
   - wire it to a real submission path
4. If manager completeness is wanted:
   - test the current live flows
   - identify concrete missing actions/states
   - implement only what is actually missing

---

## 10. Commands that worked

From repo root:

```bash
cd "/Users/aleksandr/Documents/New project/Clearview-Digital"
npx vercel whoami
npx vercel inspect https://clearview-digital-zu7h.vercel.app
npx vercel env ls
```

The `vercel` CLI is available through `npx` and the user authenticated it successfully during the previous session.

For protected deployment verification, authenticated `vercel curl` worked.

---

## 11. User context

The user is not deeply technical and gets overwhelmed by ambiguous platform/setup instructions. They do much better when the agent verifies things directly and then explains plainly what is true.

Avoid sending them on vague Vercel hunts like “go find Upstash” or “check a few dashboard settings” if you can directly inspect the deployment yourself.

---

## 12. Bottom line

Clearview Digital production is live.

The manager works.

Redis persistence works in production.

The next job is not deployment rescue. The next job is to define and implement what “fully functional” should mean for this user.
