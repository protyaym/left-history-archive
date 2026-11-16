#!/usr/bin/env node
// Applies a source review (tools/source-review/<name>.json) to the Sanity dataset.
//
// Plain Node 18 or later, no dependencies. Runs on GitHub ("Apply source review"
// workflow) or locally.
//
// Dry run, the default: reads the live entries and prints every change, writes nothing.
// Needs no token, because the dataset is public.
//   node tools/apply-source-review.js tools/source-review/2026-11.json
//
// Apply: writes the changes in one transaction (all or nothing).
//   SANITY_WRITE_TOKEN=... node tools/apply-source-review.js tools/source-review/2026-11.json --apply
//
// What it does to each entry under "entries":
//   - removes sources on the banned list (site/config/blocklist.json)
//   - adds the review's sources, with the page in the citation
//   - replaces the editor note with the review's note, or removes it
//   - applies any rewritten text (title, summary, full entry, role)
// Entries under "alsoRemoveBannedFrom" only lose their banned sources.
// Entries under "holdBack" get published: false, which takes them off the site
// at the next sync. Nothing is deleted.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PROJECT_ID = "p90vg6so";
const DATASET = "production";
const API = "v2024-01-01";

const planPath = process.argv[2];
const apply = process.argv.includes("--apply");
const token = process.env.SANITY_WRITE_TOKEN || "";

if (!planPath) {
  console.error("Usage: node tools/apply-source-review.js <review.json> [--apply]");
  process.exit(1);
}
if (apply && !token) {
  console.error("--apply needs SANITY_WRITE_TOKEN (a Sanity API token with Editor rights).");
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const blocklist = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "site", "config", "blocklist.json"), "utf8")
);

// Field names in Sanity, for the keys used in the review file.
const TEXT_FIELDS = { title: "title", summaryCard: "summaryCard", fullEntry: "fullEntry", role: "role" };

function isBanned(source) {
  const haystack = `${source.citation || ""} ${source.url || ""}`.toLowerCase();
  return blocklist.patterns.some((p) => haystack.includes(p.match));
}

function key() {
  return crypto.randomBytes(6).toString("hex");
}

// One citation per work: two pages of the same book are one source, not two,
// so the site's sourcing level counts works, not page references.
function sourceItems(refs) {
  const byWork = new Map();
  refs.forEach((ref) => {
    if (!plan.sources[ref.source]) throw new Error(`Unknown source "${ref.source}"`);
    if (!byWork.has(ref.source)) byWork.set(ref.source, []);
    byWork.get(ref.source).push(ref.where);
  });
  return [...byWork.entries()].map(([work, wheres]) => {
    const lib = plan.sources[work];
    const item = { _type: "sourceItem", _key: key(), citation: `${lib.citation}, ${wheres.join("; ")}`, sourceType: lib.sourceType };
    if (lib.url) item.url = lib.url;
    return item;
  });
}

async function query(groq, params) {
  const host = token ? "api.sanity.io" : "apicdn.sanity.io";
  const url = new URL(`https://${PROJECT_ID}.${host}/${API}/data/query/${DATASET}`);
  url.searchParams.set("query", groq);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(`$${k}`, JSON.stringify(v)));
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error(`Sanity query failed: HTTP ${res.status} ${await res.text()}`);
  return (await res.json()).result;
}

