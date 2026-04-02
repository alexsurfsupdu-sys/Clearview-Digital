# Deployment Verification

Use this checklist after a Vercel deploy of `Clearview-Digital`.

## Preconditions

- Deploy source is the GitHub repo `alexsurfsupdu-sys/Clearview-Digital`
- Vercel project root points at `Clearview-Digital/`
- `MANAGER_ACCESS_TOKEN` is set to a 16+ character secret
- Redis is configured with either:
  - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  - `KV_REST_API_URL` + `KV_REST_API_TOKEN`
  - `REDIS_URL` using `redis://` or `rediss://`

## Local Release Candidate

Run from the repo root:

```bash
npm ci
npm run build
```

Expected build output includes:

- `/api/manager`
- `/api/manager/agent`
- `/internal`
- `/internal/[token]`
- `/manager`

The current Turbopack NFT warning from `next.config.ts` is non-blocking if the build completes successfully.

## Live Verification Order

Use the same deployment host for every step.

1. Open `/internal`
   - Expected: help page renders
2. Open `/manager`
   - Expected: `404` when `MANAGER_ACCESS_TOKEN` is configured
3. Open `/internal/<MANAGER_ACCESS_TOKEN>`
   - Expected: dashboard renders
   - Expected: browser receives the `cv_mgr_v1` cookie
4. In the same browser session, request `GET /api/manager`
   - Expected: `200`
   - Expected: JSON contains `_meta.publicOrigin` matching the current host
   - Expected: JSON contains `_meta.store: "redis"`
5. If `MANAGER_AGENT_SECRET` is configured, call `POST /api/manager/agent`
   - Header: `Authorization: Bearer <MANAGER_AGENT_SECRET>`
   - Body: `{ "action": "get_state" }`
   - Expected: `200` with `{ "ok": true, "state": ... }`

## Failure Meanings

- `404` on `/internal/<token>`
  - Wrong token, bad URL encoding, or stale deployment
- `401` on `/api/manager`
  - Secret URL was not opened in that browser session, so the manager cookie is missing
- `_meta.store: "file"` on Vercel
  - Redis env vars are missing, invalid, scoped wrong, or the deployment does not contain the current `persist.ts`
- TCP Redis connect/TLS failures
  - Prefer switching the Vercel project to REST-style Upstash credentials

## Recovery Defaults

If the live deployment keeps reporting `_meta.store: "file"` after a redeploy with the current code:

1. Re-check env vars on the Vercel project
2. Re-check the deployment is built from `Clearview-Digital/`
3. Switch from TCP `REDIS_URL` to REST-style Upstash env vars

## Operator Handoff

- Live manager URL: `https://<deployment-host>/internal/<MANAGER_ACCESS_TOKEN>`
- If API calls return `401`, open the secret URL once in that same browser
- Local development without a token uses `http://localhost:3000/manager`
