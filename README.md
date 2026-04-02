# Clearview Digital

Repo should deploy from the `Clearview-Digital/` root on Vercel. Keep `main` clean and never commit secrets.

This project is a Next.js app for Clearview Digital with two surfaces:

- Public marketing site at `/`
- Internal operations manager behind the secret `/internal/<MANAGER_ACCESS_TOKEN>` entry flow

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Minimal client components for the FAQ accordion and contact form

## Local Development

Use Node.js 22 LTS or newer.

Install dependencies if needed:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment To Vercel

1. Push this project to GitHub.
2. Import the repository into [Vercel](https://vercel.com/new).
3. Point Vercel at the `Clearview-Digital` root, not the duplicate `clearview-site/` folder.
4. Accept the default Next.js settings.
5. Add environment variables before or immediately after the first deploy:
   - `MANAGER_ACCESS_TOKEN` for the secret manager entry URL
   - `MANAGER_AGENT_SECRET` if you need the agent API
   - Either Redis REST credentials (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_URL` + `KV_REST_API_TOKEN`) or a TCP `REDIS_URL`
6. Redeploy after env var changes.

If Vercel shows env vars scoped to `All Environments`, that already covers Production, Preview, and Development.

## Project Structure

- `app/layout.tsx`: site metadata and root layout
- `app/page.tsx`: landing page composition
- `app/internal/page.tsx`: live manager help page
- `app/internal/[token]/page.tsx`: secret manager entry point
- `app/api/manager/route.ts`: browser manager API
- `app/api/manager/agent/route.ts`: bearer-auth agent API
- `proxy.ts`: manager route protection and cookie gate
- `components/landing/data.ts`: page content arrays
- `components/landing/logo.tsx`: reusable Clearview logo mark
- `components/landing/contact-form.tsx`: client-side inquiry form
- `components/landing/faq-accordion.tsx`: client-side FAQ accordion
- `components/manager/manager-dashboard.tsx`: internal operations dashboard
- `lib/manager/persist.ts`: Redis/file persistence fallback

## Manager Access

- With `MANAGER_ACCESS_TOKEN` configured:
  - `/manager` returns `404`
  - `/internal` shows a short help page
  - `/internal/<MANAGER_ACCESS_TOKEN>` opens the dashboard and sets the session cookie used by `/api/manager`
- Without `MANAGER_ACCESS_TOKEN` configured, local development can use `/manager`

See [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md) for the live verification sequence.

## Current Contact Form Behavior

The public contact form is still placeholder-only and does not submit anywhere yet.

## TODO

- Connect the contact form to the future business email or a production form handler
- Add auth and the client dashboard
- Add Stripe billing/subscriptions
- Add Supabase or another database/auth backend
- Add analytics integrations such as Vercel Analytics, GA4, or Meta Pixel
- Add real brand assets if a final logo/image set becomes available