async function mutate(mutations) {
  const url = `https://${PROJECT_ID}.api.sanity.io/${API}/data/mutate/${DATASET}?returnIds=true`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Sanity mutation failed: HTTP ${res.status} ${body}`);
  return JSON.parse(body);
}

function short(text, n = 110) {
  const s = String(text || "").replace(/\s+/g, " ");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

async function main() {
  const reviewed = plan.entries.map((e) => e.id);
  const ids = [...new Set([...reviewed, ...plan.alsoRemoveBannedFrom, ...plan.holdBack.map((h) => h.id)])];

  const docs = await query("*[_id in $ids]{_id, _type, title, name, sources, editorNote, published, contested}", { ids });
  const byId = Object.fromEntries(docs.map((d) => [d._id, d]));

  const missing = ids.filter((id) => !byId[id]);
  if (missing.length) {
    throw new Error(`These ids are not in the dataset, so nothing was changed: ${missing.join(", ")}`);
  }

  // Unsaved Studio drafts would hide these changes in the Studio. Only visible with a token.
  if (token) {
    const drafts = await query("*[_id in $ids]._id", { ids: ids.map((id) => `drafts.${id}`) });
    if (drafts.length) {
      console.log(`Warning: ${drafts.length} entries have unpublished drafts in the Studio, which will still show the old text there:`);
      drafts.forEach((d) => console.log(`  - ${d}`));
      console.log("");
    }
  } else {
    console.log("No token: reading the public data. Unpublished Studio drafts cannot be checked.\n");
  }

  const clear = new Set((plan.clearContested && plan.clearContested.ids) || []);
  const mutations = [];
  let added = 0;
  let removed = 0;

  for (const entry of plan.entries) {
    const doc = byId[entry.id];
    const kept = (doc.sources || []).filter((s) => !isBanned(s));
    const dropped = (doc.sources || []).filter(isBanned);
    const existing = new Set(kept.map((s) => s.citation));
    const fresh = sourceItems(entry.add).filter((s) => !existing.has(s.citation));
    const set = { sources: [...kept, ...fresh] };
    const unset = [];

    if (entry.note) set.editorNote = `Source review ${plan.date}: ${entry.note}`;
    else if (doc.editorNote) unset.push("editorNote");

    Object.entries(entry.text || {}).forEach(([k, v]) => {
      if (!TEXT_FIELDS[k]) throw new Error(`${entry.id}: unknown text field "${k}"`);
      set[TEXT_FIELDS[k]] = v;
    });
    if (clear.has(entry.id) && doc.contested) set.contested = false;

    added += fresh.length;
    removed += dropped.length;
    mutations.push({ patch: { id: entry.id, set, ...(unset.length ? { unset } : {}) } });

    console.log(`${entry.id}  (${doc.title || doc.name})`);
    dropped.forEach((s) => console.log(`   - remove  ${short(s.citation)}`));
    fresh.forEach((s) => console.log(`   + add     ${short(s.citation)}`));
    Object.keys(entry.text || {}).forEach((k) => console.log(`   ~ rewrite ${k}: ${short(entry.text[k], 90)}`));
    if (set.editorNote) console.log(`   ~ note    ${short(set.editorNote, 90)}`);
    if (unset.length) console.log("   ~ note    removed (resolved by this review)");
    if (set.contested === false) console.log("   ~ contested flag cleared (was thin sourcing, not disagreement)");
    console.log(`   = ${set.sources.length} source(s) after\n`);
  }

  for (const id of plan.alsoRemoveBannedFrom) {
    const doc = byId[id];
    const dropped = (doc.sources || []).filter(isBanned);
    const kept = (doc.sources || []).filter((s) => !isBanned(s));
    if (dropped.length === 0) continue;
    if (kept.length === 0) throw new Error(`${id} would be left with no source; review it instead.`);
    removed += dropped.length;
    mutations.push({ patch: { id, set: { sources: kept } } });
    console.log(`${id}  (${doc.title || doc.name})`);
    dropped.forEach((s) => console.log(`   - remove  ${short(s.citation)}`));
    console.log(`   = ${kept.length} source(s) after\n`);
  }

  for (const hold of plan.holdBack) {
    const doc = byId[hold.id];
    console.log(`${hold.id}  (${doc.title || doc.name || "untitled"})`);
    console.log(`   ! hold back: published -> false. ${short(hold.why, 120)}\n`);
    mutations.push({
      patch: { id: hold.id, set: { published: false, editorNote: `Source review ${plan.date}: held back. ${hold.why}` } },
    });
  }

  console.log("Summary");
  console.log(`  ${plan.entries.length} entries reviewed, ${plan.holdBack.length} held back`);
  console.log(`  ${added} sources added, ${removed} banned sources removed`);
  console.log(`  ${mutations.length} documents changed in one transaction\n`);

  if (!apply) {
    console.log("Dry run: nothing was written. Run again with --apply to write these changes.");
    return;
  }
  const result = await mutate(mutations);
  console.log(`Applied. Transaction ${result.transactionId}.`);
  console.log("Run the 'Sync content from Sanity' workflow to put the changes on the site.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
