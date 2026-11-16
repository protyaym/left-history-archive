// The status page. Everything here is computed in the browser from the same
// JSON snapshot the rest of the site reads (js/data.js loads it), plus two
// small config files:
//   config/blocklist.json  the banned-source list (Bible E3, E8)
//   config/project.json    the Studio, GitHub and site addresses to link to
// Nothing on this page talks to Sanity.

const KIND_LABEL = {
  movement: "Movements",
  event: "Events",
  person: "People",
  organization: "Organisations",
  text: "Texts",
  place: "Places",
};
const KIND_ORDER = ["movement", "event", "person", "organization", "text", "place"];

const LEVELS = [
  { key: "solid", label: "Solid", fill: "fill-solid" },
  { key: "thin", label: "Thin", fill: "fill-thin" },
  { key: "banned", label: "Banned sources only", fill: "fill-banned" },
  { key: "none", label: "No source", fill: "fill-none" },
];

// Each check returns true when the entry has the problem. "blocking" problems
// are the ones that should keep an entry off the site.
const PROBLEMS = [
  { key: "none", label: "No source recorded", blocking: true, test: (e) => e._level === "none" },
  { key: "banned", label: "Only banned sources (E3, E8)", blocking: true, test: (e) => e._level === "banned" },
  { key: "some_banned", label: "Cites a banned source beside good ones (E8)", blocking: false, test: (e) => e._level !== "banned" && e._blocked > 0 },
  { key: "note", label: "Open editor note (E5)", blocking: false, test: (e) => !!e.editor_note },
  { key: "contested", label: "“Contested” flag to rewrite as claims (E2)", blocking: false, test: (e) => e.contested === true },
  { key: "summary", label: "No summary", blocking: false, test: (e) => !e.summary_card },
  { key: "id", label: "Random id, needs a prefixed one", blocking: false, test: (e) => !/^(mv|ev|pe|org|tx|pl)_/.test(e.id) },
];

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

function isBanned(source, blocklist) {
  const haystack = `${source.citation || ""} ${source.url || ""}`.toLowerCase();
  return blocklist.patterns.some((p) => haystack.includes(p.match));
}

function annotate(entity, blocklist) {
  const sources = entity.sources || [];
  const blocked = sources.filter((s) => isBanned(s, blocklist)).length;
  const admissible = sources.length - blocked;
  entity._blocked = blocked;
  entity._level = sources.length === 0 ? "none" : admissible === 0 ? "banned" : admissible === 1 ? "thin" : "solid";
  const text = [entity.title, entity.name, entity.summary_card, entity.full_entry].join(" ");
  entity._bangla = /[ঀ-৿]/.test(text);
  entity._problems = PROBLEMS.filter((p) => p.test(entity));
}

