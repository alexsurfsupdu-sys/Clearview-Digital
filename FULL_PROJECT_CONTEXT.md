# Full Project Context

## Project Name

Clearview Digital

## Core Purpose

This project is the production codebase for Clearview Digital's public website.

The business sells:
- custom websites
- landing pages
- monthly website management

This site is meant to:
- attract small business / growing brand leads
- communicate the offer clearly
- build trust quickly
- push one main conversion action:
  - `Get My Free Proposal`

This started from a Base44 visual draft, but Base44 is no longer the production system for this phase. The real implementation is this Next.js codebase deployed on Vercel.

## Current Tech Stack

- Next.js
- App Router
- TypeScript
- Tailwind CSS v4
- deployed on Vercel
- GitHub-backed deployment flow
- Vercel Analytics installed

## Live / Deployment Context

- Hosted on Vercel
- GitHub repo is the source of truth
- Vercel redeploys from Git pushes

Current important commands:

```bash
npm run dev
npm run lint
npm run build
```

Any meaningful changes should keep lint/build passing before push.

## Business Model Direction

### What the business is right now

Clearview Digital is currently positioned as a service business that builds and manages websites for clients.

Main offer:
- custom website build
- optional ongoing monthly management

### What it may become later

Long-term direction may include:
- client portal
- co-admin dashboard
- monthly hosted websites
- internal admin system
- platform layer for managing client sites
- application development offers

But those are not the current public-site priority.

## Main Conversion Goal

The landing page has one main conversion action:

`Get My Free Proposal`

This CTA should remain the dominant action across the landing page.

Avoid adding competing primary actions unless explicitly requested.

## Current Landing Page Strategy

The landing page should feel:
- premium
- calm
- modern
- trustworthy
- conversion-focused

It should not feel:
- loud
- stitched together
- overdesigned
- overly colorful
- too text-heavy

## Landing Page Visual System Rules

### Palette

Use a strict palette:
- background: white / off-white
- surface: very light gray
- heading / trust color: deep navy
- body text: dark neutral / soft dark slate
- accent: orange reserved mainly for primary CTA buttons
- border: soft neutral gray

### Color rules

- Most sections should be light background + dark text
- Orange should mostly be used for:
  - primary buttons
  - very small highlight accents
- Deep navy should mostly be used for:
  - headings
  - brand/trust emphasis
  - key text accents where needed
- Avoid dark full-width sections unless there is a very strong reason
- Avoid multiple competing highlight colors

### Typography rules

- Strong readable headings
- Comfortable, easy-to-scan body copy
- Short paragraphs
- Secondary text can be softer, but never too faint to read
- Avoid low-opacity text for anything important

## Landing Page Copy / CRO Rules

### Main goal

Within 3–5 seconds, a user should understand:
- what Clearview Digital does
- who it is for
- what action to take next

### Copy principles

Use:
- short lines
- simple language
- outcome-focused messaging
- trust-building phrasing

Avoid:
- filler
- vague buzzwords
- repeated ideas
- heavy walls of text

### Preferred CTA

Primary CTA everywhere:
- `Get My Free Proposal`

Micro-trust text near CTA can include:
- `Free proposal. No pressure.`

### Landing section expectations

#### Hero
- clear outcome-driven headline
- short subheadline
- visible CTA immediately
- one supporting trust line or stat

#### What You Get
- short bullets
- outcome-first wording
- clear benefit statements

#### What We Do
- service cards
- short descriptions
- focused on results, not jargon

#### How It Works
- simple steps
- short sentences
- fast/process clarity
- CTA after steps

#### Proof
- strong result headlines
- short testimonial bodies
- believable service-business positioning

#### Form
- low friction
- short trust language
- no unnecessary required fields

#### FAQ
- top objections first:
  - time
  - cost
  - contracts
  - what happens after submission

#### Final CTA
- short headline
- strong benefit
- one CTA

## Current Form Status

Current state:
- placeholder behavior only
- not yet connected to a real email/form backend

Business email intended for form routing:
- `clearviewdigital.co1@gmail.com`

Important rule:
- do not hardcode any personal email address into the project

Future task:
- connect the contact form to a real submission service or backend

## Manager Route Context

Path:
- `/manager`

