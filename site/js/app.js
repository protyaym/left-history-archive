// The map/timeline explorer. Entity loading, colors, and the relationship/source
// rendering helpers now live in js/data.js (shared with entity.html) -- this
// file only handles the map, the timeline, the card overlay, and filters.

let map, markerLayer;
let timelineRange = { min: 1900, max: 2020 }; // recomputed from data once loaded

// Shared by both the map and the timeline, so filters behave identically in both views.
function getVisibleEntities() {
  const showMovements = document.getElementById("filter-movements").checked;
  const showEvents = document.getElementById("filter-events").checked;
  const yearCutoff = parseInt(document.getElementById("decade").value, 10);
  const regionFilter = document.getElementById("region").value;

  return Object.values(allEntities).filter((entity) => {
    if (!entity.place || !entity.place.coordinates) return false;
    if (entity.type === "movement" && !showMovements) return false;
    if (entity.type === "event" && !showEvents) return false;
    if (entity.type !== "movement" && entity.type !== "event") return false;

    const year = entityDecimalYear(entity);
    if (year && year > yearCutoff) return false;

    if (regionFilter !== "all") {
      const placeName = entity.place.name.toLowerCase();
      if (regionFilter === "bengal_india" && placeName.includes("pakistan")) return false;
      if (regionFilter === "east_pakistan" && !placeName.includes("pakistan") && !placeName.includes("nachole")) return false;
    }
    return true;
  });
}

// The inline card: a quick preview while exploring, deliberately kept lighter
// than the full entity.html page -- it does not link relationships away, so
// browsing the map doesn't accidentally navigate you off it.
function openCard(entity) {
  const card = document.getElementById("card");

  card.innerHTML = `
    <div>${tagsHtml(entity)}</div>
    <h3>${esc(entityName(entity))}</h3>
    <div class="meta">${esc(entityMetaParts(entity).join(" · "))}</div>
    <p>${esc(entity.summary_card || "")}</p>
    <a class="card-open" href="${entityUrl(entity.id)}">Read the entry</a>
    <button id="close-card">Close</button>
  `;
  card.classList.add("open");
  document.getElementById("close-card").onclick = () => {
    card.classList.remove("open");
    setUrlState({ focus: null });
  };
  setUrlState({ focus: entity.id });
}

// The view and the open entry live in the URL so a link reopens the same
// thing (Bible I4).
function setUrlState(changes) {
  const params = new URLSearchParams(window.location.search);
  Object.entries(changes).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });
  const query = params.toString();
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

// ---------- MAP VIEW ----------

function initMap() {
  map = L.map("map").setView([24.5, 88.7], 6);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
  window.addEventListener("resize", () => map.invalidateSize());
}

// Fix for the overlapping-marker bug: entities that share (near-)identical
// coordinates -- e.g. a movement and the event that kicked it off, both
// pinned to the same town -- get spread into a small circle around the true
// point instead of stacking exactly on top of each other, where only the
// topmost one was ever clickable.
function renderMarkers() {
  markerLayer.clearLayers();
  const visible = getVisibleEntities();

  // Group by rounded coordinate so near-duplicates cluster together too.
  const groups = {};
  visible.forEach((entity) => {
    const [lat, lng] = entity.place.coordinates;
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    (groups[key] = groups[key] || []).push(entity);
  });

  Object.values(groups).forEach((group) => {
    group.forEach((entity, i) => {
      let latlng = L.latLng(entity.place.coordinates);

      if (group.length > 1) {
        const angle = (2 * Math.PI * i) / group.length;
        const spreadPx = 14;
        const basePoint = map.latLngToLayerPoint(latlng);
        const offsetPoint = L.point(
          basePoint.x + Math.cos(angle) * spreadPx,
          basePoint.y + Math.sin(angle) * spreadPx
        );
        latlng = map.layerPointToLatLng(offsetPoint);
      }

      const marker = L.circleMarker(latlng, {
        radius: entity.type === "movement" ? 9 : 6,
        color: markerColor(entity),
        fillColor: markerColor(entity),
        fillOpacity: 0.85,
        weight: 1.5,
      }).addTo(markerLayer);

      marker.bindTooltip(entityName(entity), { direction: "top" });
      marker.on("click", () => openCard(entity));
    });
  });
}

// ---------- TIMELINE VIEW ----------

function computeTimelineRange() {
  // Only types that are drawn on the timeline: a text's publication date
  // (e.g. a 2026 article) must not stretch the axis.
  const years = Object.values(allEntities)
    .filter((e) => e.type === "movement" || e.type === "event")
    .map(entityDecimalYear)
    .filter((y) => y !== null);
  if (years.length === 0) return;
  timelineRange = {
    min: Math.floor(Math.min(...years)) - 1,
    max: Math.ceil(Math.max(...years)) + 1,
  };
}

