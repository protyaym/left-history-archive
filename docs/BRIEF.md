# Design brief (v1, 04/11/2026)

## What it is

A public reference on the history of the communist movement in the Indian subcontinent. People use it the way they use Wikipedia: they land on one entry from a search or a shared link, read the summary, and leave. People organising today, students and researchers can go deeper into sources, disputed accounts, and connections between people, places and movements. It is a long-term public project, not a course deliverable.

## For whom, in priority order

1. **General public, on a phone.** Arrives from a search or WhatsApp link, reads one entry, maybe follows one link. Needs a clear summary in their language within the first screen.
2. **People organising today.** Want the lineage from a historical struggle to a current one, and precise links they can share.
3. **Students and researchers.** Want citations, how reliable each claim is, and which accounts disagree.

## Scope

Areas and periods within the undivided CPI's organisational reach up to 1964, then within the reach of the party whose line the archive follows. Movements that began before 1947 in what became Pakistan or Bangladesh are covered until they end (Tebhaga in full, including Nachole). Every historical entry connects forward to present-day struggles over the same question.

## Editorial position

Publicly: written from a Marxist-Leninist perspective, with no party named. The archive is non-sectarian on minor disagreements with other left parties. Facts may come from any source except right-wing authors and those positively associated with the RSS, CIA, NED, Mossad or NATO. Interpretation cites broad-left authorities. The exclusion and "minor disagreement" lists build up case by case in an editorial log. (Bible S1, S1a, S1b, E6, E6a, E7.)

## Languages

English, Bangla, Hindi. Modelled so more can be added; Malayalam is the likely fourth.

## Devices

Phone first (360px wide, weak connection), laptop second. On phones, list and entry pages come before the map.

## Stack

- **One repository**, `left-history-archive`, merged on 17/11/2026 from `archive-starter`, `left-history-backend` and `left-history-editorial`.
- **Content:** Sanity Studio (`studio/`), dataset `p90vg6so/production`. Sanity is the only place content is edited.
- **Site:** static frontend (`site/`), built from a JSON snapshot via `tools/sync-from-sanity.js`, hosted on Netlify.
- **How the pieces connect:** `docs/HOW-IT-WORKS.md`, and the status page at `site/status.html`.

## Success looks like

- A first-time reader on a phone in Bangla understands what Tebhaga was within 30 seconds of landing on the page.
- Every published claim traces to an admissible source in two taps.
- The Singur and Nandigram entries are cited approvingly by at least one reader outside the archive's political camp.

## Out of scope for now

Partition as a standalone chapter, physical exhibition, contributor accounts for the public.

## Open decisions

None at brief level. Case-by-case calls go in `editorial-log.md`.
