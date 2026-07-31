# Build Log — Maestro / Coaching Website System

*A running record of decisions, tools, and patterns from building this site — kept so the process can be reused for another coaching academy or client without re-deriving everything from scratch. Updated as we go, in the same commits as the actual changes.*

---

## Core stack (proven, reuse as-is)

- **Site:** single-file HTML/CSS, no framework — fast to build, zero dependencies
- **Hosting:** Netlify, connected to a GitHub repo for auto-deploy on push
- **Domain:** bought separately (Namecheap or via Netlify), pointed via Netlify's Domain management
- **Email forwarding:** ImprovMX (free tier) for a branded `hello@domain` address
- **Booking:** Calendly, connected via Claude's MCP connector — event type created, embedded as a CTA button on the site
- **Outreach/CRM:** Apollo.io — contact search/enrichment (finds real named staff at target organizations, not just general office emails), connected via MCP
- **Email drafting:** Gmail MCP connector — `create_draft` only, never auto-sends. This is the deliberate approval-gate pattern: draft everything, human sends.

## Reusable gotchas (learned the hard way)

- **Two-Netlify-sites trap:** if a site is first deployed via drag-and-drop (Netlify Drop) and *later* connected to GitHub for auto-deploy, you end up with two separate Netlify sites. A custom domain can only usefully point at one — always verify via Site configuration → Build & deploy → Continuous deployment which site is actually GitHub-linked before attaching a domain.
- **"Set as primary domain" ≠ moving a domain between sites.** It only reorders priority within one site's domain list. To move a domain, remove it from the old site and add it fresh to the correct one.
- **Netlify domain rate limit:** ~3 domain add/remove actions per hour. Plan domain changes as one clean sequence, not trial-and-error.
- **www vs non-www are separate domain entries** in Netlify — check both.
- **Dashboard can say "deployed" before the public CDN catches up** — always verify the live URL directly (fetch it, don't trust the dashboard alone) before sharing a link externally.
- **Compress photos before launch** — phone photos straight from upload can be 2-3MB each; fine for browsing, bad for paid-ad landing page speed.
- **Apollo people-search vs enrichment are separate steps** — search returns names/titles for free, but revealing actual emails ("enrichment") consumes credits and needs explicit user confirmation before running.
- **Not every organization is in Apollo** — smaller institutions (some independent schools) return zero matches; fall back to their published general office contact rather than guessing an email pattern.

## Content/positioning decisions worth reusing

- **Pricing removed from public site**, replaced with richer descriptive copy per tier — reads as more premium, avoids price-shopping friction, pushes toward a conversation (WhatsApp/booking) instead
- **Named institutions anonymized in track record** where the client prefers discretion (e.g. "a private London football academy" instead of the actual name) — always confirm this preference with the client rather than assuming
- **Qualifications stated precisely** — "UEFA C, working towards B" not "UEFA qualified" until actually true; generalized later to "UEFA Qualified" once more coaches with varying levels were being onboarded, specifically to avoid needing a site edit per new hire's exact level
- **Testimonials from real named clients are drafts until approved** — never publish invented quotes under a real person's name without them confirming the wording first

## In-progress build: Parent Progress Portal

- **Stack decision:** Supabase (free tier) for database + magic-link auth — chosen over Airtable/Sheets (no real per-family security) and a fully custom backend (unnecessary maintenance overhead for a solo operator)
- **Data model:** `players` → `sessions` → `ratings`, with Row Level Security policies so a parent can only ever query their own child's data — enforced at the database level, not just hidden in the UI
- **Assessment rubric:** 5 categories (First Touch, Decision Making, Passing, Physicality, Attitude & Coachability), each scored 1-10 against fixed observable criteria, relative to age/stage rather than an absolute standard — see the full rubric doc for details
- **Scoring cadence:** full rubric scoring every 3rd session, not every session — avoids both coach fatigue and noisy/inconsistent data
- **Design principle:** every number shown to a parent must be traceable to a visible reason — no unexplained percentages or scores

## Outreach system pattern (reusable for any local B2B outreach, not just schools)

1. Source real named contacts via Apollo (job title + organization domain search)
2. Draft personalized outreach via Gmail MCP (never auto-send)
3. Track replies manually or via a dedicated tool (Apollo/Instantly/Outreach) if volume justifies it
4. Apply a simple Hot/Warm/Cold/No filtering framework to replies, with a defined next action per tier

---

*Add to this log whenever a decision, tool choice, or gotcha would save real time on a repeat build — doesn't need to be exhaustive, just enough that future-you (or someone else running this playbook) doesn't re-learn the same thing twice.*
