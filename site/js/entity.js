// The entry page. Most readers arrive here straight from a shared link or a
// search and never see the home page, so this page has to explain itself:
// what the entry is, how well it is sourced, and where to go next.

function getRequestedId() {
  return new URLSearchParams(window.location.search).get("id");
}

function words(relationType) {
  return String(relationType || "").replace(/_/g, " ");
}

function linkTo(entity) {
  return `<a href="${entityUrl(entity.id)}">${esc(entityName(entity) || "Untitled entry")}</a>`;
}

function byDate(a, b) {
  return (entityDecimalYear(a) ?? 9999) - (entityDecimalYear(b) ?? 9999) || entityName(a).localeCompare(entityName(b));
}

// Events that say they are "part of" the given entry, in date order.
function eventsWithin(id) {
  return (incomingLinks[id] || [])
    .filter((l) => l.type === "part_of" && allEntities[l.from] && allEntities[l.from].type === "event")
    .map((l) => allEntities[l.from])
    .sort(byDate);
}

// ---- Sections ----

function sourcingHtml(entity) {
  const s = sourcing(entity);
  const text = {
    solid: ["Sourced", `This entry rests on ${s.admissible} sources the archive accepts.`],
    thin: ["Thinly sourced", "This entry rests on one source the archive accepts. Read it as a starting point."],
    banned: ["Not yet verified", "The only sources so far are study-notes sites or Wikipedia, which this archive does not accept as a basis. Treat this entry as a lead, not a reference."],
    none: ["Not yet verified", "No source has been recorded for this entry yet."],
  }[s.level];
  return `
    <aside class="sourcing level-${s.level}">
      <span class="sourcing-mark" aria-hidden="true"></span>
      <p><b>${text[0]}.</b> ${text[1]} <a href="#sources">See the sources</a></p>
    </aside>`;
}

function placeHtml(entity) {
  if (entity.type !== "place") return "";
  const rows = [];
  if (entity.admin_pre1947) rows.push(`<div><dt>Before 1947</dt><dd>${esc(entity.admin_pre1947)}</dd></div>`);
  if (entity.admin_post1947) rows.push(`<div><dt>After 1947</dt><dd>${esc(entity.admin_post1947)}</dd></div>`);
  return rows.length ? `<dl class="then-now">${rows.join("")}</dl>` : "";
}

function whatHappenedHtml(entity) {
  const events = eventsWithin(entity.id);
  if (events.length === 0) return "";
  return `
    <section>
      <h2>What happened, in order</h2>
      <ol class="sequence">
        ${events.map((ev) => `
          <li>
            <span class="when">${esc(entityDateLabel(ev))}</span>
            <span class="what">${linkTo(ev)}${ev.summary_card ? `<span class="what-summary">${esc(ev.summary_card)}</span>` : ""}</span>
          </li>`).join("")}
      </ol>
    </section>`;
}

// For an event: the event before it and after it inside the same movement.
function beforeAfterHtml(entity) {
  if (entity.type !== "event") return "";
  const parentRel = (entity.relationships || []).find((r) => r.type === "part_of" && allEntities[r.target]);
  if (!parentRel) return "";
  const parent = allEntities[parentRel.target];
  const siblings = eventsWithin(parent.id);
  const index = siblings.findIndex((e) => e.id === entity.id);
  if (index === -1) return "";
  const previous = siblings[index - 1];
  const next = siblings[index + 1];
  const cell = (label, ev) => (ev
    ? `<a class="step" href="${entityUrl(ev.id)}"><span class="step-label">${label}</span><span class="step-name">${esc(entityName(ev))}</span><span class="step-date">${esc(entityDateLabel(ev))}</span></a>`
    : `<span class="step empty"><span class="step-label">${label}</span><span class="step-name">${label === "Before this" ? "This is the first event recorded" : "This is the last event recorded"}</span></span>`);
  return `
    <section>
      <h2>Within ${linkTo(parent)}</h2>
      <div class="before-after">${cell("Before this", previous)}${cell("After this", next)}</div>
    </section>`;
}

// Everything linked to this entry, in either direction, grouped by kind.
function connectedHtml(entity) {
  const listedAbove = new Set(eventsWithin(entity.id).map((e) => e.id));
  const links = new Map(); // other id -> phrase

  (entity.relationships || []).forEach((rel) => {
    if (!allEntities[rel.target] || links.has(rel.target)) return;
    links.set(rel.target, { phrase: words(rel.type), outgoing: true });
  });
  (incomingLinks[entity.id] || []).forEach((l) => {
    if (links.has(l.from) || listedAbove.has(l.from)) return;
    links.set(l.from, { phrase: `${words(l.type)} this`, outgoing: false });
  });

  if (links.size === 0) return "";

  const groups = KIND_ORDER.map((kind) => {
    const items = [...links.entries()]
      .map(([id, link]) => ({ other: allEntities[id], link }))
      .filter((item) => item.other.type === kind)
      .sort((a, b) => (kind === "event" || kind === "movement" ? byDate(a.other, b.other) : entityName(a.other).localeCompare(entityName(b.other))));
    if (items.length === 0) return "";
    return `
      <h3>${esc(KIND_PLURAL[kind])}</h3>
      <ul class="connected">
        ${items.map(({ other, link }) => `
          <li>${link.outgoing
            ? `<span class="rel">${esc(link.phrase)}</span> ${linkTo(other)}`
            : `${linkTo(other)} <span class="rel">${esc(link.phrase)}</span>`}</li>`).join("")}
      </ul>`;
  }).join("");

  return `<section><h2>Connected entries</h2>${groups}</section>`;
}

