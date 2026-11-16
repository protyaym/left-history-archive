# Plan (v1, 17/11/2026)

Read with `BRIEF.md` and `BIBLE.md`. The brief says what the archive is, the Bible says what every entry is checked against, and this file says what to build and in what order.

## 1. Where it stands today

Counted from the three downloaded folders on 17/11/2026.

| Thing | State |
|---|---|
| Entities in the site snapshot | 82: 28 people, 21 events, 15 places, 9 organisations, 6 texts, 3 movements |
| Entities with no source | 8 |
| Entities resting only on banned sources (exam-prep and study-notes sites, Wikipedia, Grokipedia; Bible E3, E8) | 27 |
| Entities with two or more sources | 15, but only 4 once banned sources are discounted |
| Source types | 61 secondary, 29 tertiary, 3 primary |
| Open editor notes | 31 |
| Marked `contested` | 18 (14 of them people) |
| Bangla text anywhere in the data | none |
| Entities with a random id instead of a prefixed one | 2 |
| Deploy config, CI, licence | none in any folder |
| Git history in the local folders | none (they are ZIP downloads, not clones) |

So 35 of 82 entries would fail the archive's own sourcing rules today. The site code works. The content rules exist on paper but nothing enforces them yet.

## 2. Decisions

These answer the setup questions. Each is a recommendation; change any of them here and the rest of the plan follows.

**D1. One repository, three folders.** Merge the three repos into one, `left-history-archive`:

```
left-history-archive/
  studio/     Sanity Studio: schema, migrations        (was left-history-backend)
  site/       the public website and its data snapshot (was archive-starter)
  docs/       BRIEF, BIBLE, PLAN, editorial-log, HOW-IT-WORKS (was left-history-editorial)
  tools/      sync, validator, status builder, book extraction
  .github/    the automation
```

Reason: almost every change ahead touches all three at once. Adding claim-level disputes (Bible E2) means a schema change, a sync change, a page change and a rule change. In three repos that is three commits that can drift apart. In one repo it is one commit. Editors never see the repo, because they work in Sanity, so the repo count only matters to maintainers. The old repos can be merged with their history kept and then archived.

**D2. Sanity is the only place content is edited.** The JSON files in `site/data/` are a generated copy. Nobody edits them by hand again. The three `.ndjson` seed files become history once the live dataset is the truth.

**D3. The site never talks to Sanity while a reader is on it.** It reads the JSON snapshot only, as it does now. This keeps pages small for phones, keeps the site alive if Sanity changes its terms, and puts every content change in git history. Sanity's free plan keeps only a few days of revision history, so git is the long-term record.

**D4. Netlify hosts the site. Sanity hosts the Studio.** Netlify publishes `site/` on every push to `main` and builds a preview for every pull request. The Studio is deployed with `sanity deploy` to a `*.sanity.studio` address, so editing needs only a browser and no Node on the editor's machine. `BRIEF.md` currently says GitHub Pages; change it to Netlify.

**D5. A robot moves content from Sanity to the site.** A GitHub Action runs every night and on a manual "Run workflow" button. It runs sync, then the validator, then builds the status file, then commits `site/data/` if anything changed. Netlify deploys the commit. If the validator finds an error, nothing is committed and the live site stays as it was. A Sanity webhook can replace the nightly timer later for instant publishing.

**D6. Review happens as a pull request once other people edit.** While you are the only editor, the robot commits straight to `main`. When verified editors join, switch it to open a pull request with the content changes. You read the changes and merge. Merging is publishing. This gives a real review gate at no cost and does not depend on Sanity's paid role system.

**D7. Sources become their own records.** Today a source is a line of text inside an entry. Make `source` a document type in Sanity: author, title, year, publisher, kind, voice (Bible E1), language, rights, and admissibility (admissible, lead only, excluded). An entry then cites a source record plus a page number. This is the base for the blocklist, the book list, the dashboard and book-assisted extraction.

**D8. `published` and `contested` are replaced.**

