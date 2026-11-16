# Archive Bible (v1, 04/11/2026)

Read with `BRIEF.md`. v1 folds in the brief answers; items still marked **[OPEN]** need a decision.

This is the rulebook every entry, screen and contribution is checked against. Rules are numbered so a review can say "breaks E3" instead of re-arguing the point. Where a rule is a house choice rather than a principle, it says so. Items marked **[OPEN]** wait on answers to the brief.

The archive takes a side. It is written from the left, for the people whose struggles it records, and it says so on its About page. Taking a side is not a licence to be loose with evidence: the left's best historical work (Thompson, Guha, Trouillot) won its arguments by being more rigorous about sources than the official record, not less. Partisanship lives in what we choose to make visible and whose account we treat as evidence. It never lives in invented facts.

---

## S. Stance

**S1. Perspective declared, party not named.** The About page says the archive is written from a Marxist-Leninist perspective, and states its sourcing rules (E6, E7). No party is named, and no party logo, colours or slogans appear anywhere in the interface or in public project documents. Wording matters: say "a Marxist-Leninist perspective", not "the Marxist-Leninist party position". In India "ML" with "party" is read as CPI(ML), so the second phrasing would signal the wrong camp.

**S1a. Editorial line.** Interpretation follows the editorial line set by the maintainer. On minor disagreements with other left parties the archive is non-sectarian: it states each party's position and cites it, without ruling. The first test is the founding date (Tashkent 1920 or Kanpur 1925), already published in the backend without sources.

**S1b. Living lists.** "Minor disagreements" and excluded sources are not written up front. Each is logged the first time it comes up, with the date, the entry that raised it and the reason, in `editorial-log.md`. The log is the precedent for the next case.

**S2. History from below is the default.** The primary subject of every movement entry is the people who acted: sharecroppers, labourers, Adivasi communities, women's corps. Leaders and parties appear as participants within that, not as the movement's authors.

**S3. No hagiography, including of the left.** Party decisions, retreats, sectarian splits, the line changes that left cadres exposed, and the failures of left governments are recorded with the same rigour as state repression. An archive that cannot criticise its own side is a party organ, and party organs are not trusted beyond the party. Named test entries the archive must handle in full before it claims to cover the history of the party whose line it follows: Sainbari (1970), Marichjhapi (1979), Bijon Setu (1982), Singur (2006–08), Nandigram (2007). Each states facts from all admissible sources (E6) and the party's own account as the party's account.

**S4. Name the state as an actor.** When police, army, paramilitary or courts act, the sentence has them as its grammatical subject. "Police fired on", not "a clash occurred". "The state responds" is banned as a euphemism for a crackdown.

**S5. Equal hedging.** Uncertainty is applied symmetrically. If peasant casualties are "by some accounts", state casualties are too. Current violation: `ev_nachole_clash` and `mv_nachole` state police deaths more firmly than village burnings.

---

## H. Scope

**H1. Geography and period follow the party's reach:** areas within the undivided CPI's organisational purview up to 1964, and within the reach of the party whose line the archive follows from 1964 to the present.

**H1a. Movements finish their story.** A movement that began before 15/08/1947 in territory that became Pakistan (now Pakistan or Bangladesh) is covered until it ends, including its direct continuations. Tebhaga is covered in full, with Nachole (1949–50) as its continuation and the East Bengal State Acquisition and Tenancy Act (1950) as its legislative outcome. A movement that began in that territory after Partition is out of scope.

**H2. Past to present.** Every movement entry ends with a "Since then" section linking to present-day struggles over the same question (for Tebhaga: Operation Barga, then Singur and Nandigram).

## E. Evidence and provenance

**E1. Every claim knows whose record it comes from.** Source `type` (primary/secondary/tertiary) is not enough. Add `voice`: `state` (police, court, administrative), `party`, `participant` (memoir, testimony, oral history), `press`, `scholarly`, `cultural` (songs, plays, fiction). A police FIR is a primary source and also the prose of counter-insurgency (Guha, 1983); the reader must see both facts.

**E2. Contestation lives on claims, not entities.** Replace the entity-level `contested: true` with a `claims` array: each disputed figure or event carries the competing versions, who says each, and their `voice`. The UI shows the disagreement in place ("Police record: X. Survivors' accounts: Y."). Never average, never pick the most dramatic.

**E3. Aggregators never publish.** Exam-prep sites, content farms and uncited Wikipedia text may guide research; they never appear as the sole source of a published claim. The validator should fail on them once a domain blocklist exists.

