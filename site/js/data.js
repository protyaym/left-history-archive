// Shared by every page. Loads the JSON snapshot and the banned-source list,
// and holds the helpers that more than one page needs. Load this script first.

const DATA_FILES = [
  "data/movements.json",
  "data/events.json",
  "data/people.json",
  "data/organizations.json",
  "data/texts.json",
  "data/places.json",
];

// Reader-facing names for the kinds of entry. The word "entity" and the
// internal ids never appear in the interface (Bible V5).
const KIND_ORDER = ["movement", "event", "person", "organization", "place", "text"];
const KIND_LABEL = {
  movement: "Movement",
  event: "Event",
  person: "Person",
  organization: "Organisation",
  place: "Place",
  text: "Text",
};
const KIND_PLURAL = {
  movement: "Movements",
  event: "Events",
  person: "People",
  organization: "Organisations",
  place: "Places",
  text: "Texts",
};

let allEntities = {}; // id -> entry, across every kind
let incomingLinks = {}; // id -> [{ from, type }], the relationships that point AT an entry
let blocklist = { patterns: [] };

function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

async function getJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(response.status);
    return await response.json();
  } catch (e) {
    return fallback;
  }
}

async function loadData() {
  const [files, list] = await Promise.all([
    Promise.all(DATA_FILES.map((f) => fetch(f).then((r) => r.json()))),
    getJson("config/blocklist.json", { patterns: [] }),
  ]);
  blocklist = list;
  files.flat().forEach((entity) => { allEntities[entity.id] = entity; });
  Object.values(allEntities).forEach((entity) => {
    (entity.relationships || []).forEach((rel) => {
      (incomingLinks[rel.target] = incomingLinks[rel.target] || []).push({ from: entity.id, type: rel.type });
    });
  });
}

function entityName(entity) {
  return entity ? (entity.title || entity.name || "").trim() : null;
}

function entityUrl(id) {
  return `entity.html?id=${encodeURIComponent(id)}`;
}

// ---- Dates ----

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// "1946-09" -> "September 1946", "1950-12-16" -> "16 December 1950", "1946" -> "1946"
function prettyDate(raw) {
  if (!raw) return "";
  const [year, month, day] = String(raw).split("-");
  const monthName = month ? MONTHS[parseInt(month, 10) - 1] : null;
  if (!monthName) return year;
  return day ? `${parseInt(day, 10)} ${monthName} ${year}` : `${monthName} ${year}`;
}

// Decimal year (e.g. 1946.75) so month-level dates place sensibly on the timeline
// and so two events in the same year don't automatically collide.
function entityDecimalYear(entity) {
  const raw = (entity.period && entity.period.start) || entity.date || entity.founded;
  if (!raw) return null;
  const parts = String(raw).split("-");
  const year = parseInt(parts[0], 10);
  const month = parts[1] ? parseInt(parts[1], 10) : 1;
  const day = parts[2] ? parseInt(parts[2], 10) : 1;
  if (Number.isNaN(year)) return null;
  return year + (month - 1) / 12 + (day - 1) / 365;
}

function entityDateLabel(entity) {
  if (entity.period && entity.period.start) {
    const start = prettyDate(entity.period.start);
    const end = prettyDate(entity.period.end);
    return end ? `${start} to ${end}` : `from ${start}`;
  }
  if (entity.type === "text" && entity.date) return `published ${prettyDate(entity.date)}`;
  if (entity.date) return prettyDate(entity.date);
  if (entity.founded) return `founded ${prettyDate(entity.founded)}`;
  return "";
}

// The short line under a name: role, date, place. Only the parts that exist.
function entityMetaParts(entity) {
  const parts = [];
  if (entity.role) parts.push(entity.role);
  const date = entityDateLabel(entity);
  if (date) parts.push(date);
  if (entity.place && entity.place.name) parts.push(entity.place.name);
  return parts;
}

// ---- Sourcing (Bible E3, E8) ----

function isBannedSource(source) {
  const haystack = `${source.citation || ""} ${source.url || ""}`.toLowerCase();
  return blocklist.patterns.some((p) => haystack.includes(p.match));
}

// level: "solid" (two or more admissible sources), "thin" (one),
// "banned" (sources exist but every one is on the banned list), "none".
function sourcing(entity) {
  const sources = entity.sources || [];
  const banned = sources.filter(isBannedSource).length;
  const admissible = sources.length - banned;
  const level = sources.length === 0 ? "none" : admissible === 0 ? "banned" : admissible === 1 ? "thin" : "solid";
  return { level, total: sources.length, admissible, banned };
}

function isUnverified(entity) {
  const level = sourcing(entity).level;
  return level === "none" || level === "banned";
}

// ---- Used by the map and timeline card (js/app.js) ----

function markerColor(entity) {
  if (entity.contested) return "#A33B2E"; // oxide
  if (entity.type === "movement") return "#C99A3E"; // gold
  return "#5B6B4F"; // leaf, for events
}

function tagsHtml(entity) {
  const tags = [`<span class="tag type-${esc(entity.type)}">${esc(KIND_LABEL[entity.type] || entity.type)}</span>`];
  if (entity.contested) tags.push(`<span class="tag contested">accounts differ</span>`);
  return tags.join("");
}

function relationshipsHtml(entity, asLink) {
  const rels = entity.relationships || [];
  if (rels.length === 0) return "<li>None recorded yet.</li>";
  return rels.map((rel) => {
    const target = allEntities[rel.target];
    const name = esc(target ? entityName(target) : rel.target);
    const label = esc(rel.type.replace(/_/g, " "));
    const value = asLink && target ? `<a href="${entityUrl(rel.target)}">${name}</a>` : name;
    return `<li><strong>${label}</strong> — ${value}</li>`;
  }).join("");
}

function sourcesHtml(entity) {
  const sources = entity.sources || [];
  if (sources.length === 0) return "<div>No sources recorded yet. Do not treat as verified.</div>";
  return sources.map((s) => {
    const citation = s.url
      ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.citation)}</a>`
      : esc(s.citation);
    return `<div>&middot; ${citation}${s.type ? ` (${esc(s.type)})` : ""}</div>`;
  }).join("");
}