### Why it exists

The `/manager` route is the internal operations/dashboard foundation.

It should eventually help run:
- site audits
- lead tracking
- project tracking
- task management
- delegation briefs
- future portal/admin logic

### What it should be

A real internal control layer.

### What it should not be

- not just a fake admin UI
- not random cards with no function
- not disconnected from the real site

### Current manager direction

The manager should be built around:
- baseline definition
- site audit / gap detection
- task queue
- agent handoff / brief generation
- future data model for projects, leads, tasks, and site state

## Manager Architecture Direction

If building `/manager` further, prefer a structure like:

### Core entities

- Lead
  - id
  - name
  - business
  - contact info
  - source
  - stage
  - notes
  - next step

- Task
  - id
  - title
  - owner
  - priority
  - status
  - linked project/lead

- Project
  - id
  - client name
  - status
  - offer type
  - current phase
  - launch status
  - monthly plan status

- Audit
  - id
  - target page
  - baseline snapshot
  - passed checks
  - missing sections
  - warnings
  - recommended tasks

- Agent Brief
  - id
  - title
  - goal
  - deliverable
  - status
  - linked entity

### Good near-term manager priorities

1. stable UI architecture
2. reusable components
3. clear data model
4. local persistence or simple file-backed persistence first
5. future auth/database readiness

### Avoid for now

- overbuilding a huge backend before the requirements are settled
- pretending the manager is a full multi-user SaaS already

## Current Audit Philosophy

The manager should not guess randomly what the site needs.

It should first know:
- what the site is supposed to contain
- what the conversion goal is
- what required sections/checks exist

Then it can compare:
- current implementation
- baseline expectations

This is better than vague AI guessing because:
- it creates a known standard
- it surfaces real gaps
- it produces better implementation tasks

## Files That Matter Most

### Public site
- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `components/landing/data.ts`
- `components/landing/contact-form.tsx`
- `components/landing/faq-accordion.tsx`
- `components/landing/logo.tsx`

### Manager
- `app/manager/page.tsx`
- `components/manager/manager-dashboard.tsx`

### Project documentation
- `README.md`
- `PROJECT_CONTEXT.md`
- `FULL_PROJECT_CONTEXT.md`

## Known Completed Work

Already done in this project:
- Base44 landing rebuilt into Next.js
- deployed to Vercel
- Vercel Analytics installed
- landing page underwent conversion-focused rewrite
- visual system cleaned toward a lighter, more premium style
- personal email removed from site
- manager route added as an internal workspace foundation

## Known Incomplete Work

Not finished yet:
- real form submission backend
- business email routing
- auth
- database
- client portal
- co-admin dashboard
- billing / Stripe
- multi-user manager
- production-ready manager backend

## Guardrails For Future Edits

### Landing page guardrails

- do not redesign from scratch unless explicitly requested
- preserve the current structure if possible
- refine instead of replace
- do not introduce extra colors
- do not add multiple competing primary actions
- do not make the page text-heavy again

### Manager guardrails

- make it actually useful, not just aesthetic
- tie it to real project state where possible
- keep architecture clean
- avoid fake “AI knows everything” behavior
- prefer explicit baselines and data structures

### General guardrails

- keep dependencies minimal
- keep code maintainable
- preserve Vercel compatibility
- keep lint/build passing

## Recommended Next Priorities

### If continuing public-site work

1. wire the contact form to the business email
2. keep tightening copy only if it improves conversion
3. continue checking mobile spacing / readability

### If continuing manager work

1. define manager data model properly
2. decide persistence approach
3. add useful CRUD flows for leads/tasks/projects
4. connect baseline + audit + action system cleanly
5. prepare for auth/database later

## Best Working Model Across Tools

This repo should be the shared source of truth.

Use:
- GitHub for source control
- Vercel for deployment
- Cursor for ongoing coding
- this context file as the narrative/project brain

If another tool or agent works on the repo, it should read this file first before making large changes.

## Short Summary

Clearview Digital currently needs:
- a strong, clear, trustworthy landing page
- a clean path to lead capture
- an internal manager system that grows into a real operational dashboard

The landing page should stay stable and polished.
The main area for heavier experimentation and future system design is `/manager`.
