// The home page: search and a browsable list of every entry. The map is a
// separate page, opened on request (Bible I1, I3). The search text and the
// chosen kind live in the URL so a view can be shared (Bible I4).

const state = { q: "", kind: "all" };

function readState() {
  const params = new URLSearchParams(window.location.search);
  state.q = (params.get("q") || "").trim();
  const kind = params.get("kind");
  state.kind = KIND_ORDER.includes(kind) ? kind : "all";
}

function writeState() {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.kind !== "all") params.set("kind", state.kind);
  const query = params.toString();
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

// Lower case, accents removed, so "Kakdwip" finds "Kākdwip".
function normalise(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function searchText(entity) {
  if (!entity._search) {
    entity._searchName = normalise(entityName(entity));
    entity._search = normalise([
      entityName(entity), entity.role, entity.summary_card,
      entity.place && entity.place.name, entity.admin_pre1947, entity.admin_post1947, entity.note,
    ].join(" "));
  }
  return entity._search;
}

// Lower is better. null means no match.
function matchScore(entity, words) {
  const text = searchText(entity);
  if (!words.every((w) => text.includes(w))) return null;
  const name = entity._searchName;
  if (name.startsWith(words[0])) return 0;
  if (words.every((w) => name.includes(w))) return 1;
  return 2;
}

function byName(a, b) {
  return entityName(a).localeCompare(entityName(b));
}

// Movements and events read best in date order. Everything else is
// alphabetical, with entries that have no accepted source after the rest.
function sortForKind(kind, list) {
  if (kind === "movement" || kind === "event") {
    return list.slice().sort((a, b) => (entityDecimalYear(a) ?? 9999) - (entityDecimalYear(b) ?? 9999) || byName(a, b));
  }
  return list.slice().sort((a, b) => (isUnverified(a) - isUnverified(b)) || byName(a, b));
}

function rowHtml(entity, showKind) {
  const meta = entityMetaParts(entity);
  if (showKind) meta.unshift(KIND_LABEL[entity.type] || entity.type);
  const summary = entity.summary_card || entity.note || "";
  return `
    <li class="row">
      <a class="row-name" href="${entityUrl(entity.id)}">${esc(entityName(entity) || "Untitled entry")}</a>
      ${meta.length ? `<div class="row-meta">${esc(meta.join(" · "))}</div>` : ""}
      ${summary ? `<p class="row-summary">${esc(summary)}</p>` : ""}
      ${isUnverified(entity) ? `<span class="unverified">Not yet verified</span>` : ""}
    </li>`;
}

function renderStartHere(entities) {
  const section = document.getElementById("start-here");
  const movements = sortForKind("movement", entities.filter((e) => e.type === "movement" && e.summary_card));
  if (state.q || state.kind !== "all" || movements.length === 0) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  document.getElementById("start-cards").innerHTML = movements.map((m) => {
    const events = (incomingLinks[m.id] || []).filter((l) => l.type === "part_of" && allEntities[l.from].type === "event").length;
    const facts = [entityDateLabel(m), events ? `${events} events` : ""].filter(Boolean).join(" · ");
    return `
      <a class="start-card" href="${entityUrl(m.id)}">
        <span class="start-kind">Movement</span>
        <span class="start-title">${esc(entityName(m))}</span>
        <span class="start-facts">${esc(facts)}</span>
        <span class="start-summary">${esc(m.summary_card)}</span>
      </a>`;
  }).join("");
}

function renderKinds(matches) {
  const counts = { all: matches.length };
  KIND_ORDER.forEach((kind) => { counts[kind] = matches.filter((e) => e.type === kind).length; });
  const chips = [{ key: "all", label: "All" }, ...KIND_ORDER.map((kind) => ({ key: kind, label: KIND_PLURAL[kind] }))];
  document.getElementById("kinds").innerHTML = chips.map((chip) => `
    <button type="button" class="kind-chip" data-kind="${chip.key}" aria-pressed="${state.kind === chip.key}">
      ${esc(chip.label)} <span class="n">${counts[chip.key]}</span>
    </button>`).join("");
}

function render() {
  const entities = Object.values(allEntities);
  const words = normalise(state.q).split(/\s+/).filter(Boolean);

  let matches = entities;
  if (words.length) {
    matches = entities
      .map((entity) => ({ entity, score: matchScore(entity, words) }))
      .filter((m) => m.score !== null)
      .sort((a, b) => a.score - b.score || byName(a.entity, b.entity))
      .map((m) => m.entity);
  }

  renderStartHere(entities);
  renderKinds(matches);

  const shown = state.kind === "all" ? matches : matches.filter((e) => e.type === state.kind);
  const results = document.getElementById("results");
  const line = document.getElementById("result-line");
  document.getElementById("browse-heading").textContent = words.length ? "Search results" : "Browse everything";

  if (shown.length === 0) {
    line.textContent = "";
    results.innerHTML = `<p class="no-results">Nothing found for “${esc(state.q)}”${state.kind !== "all" ? ` in ${esc(KIND_PLURAL[state.kind].toLowerCase())}` : ""}. Try a shorter spelling. Names are in English only for now.</p>`;
    return;
  }

  if (words.length) {
    line.textContent = `${shown.length} ${shown.length === 1 ? "entry" : "entries"} for “${state.q}”`;
    results.innerHTML = `<ul class="rows">${shown.map((e) => rowHtml(e, true)).join("")}</ul>`;
  } else if (state.kind === "all") {
    line.textContent = `${shown.length} entries`;
    results.innerHTML = KIND_ORDER.map((kind) => {
      const list = sortForKind(kind, shown.filter((e) => e.type === kind));
      if (list.length === 0) return "";
      return `<h3 class="group-heading">${esc(KIND_PLURAL[kind])} <span class="n">${list.length}</span></h3>
        <ul class="rows">${list.map((e) => rowHtml(e, false)).join("")}</ul>`;
    }).join("");
  } else {
    line.textContent = `${shown.length} ${KIND_PLURAL[state.kind].toLowerCase()}`;
    results.innerHTML = `<ul class="rows">${sortForKind(state.kind, shown).map((e) => rowHtml(e, false)).join("")}</ul>`;
  }
}

async function main() {
  readState();
  const input = document.getElementById("q");
  input.value = state.q;

  await loadData();
  render();

  input.addEventListener("input", () => {
    state.q = input.value.trim();
    writeState();
    render();
  });
  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    input.blur();
  });
  document.getElementById("kinds").addEventListener("click", (e) => {
    const chip = e.target.closest(".kind-chip");
    if (!chip) return;
    state.kind = chip.dataset.kind;
    writeState();
    render();
  });
}

main();