- `status`: `draft`, `ready for review`, `reviewed`. Only `reviewed` reaches the site.
- `claims`: each disputed fact stores the competing versions and who says each (Bible E2).
- Sourcing level is computed, not typed: `none`, `thin` (one admissible source), `solid` (two independent sources, one scholarly or primary). Thin entries may be published and carry a visible "thinly sourced" label. Entries with no admissible source may not.

Disagreement and thin sourcing are two separate things and get two separate fields (agreed 17/11/2026). Whether thin entries are shown with a label or held back is still open; the plan assumes shown with a label.

**D9. The site becomes generated pages.** Today every entry is `entity.html?id=...`, filled in by JavaScript. Search engines and WhatsApp link previews see an empty page, and the brief's first reader arrives from exactly those. Use Eleventy to generate one real HTML page per entry per language (`/bn/tebhaga/`) from the same JSON. It is plain HTML templates with no framework. The map stays as it is and loads only on request (Bible I3).

**D10. A status page is the dashboard.** See section 5.

**D11. Books fill in suggestions, never pages.** See section 6.

## 3. How it works after the changes

```
 You or a verified editor
        |  edit in the browser
        v
 Sanity Studio  ---->  Sanity dataset (the one source of truth)
                              |
                              |  nightly, or the "Run workflow" button
                              v
                 GitHub Action:  sync  ->  validate  ->  build status.json
                              |                |
                              |                +-- error: stop, site unchanged
                              v
                 commit to site/data/   (later: a pull request you merge)
                              |
                              v
                 Netlify builds the pages and publishes
                              |
                              v
                 Reader on a phone        /status page shows the health numbers
```

Your routine for adding or changing something:

1. Open the Studio address in a browser. Create or edit the entry. Attach source records with page numbers.
2. Set `status` to `reviewed` when it meets the threshold. Publish in Sanity.
3. Wait for the nightly run, or press "Run workflow" on GitHub for an immediate one.
4. Check the `/status` page. If the run failed, it says which entry broke which rule.

## 4. Changes in priority order

### Stage 0: foundations (about a week of evenings, no content work)

Progress is tracked in `CLAUDE.md` at the repo root, under "Where the work stands".

1. Install Git and Node LTS on this machine. Node is missing, so neither the Studio nor the validator can run here now.
2. Clone the repos instead of downloading ZIPs, then merge them into one repo (D1).
3. Connect Netlify to the repo with publish directory `site/` (D4). The site is public from this point.
4. Deploy the Studio with `sanity deploy` (D4).
5. Add the GitHub Action for sync and validation (D5).
6. Rewrite the README. It still describes hand-editing JSON. Add a licence: CC BY-SA 4.0 for content (Bible C4) and a code licence of your choice.
7. Add a monthly `sanity dataset export` as a full backup, including drafts.

### Stage 1: make the rules enforceable (two to three weeks)

8. Add the `source` document type and migrate the existing inline sources into it (D7). There are about 25 distinct sources, so this is small.
9. Add the domain blocklist to the validator (Bible E3, E8). It turns the 27 banned-source entries into a named worklist. The status page already lists them.
10. Replace `published` with `status` and `contested` with `claims` plus computed sourcing level (D8). Add `voice` to sources (Bible E1).
11. Change text fields to per-language fields (`en`, `bn`, `hi`) in the schema (Bible L5). Do this now even with no Bangla written: the migration gets more expensive with every entry added.
12. Give the two random-id entries proper prefixed ids.
13. Build the status page (section 5).

### Stage 2: harden the Bengal core (the real work; two to three months)

14. Freeze new entries. Every one of the 82 either reaches `reviewed` or drops to `draft`.
15. Start with Tebhaga and Nachole. Replace every exam-prep and Wikipedia citation with the books: Sunil Sen, Abani Lahiri, Adrienne Cooper, Peter Custers. Verify titles and editions before citing. Sen and Lahiri are already cited once each in the data.
16. Clear the 31 editor notes, or convert each to a public "not yet verified" note (Bible E5).
17. Rewrite the 18 `contested` flags as claims with named versions. Fix the Nachole hedging (Bible S5).
18. Decide the pending founding-date entry in `editorial-log.md`.
19. Write Bangla summaries for the reviewed core. Summaries first, full entries later.

