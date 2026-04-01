# Clearview Digital Project Context

## What This Project Is

This is the real production codebase for Clearview Digital's public-facing marketing site.

The original visual draft was created in Base44, but this repo is now the actual implementation:
- Next.js
- App Router
- deployed on Vercel

This project is no longer meant to depend on Base44 at runtime.

## Current Priorities

### Done
- Landing page rebuilt into real Next.js code
- Site deployed on Vercel
- Visual system cleaned up to a lighter, cleaner, more premium style
- Stronger conversion-focused CTA flow
- Vercel Analytics installed
- `/manager` route exists as a separate internal workspace foundation

### Current Focus
- Preserve and iterate on the landing page only carefully
- Build out `/manager` in Cursor
- Keep landing page stable while expanding internal tools

## Core Business Model

Clearview Digital sells:
- custom websites
- landing pages
- monthly website management

Future direction may include:
- application development
- client portal
- co-admin dashboard
- hosted monthly website management platform

But right now, the main production priority is:
- public landing page that converts

## Main Conversion Goal

The site is optimized around one primary action:

`Get My Free Proposal`

Do not dilute this with multiple competing primary actions unless there is a strong reason.

## Landing Page Rules

The landing page should feel:
- premium
- calm
- modern
- trustworthy
- conversion-focused

Avoid:
- loud or overly colorful sections
- heavy text blocks
- multiple conflicting CTA styles
- generic SaaS-looking visual clutter

### Visual System Rules
- light / off-white backgrounds
- deep navy / charcoal for headings and trust
- orange reserved mostly for primary CTA buttons
- neutrals for surfaces, borders, and layout structure

### Copy Rules
- short paragraphs
- outcome-focused
- simple language
- minimal fluff

## Manager Route Direction

Path:
- `/manager`

This should become the internal operations/dashboard area.

Important:
- it should not just be a random admin-looking mockup
- it should become a real operational layer

### What `/manager` should eventually support
- landing page/site audit
- task queue
- lead tracking
- client/project status
- delegation / agent briefs
- content + workflow management
- later: auth, database, billing, analytics, client portal

### What `/manager` is NOT yet
- not a finished backend system
- not multi-user
- not authenticated
- not connected to a real database

If building it in Cursor, favor:
- clear architecture
- reusable components
- simple data model
- future backend readiness

## Contact Form Status

Current state:
- placeholder only
- no real inbox wiring yet

Business email intended for future use:
- `clearviewdigital.co1@gmail.com`

Do not hardcode personal email addresses anywhere.

Future task:
- connect contact form to a real submission service or backend

## Deployment

- Hosted on Vercel
- GitHub repo is the source of truth
- Vercel deploys from the repo

Any production-safe changes should keep:
- `npm run lint`
- `npm run build`

passing before push.

## Guardrails For Future Work

When editing this project:
- do not redesign the landing page from scratch unless explicitly requested
- preserve the current conversion structure unless there is a clear CRO reason
- avoid adding lots of dependencies without reason
- keep the code clean and maintainable
- prefer simple architecture over flashy complexity

## Best Next Steps In Cursor

1. Improve `/manager` architecture
2. Decide whether manager data is local-only, file-backed, or DB-backed
3. Add a clean internal data model for:
   - leads
   - tasks
   - projects
   - audit state
   - agent briefs
4. Prepare for auth/database later without overbuilding now

## Summary

This repo currently has:
- a solid live landing page
- a Vercel deployment
- a starting manager route

The landing page should remain stable and polished.
The main area for experimentation and system building is now `/manager`.