**E4. Silences are recorded.** When an archive is missing (village records destroyed, testimony never collected, a name lost), the entry says so. Absence is data (Trouillot, *Silencing the Past*, 1995).

**E6. Facts: every admissible source, with one exclusion.** Factual claims may cite any scholarly, press, state or participant source, except authors who are explicitly right-wing or positively associated with the RSS, the CIA, the NED, Mossad or NATO. "Positively associated" means any of: membership or office; funding for the work being cited; writing for the organisation's own publications; public advocacy on its behalf. Simply being criticised by such a body, or citing it critically, does not count. Each exclusion is logged under S1b.

The pro-NATO test covers authors and organisations whose own public position is pro-NATO: for example Anne Applebaum, or the Atlantic Council and its publications. They are not cited as sources for any claim. Default for news organisations: wire and on-the-ground reporting (Reuters, AP, BBC and similar) is judged by the reporting itself, not the outlet's editorial line, so it stays admissible for facts. Opinion and analysis pieces from those outlets fall under the author test.

**E6a. The institution's own records stay admissible as evidence about the institution itself.** A declassified CIA report on Indian communists is a primary source for what the CIA watched and planned. It enters as `voice: state` or `voice: hostile` and is never treated as true about anyone else. Indian (IB) and Pakistani police and intelligence files are used the same way: as records an agency kept hidden until the event had passed, which show what it knew and did. They are essential to Tebhaga and Nachole.

**E7. Interpretation: broad left authorities.** Interpretive passages ("why it happened", "what it meant") cite left scholars as authorities. Where a major non-left interpretation exists, the entry names it in one sentence and answers it. Leaving it out would make the archive less reliable than Wikipedia on exactly the questions readers come with.

**E8. No AI encyclopaedias or exam-prep sites as sources.** Grokipedia, Testbook, IAS Site, Vajiram & Ravi, ClearIAS and the like are research leads only (extends E3).

**E5. Editor notes stay public.** Open questions are shown to readers as "What we have not verified yet". This is a commitment to showing the work. It uses the neutral "open question" style (V6), not the error colour.

---

## P. People and communities

**P1. Collective actors are entities.** Add `type: "community"` / `"collective"` (e.g. Rajbanshi sharecroppers of Dinajpur, the Santal of Nachole, the Nari Bahini). Movements link to them with `participated` and a role. A movement page with three named male party leaders and no named community fails review.

**P2. Name ordinary participants wherever the record allows.** A named Santal or Rajbanshi participant outranks a fourth party leader in priority.