function count(list, predicate) {
  return list.filter(predicate).length;
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// ---- Health ----

function renderTiles(entities) {
  const total = entities.length;
  const blocking = count(entities, (e) => e._level === "none" || e._level === "banned");
  const tiles = [
    { num: total, label: "Entries on the site", hint: "in the current snapshot" },
    { num: count(entities, (e) => e._level === "solid"), of: total, label: "Solidly sourced", hint: "two or more admissible sources" },
    { num: count(entities, (e) => e._level === "thin"), of: total, label: "Thinly sourced", hint: "one admissible source" },
    { num: blocking, of: total, label: "Fail the sourcing rules", hint: "no source, or banned sources only" },
    { num: count(entities, (e) => !!e.editor_note), label: "Open editor notes", hint: "questions not yet checked" },
    { num: count(entities, (e) => e._bangla), of: total, label: "Have Bangla text", hint: "any Bangla in title, summary or entry" },
  ];
  document.getElementById("tiles").innerHTML = tiles.map((t) => `
    <div class="tile">
      <div class="num">${t.num}${t.of != null ? ` <span class="of">of ${t.of}</span>` : ""}</div>
      <div class="label">${esc(t.label)}</div>
      <div class="hint">${esc(t.hint)}</div>
    </div>`).join("");
}

function renderSourcingBar(entities) {
  const total = entities.length || 1;
  const counts = LEVELS.map((level) => ({ ...level, n: count(entities, (e) => e._level === level.key) }));
  const bar = document.getElementById("sourcing-bar");
  bar.setAttribute("aria-label", "Sourcing of all entries: " + counts.map((c) => `${c.label} ${c.n}`).join(", "));
  bar.innerHTML = counts.filter((c) => c.n > 0).map((c) => (
    `<div class="seg ${c.fill}" style="flex:${c.n} 1 0" title="${esc(c.label)}: ${c.n} of ${entities.length} (${Math.round((c.n / total) * 100)}%)"></div>`
  )).join("");
  document.getElementById("sourcing-legend").innerHTML = counts.map((c) => (
    `<li><span class="swatch ${c.fill}"></span><span>${esc(c.label)} <b>${c.n}</b></span></li>`
  )).join("");
}

function renderTypeTable(entities) {
  const rows = KIND_ORDER.map((kind) => {
    const list = entities.filter((e) => e.type === kind);
    return { label: KIND_LABEL[kind], list };
  }).filter((row) => row.list.length > 0);
  rows.push({ label: "All", list: entities });

  const cells = (list) => LEVELS.map((level) => `<td class="n">${count(list, (e) => e._level === level.key)}</td>`).join("");
  document.getElementById("type-table").innerHTML = `
    <thead><tr>
      <th>Kind</th><th class="n">Entries</th>
      ${LEVELS.map((level) => `<th class="n">${esc(level.label)}</th>`).join("")}
      <th class="n">Editor notes</th>
    </tr></thead>
    <tbody>${rows.map((row) => `
      <tr>
        <td>${row.label === "All" ? "<b>All</b>" : esc(row.label)}</td>
        <td class="n">${row.list.length}</td>
        ${cells(row.list)}
        <td class="n">${count(row.list, (e) => !!e.editor_note)}</td>
      </tr>`).join("")}
    </tbody>`;
}

function renderSyncLine(sync) {
  const when = sync && formatDate(sync.synced_at);
  document.getElementById("sync-line").textContent = when
    ? `Snapshot last changed on ${when}.`
    : "The date of the last sync is not recorded yet.";
}

// ---- Route and setup ----

function link(url, text) {
  return `<a href="${esc(url)}">${esc(text)}</a>`;
}

function renderRoute(project) {
  const pending = (text) => `<span class="pending">${esc(text)}</span>`;
  const repo = project.repo_url;
  const steps = [
    {
      name: "Sanity Studio",
      what: "The editing screens. The only place content is changed.",
      where: project.studio_url ? link(project.studio_url, "Open the Studio") : pending("Not deployed yet. Runs on your own machine for now."),
    },
    {
      name: "Sanity dataset",
      what: "Where the content is stored. Public to read.",
      where: `Project <code>${esc(project.sanity_project_id)}</code>, dataset <code>${esc(project.sanity_dataset)}</code>`,
    },
    {
      name: "Sync robot",
      what: "A GitHub Action. Pulls published entries, runs the validator, stops on an error.",
      where: repo ? link(`${repo}/actions`, "See the runs") : pending("Starts once the repository is on GitHub."),
    },
    {
      name: "Snapshot in git",
      what: "The JSON files in site/data/. Every change is kept in history.",
      where: repo ? link(`${repo}/commits/main/site/data`, "See the history") : pending("Local only for now."),
    },
    {
      name: "Netlify",
      what: "Sees the new commit and publishes this website.",
      where: project.site_url ? link(project.site_url, "Open the public site") : pending("Not connected yet."),
    },
  ];
  document.getElementById("route-list").innerHTML = steps.map((s) => `
    <li>
      <span class="name">${esc(s.name)}</span>
      <span class="what">${esc(s.what)}</span>
      <span class="where">${s.where}</span>
    </li>`).join("");
}

function renderSetup(project) {
  const todo = [];
  if (!project.repo_url) {
    todo.push("<b>Put the repository on GitHub.</b> Create an empty repository named <code>left-history-archive</code>, push this folder to it, then archive the three old repositories.");
  }
  if (!project.site_url) {
    todo.push("<b>Connect Netlify.</b> In Netlify choose <b>Add new site</b>, then <b>Import an existing project</b>, pick the repository and accept the settings it reads from <code>netlify.toml</code>.");
  }
  if (!project.studio_url) {
    todo.push("<b>Deploy the Studio.</b> Install Node, open a terminal in <code>studio/</code> and run <code>npx sanity deploy</code>. It asks for a name and gives you a <code>.sanity.studio</code> address.");
  }
  if (todo.length === 0) {
    document.getElementById("setup").innerHTML = "";
    return;
  }
  document.getElementById("setup").innerHTML = `
    <div class="setup-box">
      <h4>Setup still to do</h4>
      <ol>${todo.map((t) => `<li>${t}</li>`).join("")}</ol>
      <p class="section-note">After each one, put the new address in <code>site/config/project.json</code>. This box shrinks as the addresses are filled in, and the links above start working.</p>
    </div>`;
}

function renderEditingSteps(project) {
  document.getElementById("open-studio").innerHTML = project.studio_url
    ? `<p>Open ${link(project.studio_url, "the Studio")} in any browser and sign in.</p>`
    : `<p>The Studio is not deployed yet, so it runs on your own machine. Open a terminal in the <code>studio/</code> folder, run <code>npm install</code> once, then <code>npm run dev</code>, and open <code>http://localhost:3333</code>. This needs Node. Once the Studio is deployed, this becomes a single web address.</p>`;

  const actions = project.repo_url ? link(`${project.repo_url}/actions`, "the Actions tab of the repository") : "the repository on GitHub, then its <b>Actions</b> tab";
  const steps = [
    `Open ${actions}.`,
    "In the list on the left, click <b>Sync content from Sanity</b>.",
    "Click <b>Run workflow</b>, then the green <b>Run workflow</b> button in the small panel that opens.",
    "Wait about a minute. A green tick means the snapshot was updated. A red cross means the validator found an error: click the run to read which entry broke which rule. The public site stays as it was until that is fixed.",
    "Netlify publishes about a minute after the green tick. Reload the site, then check the numbers on this page.",
  ];
  document.getElementById("send-steps").innerHTML = steps.map((s) => `<li>${s}</li>`).join("");
}

// ---- Worklist ----

function renderWorklist(entities, project) {
  const studio = (project.studio_url || "http://localhost:3333").replace(/\/$/, "");
  const withProblems = entities.filter((e) => e._problems.length > 0);
  const select = document.getElementById("problem-filter");

  const options = [
    { value: "blocking", label: "Sourcing failures", match: (e) => e._problems.some((p) => p.blocking) },
    ...PROBLEMS.map((p) => ({ value: p.key, label: p.label, match: (e) => e._problems.some((q) => q.key === p.key) })),
    { value: "all", label: "Everything", match: () => true },
  ].map((o) => ({ ...o, n: count(withProblems, o.match) })).filter((o) => o.n > 0 || o.value === "blocking");

  select.innerHTML = options.map((o) => `<option value="${o.value}">${esc(o.label)} (${o.n})</option>`).join("");

  function draw() {
    const option = options.find((o) => o.value === select.value) || options[0];
    const list = withProblems.filter(option.match).sort((a, b) => {
      const weight = (e) => (e._problems.some((p) => p.blocking) ? 0 : 1);
      return weight(a) - weight(b) || entityName(a).localeCompare(entityName(b));
    });
    document.getElementById("worklist-count").textContent = `${list.length} of ${entities.length} entries`;
    document.getElementById("worklist-items").innerHTML = list.length === 0
      ? `<li class="empty">Nothing here.</li>`
      : list.map((e) => `
        <li>
          <span>
            <a class="entry-name" href="entity.html?id=${encodeURIComponent(e.id)}">${esc(entityName(e) || e.id)}</a>
            <span class="kind">${esc(e.type)}</span>
          </span>
          <a class="studio-link" href="${esc(studio)}/intent/edit/id=${encodeURIComponent(e.id)}">Open in Studio</a>
          <span class="problems">${e._problems.map((p) => `<span class="chip${p.blocking ? " blocking" : ""}">${esc(p.label)}</span>`).join("")}</span>
        </li>`).join("");
  }

  select.addEventListener("change", draw);
  draw();
}

async function main() {
  const [, blocklist, project, sync] = await Promise.all([
    loadData(),
    getJson("config/blocklist.json", { patterns: [] }),
    getJson("config/project.json", {}),
    getJson("data/sync.json", null),
  ]);

  const entities = Object.values(allEntities);
  entities.forEach((e) => annotate(e, blocklist));

  renderSyncLine(sync);
  renderTiles(entities);
  renderSourcingBar(entities);
  renderTypeTable(entities);
  renderRoute(project);
  renderSetup(project);
  renderEditingSteps(project);
  renderWorklist(entities, project);
}

main();
