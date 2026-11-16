# Left history archive: instructions for Claude

This file is loaded at the start of every Claude Code session opened in this folder. It says what the project is, what the rules are and where the work stands. Keep it short and keep it true: update "Where the work stands" at the end of every session.

## What this is

A public reference on the history of the communist movement in the Indian subcontinent, starting with Bengal (Tebhaga and Nachole first). It is a personal project of one maintainer, Protyay, meant to become a public project where verified editors contribute. It is not an academic submission and has no deadline.

The maintainer is a designer, not a full-time developer. Explain in plain language, give exact clicks and commands, and say what a change means before making it.

## Read before working

| File | What it settles |
|---|---|
| `docs/BRIEF.md` | What the archive is, for whom, scope, languages |
| `docs/BIBLE.md` | The numbered rules every entry and screen is checked against |
| `docs/PLAN.md` | Setup decisions (D1 to D11) and the staged work in priority order |
| `docs/HOW-IT-WORKS.md` | How an edit in Sanity reaches the public site |
| `docs/editorial-log.md` | Case-by-case rulings on sources and disagreements |
| `site/config/ux.json` | The four personas and their journey maps. Design changes are argued from these |

When a request conflicts with the Bible or the plan, say so and name the rule (for example "breaks E3") before doing anything.

## Layout

```
studio/   Sanity Studio: schema in schemaTypes/, one-off migrations in migrations/
site/     the public website (plain HTML, CSS, JS; no build step yet)
  index.html   home: search and a list of every entry       (js/home.js)
  entity.html  one entry, at entity.html?id=...             (js/entity.js)
  map.html     map and timeline of movements and events     (js/app.js)
  status.html  the dashboard: how it works, health, worklist (js/status.js)
  making.html  the making of the site: build log, personas, journeys (js/making.js)
  js/data.js   shared by every page: loading, dates, sourcing level, kind names
  css/         style.css (base, map), pages.css (header, home, entry, making), status.css
  data/        JSON snapshot of the Sanity content. GENERATED. Never edit by hand.
  config/      blocklist.json (banned sources), project.json (addresses), ux.json (personas, journeys)
tools/    sync-from-sanity.js and validate.js (plain Node, no dependencies)
docs/     brief, Bible, plan, how-it-works, editorial log
.github/workflows/sync-content.yml   nightly and on-demand sync
netlify.toml                         publishes site/
```

Sanity project `p90vg6so`, dataset `production`.

## Rules that always hold

1. **Content is edited only in Sanity.** `site/data/*.json` is produced by `tools/sync-from-sanity.js`. Do not edit it by hand, even for a typo.
2. **Never invent a fact, a source, a page number or a quotation.** If a reference comes from memory, mark it "verify before citing". This archive lives on its sourcing.
3. **Banned sources stay banned** (Bible E3, E8): exam-prep sites, AI encyclopaedias, and Wikipedia as a sole source. The list is `site/config/blocklist.json`.
4. **No party is named** anywhere in the interface or public documents (Bible S1).
5. **Ask before anything that leaves this machine or changes live data:** pushing to GitHub, importing into or migrating the Sanity dataset (`--apply`), deploying, creating accounts.
6. **The Sanity dataset is public.** Anything published in Sanity can be read through Sanity's API, whatever the archive's own `published` switch says. Unfinished work stays a Sanity draft.
7. **Free tools only** unless the maintainer agrees to a cost. Say so before proposing a paid service.
8. **Phone first** (360px wide, weak connection), laptop second. Reading text at least 14px, labels at least 12px (Bible V4, I3).
9. **A schema change is one commit** that updates `studio/schemaTypes/`, `tools/sync-from-sanity.js`, `tools/validate.js`, the site and the docs together.
10. **Dates are written dd/mm/yyyy** in documents. Documents use British spelling.
11. **The interface speaks the reader's language.** No internal ids, no "entity", no raw relationship codes on screen (Bible V5). Doubt is shown with dashed outlines or hatching, never red (Bible V1).
12. **The personas are invented**, drawn from the brief. Say so wherever they are shown, and replace them with real findings once readers have been tested.

## Running things

```
python -m http.server 8000 --directory site      the site, at http://localhost:8000
cd studio && npm install && npm run dev          the Studio, at http://localhost:3333
node tools/sync-from-sanity.js                   refresh site/data from Sanity
node tools/validate.js                           check the snapshot; non-zero exit on errors
```

Node is needed for the last three.

## Where the work stands

Last updated: 17/11/2026.

Stage 0 of `docs/PLAN.md` (foundations) is in progress.

- [x] Three repos merged into this one with their history (17/11/2026). Local only so far.
- [x] `CLAUDE.md`, `docs/HOW-IT-WORKS.md`, status page, `netlify.toml` and the sync workflow written.
- [x] Site rebuilt around the personas (17/11/2026): list-first home with search, new entry page, map on its own page, making-of page. This is part of Stage 3, done early. What it did not reach is listed on `site/making.html` under "What design alone cannot fix".
- [ ] Install Node LTS on the maintainer's machine. Without it the Studio, sync and validator cannot run locally. The moved scripts in `tools/` and the workflow have not been run since the merge.
- [ ] Create the `left-history-archive` repository on GitHub and push. Then archive the three old repos.
- [ ] Connect Netlify to the repository (it reads `netlify.toml`).
- [ ] Deploy the Studio (`cd studio && npx sanity deploy`).
- [ ] Fill in the three addresses in `site/config/project.json` so the status page links work.
- [ ] Rewrite `site/README.md` (it still describes hand-editing JSON) and add a licence.
- [ ] Set up a monthly `sanity dataset export` backup.

Next after Stage 0: Stage 1, starting with sources as their own document type (plan D7) and the blocklist in the validator.

## Known problems

- 35 of 82 entries fail the sourcing rules: 27 rest only on banned sources, 8 have none. Only 4 have two or more admissible sources. The status page lists them.
- Three entries are published in Sanity with the `published` switch off, so they are publicly readable through the API: `pe_majumdar`, `tx_floud_report`, `tx_sen_agrarian_struggle`.
- Entries created in the Studio get a random id instead of a prefixed one (`mv_`, `ev_`, `pe_`, `org_`, `tx_`, `pl_`). Two exist.
- The Studio has two names for texts: the document type is `textContent`, but relationships point at `text`. The sync accepts both.
- The region filter matches the word "pakistan" in place names (Bible G2). The basemap shows modern borders (Bible G1). Map markers still rely on colour alone (Bible V2), and on a phone the timeline's year labels collide with its dots.
- No correction form yet (Bible C2, P5), and no licence.
- The redesign has not been tested with any real reader.
- Entry pages are filled in by JavaScript, so search engines and link previews see an empty page (plan D9).
- No Bangla text exists in the data yet.

## At the end of a session

1. Update "Where the work stands" and "Known problems" above.
2. If a setup address changed, update `site/config/project.json`.
3. If a sourcing or disagreement ruling was made, add it to `docs/editorial-log.md`.
4. If a decision in the plan changed, change `docs/PLAN.md` in the same commit.