**P3. Identity is recorded, not assumed.** Caste, community, religion and gender are recorded where sources state them and where it matters to the history (Tebhaga's cross-communal character during the 1946 riots is the history). Never inferred from a name.

**P4. Sexual violence is described factually and without detail beyond what the survivor made public.** Lead with the survivor's own testimony where it exists. No graphic description, no imagery. Content note on the page, not a blur over the whole entry.

**P5. Communities can object after publication.** No review before publication. Every entry carries a visible "Flag an error or object" link to the correction form (C2), and an objection from a person or community the entry is about is answered before any other correction.

---

## L. Language and naming

**L1. Local names first.** Bengali (and Santali in Ol Chiki where relevant) names in original script beside the English. Slogans quoted in the original first: আধি নয়, তেভাগা চাই.

**L2. Don't translate the vocabulary of the struggle into landlord English.** bargadar, jotedar, khamar, adhiar stay in the text with a glossary on hover. "Sharecropper" alone flattens the class relationship.

**L3. Place names carry their time.** "Thakurgaon, Dinajpur district (Bengal, 1946; now Bangladesh)". Never "India" or "Bangladesh" alone for a pre-1947 event.

**L4. Honorifics are quoted, not adopted.** "Called Rani Ma by Santal villagers" is fine. Using it as a heading is not.

**L5. Interface languages: English, Bangla, Hindi**, in that order of completeness. Content is modelled as field-level translations from the start so a fourth language costs no schema change. Malayalam is the obvious fourth: Kerala is the left's strongest base today.

**L6. A missing translation shows the English with a visible "not yet translated" label**, never a blank or a machine translation passed off as edited text.

---

## G. Geography and time

**G1. No modern borders on historical events.** The basemap for any date before 1947 shows no international border, or a dated historical layer (OpenHistoricalMap). The current CARTO basemap draws the India–Bangladesh border under a 1946 uprising.

**G2. Filters use then-and-now jurisdictions explicitly.** The place entities already store `admin_pre1947` and `admin_post1947`. The region filter must read those, not string-match place names. Current bug: it files undivided Bengal and Thakurgaon (now Bangladesh) under "West Bengal, India".

**G3. No fake precision.** A province-wide event (a commission, an Act) is not a pin at a guessed centroid. It appears as a region shading, or off-map in a "province-wide" tray. A movement across 19 districts is drawn as its districts, not one dot in Dinajpur.

**G4. Duration is shown.** Movements are bars on the timeline, not start-date dots. The time filter is a window (from–to), not "up to year".

---

## V. Visual system

**V1. Red belongs to the movement, not to doubt.** (House choice, but a strong one.) Red is the archive's political colour and marks movements or acts of resistance. Uncertainty gets a different treatment: hatched or dashed outlines, never a hue.

**V2. Never colour alone.** (Principle: WCAG 1.4.1.) Every category on the map and timeline has a shape or pattern as well as a colour. Current failure: event green `#5B6B4F` and contested red `#A33B2E` have a luminance contrast of 1.14:1, so they are indistinguishable for many colour-blind readers.

**V3. Contrast floors.** (Principle: WCAG 1.4.3, 1.4.11.) Body text ≥ 4.5:1, map markers and UI boundaries ≥ 3:1. Current failures: gold movement marker `#C99A3E` on `#F7F8F3` is 2.41:1; the event tag at 11px is 4.24:1.

**V4. Minimum text size 14px for reading, 12px for labels.** Current mono labels at 10–11px fail on phones. (Principle for legibility, size values are house choice.)

**V5. Reader-facing, not catalogue-facing.** (House choice.) Internal IDs (`mv_tebhaga`) never appear in the interface; they belong in the URL. The look draws on the movement's own print culture (pamphlets, IPTA posters, hand-lettered Bangla) rather than the colonial record office's catalogue cards and ledgers. **[OPEN]** to be developed in a visual direction study.

**V6. Four reading registers, consistently styled:** narrative (the entry), evidence (sources, quoted testimony), open questions (editor notes), and contested claims (E2). A reader must tell them apart at a glance without reading labels.

**V7. Bangla typography is designed, not fallen back to.** Pick a Bangla face deliberately (candidates: Noto Serif Bengali, Hind Siliguri, Tiro Bangla, all open-licensed) and pair it with the Latin face at matched x-height.

---

## I. Interaction

**I1. Everyone is reachable from the explorer.** People, collectives, organisations and texts are browsable from the home page (index, search, or a network view). Currently 12 of the 20 entities, including Ila Mitra, can only be reached by URL or two clicks deep.

**I2. Keyboard and screen reader parity.** (Principle: WCAG 2.1.1, 4.1.2.) Map markers and timeline items are focusable, named and operable by keyboard; the card moves focus on open and returns it on close. Every map view has a list equivalent.

**I3. Phone first, low bandwidth.** Design at 360px wide first, laptop second. An entry page loads in under 100 KB before images; the map loads only on request. On phones the default view is a searchable list and the entry page, not the map.

**I4. Shareable state.** Filters, view and selected entity live in the URL so an organiser can send a precise link.

---

## C. Contribution and governance

**C1. Every change is reviewed against this Bible** before merge. The PR template lists the sections.

**C2. Corrections from participants and descendants are a first-class route**, with a form that does not require GitHub.

**C3. Editorial authority sits with the maintainer** under S1a. Disagreements with other left traditions that are not on the "minor" list are recorded with each side's position and source, and the archive's own reading is labelled as its reading.

**C4. Licence:** content under a copyleft licence (CC BY-SA 4.0 recommended) so it cannot be enclosed.

---

## References (all from memory; verify before citing)

- Guha, Ranajit. "The Prose of Counter-Insurgency." *Subaltern Studies II*, 1983.
- Guha, Ranajit. *Elementary Aspects of Peasant Insurgency in Colonial India.* 1983.
- Thompson, E. P. *The Making of the English Working Class.* 1963.
- Trouillot, Michel-Rolph. *Silencing the Past: Power and the Production of History.* 1995.
- Haraway, Donna. "Situated Knowledges." *Feminist Studies*, 1988.
- Custers, Peter. *Women in the Tebhaga Uprising.* 1987.
- Lahiri, Abani. *Postwar Revolt of the Rural Poor in Bengal.* 2001.
- Sen, Sunil. *Agrarian Struggle in Bengal 1946–47.* 1972.
- Christen, Kimberly, et al. Mukurtu CMS (project, ongoing).
- Marx, Karl and Friedrich Engels. *Manifesto of the Communist Party.* 1848.