### Stage 3: bring the site up to the Bible (overlaps Stage 2)

20. Generated pages with Eleventy, one per entry per language (D9).
21. Phone-first home: a searchable list and index of all entity types, map on request (Bible I1, I3).
22. Region filter that reads `admin_pre1947` and `admin_post1947` (Bible G2). The current one matches the word "pakistan" in place names.
23. Borderless basemap for pre-1947 events (Bible G1). The OpenStreetMap tiles set on 17/11/2026 show modern borders and are a stopgap.
24. Marker shapes and contrast fixes (Bible V2, V3, V4). Movements as bars on the timeline (Bible G4).
25. Claims shown side by side, sourcing labels, language switch with the "not yet translated" label (Bible E2, L6).
26. "Flag an error or object" form on every entry, using Netlify Forms (Bible C2, P5).

### Stage 4: open it to verified editors

27. A short contributor guide: the Bible in one page, how to cite, what `reviewed` means.
28. Invite editors to the Studio. Switch the robot to pull-request mode (D6).
29. Check Sanity's current free-plan limits on seats and roles before inviting. From memory the free plan allows several users but few role types; verify.
30. Book-assisted extraction (section 6).

### Stage 5: grow

31. Bengal first, in chapters: 1913 to 1929 (already begun with the founding cluster), then 1930 to 1947, then 1947 to 1964, then after 1964.
32. Each chapter starts with a book list in the source registry and ends when its entries are `reviewed`.
33. Then other regions, one chapter at a time, each needing an editor who reads the language.

## 5. The dashboard

A `/status` page on the site itself, public, because the Bible commits to showing the work (E5). It has three parts.

- **How it works.** The diagram from section 3 with one sentence per box and a link to each tool: Studio, GitHub Action runs, Netlify deploys.
- **Health.** Numbers the validator writes to `status.json` on every run: entries by type and status, sourcing level counts, banned-source count, open editor notes, translation coverage per language, time of last sync and whether it passed.
- **Worklist.** Every entry breaking a rule, with the rule number and a link that opens that entry in the Studio.

The same explanation lives as `docs/HOW-IT-WORKS.md` for reading inside the repo.

## 6. Books to pages

Possible at three levels. Only the first two are worth building.

**Level A: fill in the book's own details.** Type a title or ISBN in the Studio and fetch author, publisher and year from Open Library. Small, safe, do it with D7.

**Level B: suggested facts with page numbers.** A script takes one chapter of a book already in the source registry, plus the list of existing entries. A language model returns candidate facts, each with the entry it belongs to, the page number and a short supporting quote. These land in Sanity as suggestions attached to the entry, never as published text. An editor accepts, rewrites or rejects each one. The page number and quote make each check a one-minute job.

What Level B needs:

- A digital text of the book. Scans need OCR first, and OCR of Bangla print makes more errors than English, so Bangla books need a closer check.
- A paid API key for the model. The cost per chapter is small but not zero.
- The source registry (D7) and `status` (D8), which is why it waits until Stage 4.

**Level C: books publish straight to pages.** Do not build this. Models misread and merge people with similar names, and one invented fact costs the archive more trust than a hundred slow entries.

Two rules to add to the Bible when Level B is built:

- Machine-suggested text is labelled as such in the Studio until a person has checked it against the page.
- Entries state facts in the archive's own words with a page citation. They do not copy passages from books in copyright. Books out of copyright may be quoted at length.

## 7. Risks

- **The dataset is public.** Sanity's free plan allows public datasets only; private ones need the paid Growth plan. Anything published in Sanity is readable through Sanity's API, whatever the `published` switch says. Sanity's own drafts are private. Rule: an entry stays a Sanity draft until it is ready to be read. On 17/11/2026 three entries were published in Sanity with the switch off.
- **Momentum.** There was a four-month gap after July. Stage 0 puts the site online in a week so that later work is visible.
- **Image rights.** Photographs need permission or a clear licence before they enter the archive.
- **Web essays as sources.** Sixteen citations point to Suchetana Chattopadhyay's Substack essays. She is a historian, so they are admissible, but cite her book for the same facts where it covers them. Log the decision in `editorial-log.md`.