function renderTimeline() {
  const container = document.getElementById("timeline");
  container.innerHTML = "";
  const visible = getVisibleEntities();

  const { min, max } = timelineRange;
  const span = max - min;
  const axisY = 240;
  const usableWidth = Math.max(container.clientWidth - 80, 600);

  const xForYear = (year) => 40 + ((year - min) / span) * usableWidth;

  const axisLine = document.createElement("div");
  axisLine.className = "tl-axis-line";
  axisLine.style.left = "40px";
  axisLine.style.width = usableWidth + "px";
  axisLine.style.right = "auto";
  container.appendChild(axisLine);

  const tickStep = span > 60 ? 10 : span > 20 ? 5 : 2;
  for (let y = Math.ceil(min / tickStep) * tickStep; y <= max; y += tickStep) {
    const x = xForYear(y);
    const tick = document.createElement("div");
    tick.className = "tl-tick";
    tick.style.left = x + "px";
    container.appendChild(tick);

    const label = document.createElement("div");
    label.className = "tl-tick-label";
    label.style.left = x + "px";
    label.textContent = y;
    container.appendChild(label);
  }

  const laneLabelTop = document.createElement("div");
  laneLabelTop.className = "tl-lane-label";
  laneLabelTop.style.top = (axisY - 70) + "px";
  laneLabelTop.textContent = "Movements";
  container.appendChild(laneLabelTop);

  const laneLabelBottom = document.createElement("div");
  laneLabelBottom.className = "tl-lane-label";
  laneLabelBottom.style.top = (axisY + 60) + "px";
  laneLabelBottom.textContent = "Events";
  container.appendChild(laneLabelBottom);

  const minGapPx = 16;
  const lanes = { movement: [], event: [] };

  visible.forEach((entity) => {
    const year = entityDecimalYear(entity);
    if (year === null) return;
    const lane = entity.type === "movement" ? "movement" : "event";
    lanes[lane].push({ entity, x: xForYear(year) });
  });

  Object.keys(lanes).forEach((laneName) => {
    lanes[laneName].sort((a, b) => a.x - b.x);
    let lastX = -Infinity;
    let row = 0;
    lanes[laneName].forEach((item) => {
      row = (item.x - lastX < minGapPx) ? row + 1 : 0;
      lastX = item.x;

      const rowOffset = 24 + row * 18;
      const y = laneName === "movement" ? axisY - rowOffset : axisY + rowOffset;

      const dot = document.createElement("div");
      dot.className = "tl-dot";
      dot.style.left = item.x + "px";
      dot.style.top = y + "px";
      dot.style.background = markerColor(item.entity);
      dot.title = entityName(item.entity);
      dot.addEventListener("click", () => openCard(item.entity));
      container.appendChild(dot);
    });
  });
}

// ---------- VIEW SWITCHING ----------

function switchView(view) {
  document.querySelectorAll(".view-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  document.getElementById("map").style.display = view === "map" ? "block" : "none";
  document.getElementById("timeline").style.display = view === "timeline" ? "block" : "none";

  if (view === "map") {
    setTimeout(() => map.invalidateSize(), 0);
    renderMarkers();
  } else {
    renderTimeline();
  }
  setUrlState({ view: view === "timeline" ? "timeline" : null });
}

function currentView() {
  const active = document.querySelector(".view-tab.active");
  return active ? active.dataset.view : "map";
}

function rerenderCurrentView() {
  if (currentView() === "map") renderMarkers();
  else renderTimeline();
}

function buildFilterToggles() {
  document.querySelectorAll(".filter-header").forEach((header) => {
    header.addEventListener("click", () => {
      const section = header.closest(".filter-section");
      const isOpen = section.classList.contains("open");
      document.querySelectorAll(".filter-section.open").forEach((s) => {
        if (s !== section) s.classList.remove("open");
      });
      section.classList.toggle("open", !isOpen);
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-section")) {
      document.querySelectorAll(".filter-section.open").forEach((s) => s.classList.remove("open"));
    }
  });
}

// The slider range comes from the data, so new entities outside the pilot's
// 1938-1950 window don't silently fall off the start of the range.
function syncYearSliderToData() {
  const slider = document.getElementById("decade");
  slider.min = timelineRange.min;
  slider.max = timelineRange.max;
  slider.value = timelineRange.max;
  document.getElementById("decade-readout").textContent = "up to " + timelineRange.max;
}

async function main() {
  initMap();
  await loadData();
  computeTimelineRange();
  syncYearSliderToData();
  renderMarkers();
  buildFilterToggles();

  document.getElementById("filter-movements").addEventListener("change", rerenderCurrentView);
  document.getElementById("filter-events").addEventListener("change", rerenderCurrentView);
  document.getElementById("region").addEventListener("change", rerenderCurrentView);
  document.getElementById("decade").addEventListener("input", (e) => {
    document.getElementById("decade-readout").textContent = "up to " + e.target.value;
    rerenderCurrentView();
  });

  document.querySelectorAll(".view-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  // Reopen what the link asked for: ?view=timeline and ?focus=<entry id>.
  const params = new URLSearchParams(window.location.search);
  const focused = allEntities[params.get("focus")];
  if (params.get("view") === "timeline") switchView("timeline");
  if (focused) {
    if (params.get("view") !== "timeline" && focused.place && focused.place.coordinates) {
      map.setView(focused.place.coordinates, 9);
      renderMarkers();
    }
    openCard(focused);
  }
}

main();
