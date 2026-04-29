# Tax Incentive Drafter

An AI-powered R&D evidence scanner for early-stage software startups preparing Australian RDTI activity reports.

R&D consultants ask what founders remember building. Tax Incentive Drafter analyses what the engineering team actually tried, tested, broke, fixed, and learnt across GitHub history.

## Product idea

Most R&D discovery starts from interviews, summaries, selected tickets, and rough time estimates. The strongest software evidence often lives lower down in the engineering trail:

- failed commits and reverted approaches
- experimental branches
- benchmark scripts and threshold changes
- latency fixes and model comparisons
- repeated algorithm or architecture changes
- PR comments explaining uncertainty
- tests showing whether an approach met a technical requirement

The product does the deep technical evidence discovery first. An adviser then reviews, validates, and finalises the claim.

## Current app

This repository currently contains the first backend foundation:

- Next.js App Router project
- Supabase client and server helpers
- Magic-link email authentication
- Protected `/dashboard` route
- Auth callback route at `/auth/callback`
- Product-shaped landing page for the R&D evidence scanner

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth
- Vercel-ready project structure

## Getting started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

In Supabase, enable email authentication and add the local callback URL to your auth redirect URLs:

```text
http://localhost:3000/auth/callback
```

For production, also add the deployed callback URL:

```text
https://your-domain.com/auth/callback
```

The app uses passwordless email magic links. Users sign in at `/login`, Supabase redirects back through `/auth/callback`, and authenticated users can access `/dashboard`.

## Useful commands

```bash
npm run dev
npm run lint
npm run build
```

## Next milestones

- Add GitHub OAuth or repository import
- Ingest commits, PRs, diffs, branches, tests, benchmarks, and reverts
- Detect candidate RDTI activities using hypothesis, experiment, observation, and conclusion signals
- Link detected activities to source evidence
- Flag missing evidence and weak records
- Generate adviser-ready RDTI activity reports

## Important positioning

This product is not intended to fully replace R&D consultants or advisers. The AI prepares the deep technical evidence pack; the adviser reviews the evidence, applies judgement, and finalises the claim.