function sourcesSectionHtml(entity) {
  const sources = entity.sources || [];
  const body = sources.length === 0
    ? `<p>No source has been recorded yet.</p>`
    : `<ol class="source-list">
        ${sources.map((s) => {
          const citation = s.url
            ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.citation)}</a>`
            : esc(s.citation);
          const banned = isBannedSource(s);
          return `<li>${citation}
            <span class="source-tags">
              ${s.type ? `<span class="source-tag">${esc(s.type)} source</span>` : ""}
              ${banned ? `<span class="source-tag lead-only">research lead only, to be replaced</span>` : ""}
            </span></li>`;
        }).join("")}
      </ol>`;
  return `<section id="sources"><h2>Sources</h2>${body}</section>`;
}

function shareHtml() {
  return `
    <div class="share">
      <button type="button" id="share-button">Share this entry</button>
      <span id="share-done" role="status"></span>
    </div>`;
}

function wireShare(entity) {
  const button = document.getElementById("share-button");
  const done = document.getElementById("share-done");
  if (!button) return;
  button.addEventListener("click", async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: entityName(entity), url });
      } else {
        await navigator.clipboard.writeText(url);
        done.textContent = "Link copied.";
      }
    } catch (e) {
      if (e && e.name === "AbortError") return; // the reader closed the share sheet
      done.textContent = "Copy the address from the bar above.";
    }
  });
}

function renderEntityPage(entity) {
  const page = document.getElementById("entry");

  if (!entity) {
    page.innerHTML = `
      <h1>Entry not found</h1>
      <p>There is no entry at this address. It may have been renamed or taken down.</p>
      <p><a href="index.html">Search or browse all entries</a></p>`;
    return;
  }

  const name = entityName(entity) || "Untitled entry";
  const kind = KIND_LABEL[entity.type] || entity.type;
  const meta = entityMetaParts(entity);
  const onMap = (entity.type === "movement" || entity.type === "event") && entity.place && entity.place.coordinates;
  const summary = entity.summary_card || entity.note || "";

  document.title = `${name} — Left history archive`;
  const description = document.querySelector('meta[name="description"]');
  if (description && summary) description.setAttribute("content", summary);

  page.innerHTML = `
    <nav class="crumbs" aria-label="Where you are">
      <a href="index.html">Browse</a> <span aria-hidden="true">›</span>
      <a href="index.html?kind=${encodeURIComponent(entity.type)}">${esc(KIND_PLURAL[entity.type] || kind)}</a>
    </nav>

    <header class="entry-head">
      <div class="entry-kind">${esc(kind)}</div>
      <h1>${esc(name)}</h1>
      ${meta.length ? `<p class="entry-meta">${esc(meta.join(" · "))}</p>` : ""}
    </header>

    ${summary ? `<p class="entry-lead">${esc(summary)}</p>` : ""}
    ${sourcingHtml(entity)}
    ${placeHtml(entity)}

    ${entity.full_entry ? `<div class="entry-text"><p>${esc(entity.full_entry)}</p></div>` : `<p class="entry-pending">The full entry has not been written yet.</p>`}

    ${entity.contested ? `
      <aside class="notice differ">
        <h2>Accounts differ</h2>
        <p>This entry is flagged because sources disagree or are too thin to settle a point. The archive is rewriting these flags so that each disputed point shows who says what.</p>
      </aside>` : ""}

    ${entity.editor_note ? `
      <aside class="notice open-question">
        <h2>What we have not verified yet</h2>
        <p>${esc(entity.editor_note)}</p>
      </aside>` : ""}

    ${whatHappenedHtml(entity)}
    ${beforeAfterHtml(entity)}
    ${connectedHtml(entity)}
    ${sourcesSectionHtml(entity)}

    <div class="entry-actions">
      ${shareHtml()}
      ${onMap ? `<a href="map.html?focus=${encodeURIComponent(entity.id)}">See it on the map</a>` : ""}
      <a href="index.html?kind=${encodeURIComponent(entity.type)}">All ${esc((KIND_PLURAL[entity.type] || kind).toLowerCase())}</a>
    </div>
  `;

  wireShare(entity);
}

async function main() {
  await loadData();
  renderEntityPage(allEntities[getRequestedId()]);
}

main();
