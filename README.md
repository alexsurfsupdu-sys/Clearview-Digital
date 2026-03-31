# Clearview Digital Landing Page

Repo will be connected to Vercel; prefer a clean main branch and no secrets in the repo.

This project is a Next.js rebuild of the published Base44 landing page for Clearview Digital. The Base44 export was used as the visual and copy reference, but the shipped app does not depend on Base44 at runtime.

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
3. Accept the default Next.js settings.
4. Deploy.

No environment variables are required for the current landing-page-only version.

## Project Structure

- `app/layout.tsx`: site metadata and root layout
- `app/page.tsx`: landing page composition
- `components/landing/data.ts`: page content arrays
- `components/landing/logo.tsx`: reusable Clearview logo mark
- `components/landing/contact-form.tsx`: client-side inquiry form
- `components/landing/faq-accordion.tsx`: client-side FAQ accordion

## Current Contact Form Behavior

The form is currently in placeholder mode and does not send submissions anywhere yet. This keeps personal email addresses out of the project until the business inbox is ready.

## TODO

- Connect the contact form to the future business email or a production form handler
- Add auth and the client dashboard
- Add Stripe billing/subscriptions
- Add Supabase or another database/auth backend
- Add analytics integrations such as Vercel Analytics, GA4, or Meta Pixel
- Add real brand assets if a final logo/image set becomes available
