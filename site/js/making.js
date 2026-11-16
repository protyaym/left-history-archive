// Draws the personas and journey maps on making.html from config/ux.json,
// so they are written in one place only.

function personaHtml(p) {
  return `
    <article class="persona" id="persona-${esc(p.id)}">
      <div class="rank">${esc(p.rank)}</div>
      <h3>${esc(p.label)}</h3>
      <p class="who">${esc(p.name)}, ${esc(p.who)}</p>
      <blockquote>“${esc(p.quote)}”</blockquote>
      <dl>
        <dt>Arrives</dt><dd>${esc(p.arrives)}</dd>
        <dt>Device and language</dt><dd>${esc(p.device)}</dd>
        <dt>Wants</dt><dd>${esc(p.wants)}</dd>
        <dt>Leaves when</dt><dd>${esc(p.leaves_when)}</dd>
      </dl>
    </article>`;
}

function journeyHtml(journey, persona, stages) {
  const line = (cls, label, text) => (text
    ? `<p class="line"><span class="tag ${cls}">${label}</span> ${esc(text)}</p>`
    : "");
  return `
    <h3>${esc(persona.label)}: ${esc(persona.name)}</h3>
    <p class="note">Goal: ${esc(journey.goal)}</p>
    <div class="journey">
      ${journey.steps.map((step, i) => `
        <div class="stage">
          <div class="stage-name">${i + 1}. ${esc(stages[i] || "")}</div>
          <p class="does">${esc(step.does)}</p>
          ${line("", "Before", step.before)}
          ${line("now", "Now", step.now)}
          ${line("open", "Still open", step.open)}
        </div>`).join("")}
    </div>`;
}

async function main() {
  const ux = await getJson("config/ux.json", null);
  if (!ux) {
    document.getElementById("personas").textContent = "The personas could not be loaded.";
    return;
  }
  const byId = Object.fromEntries(ux.personas.map((p) => [p.id, p]));
  document.getElementById("personas").innerHTML = ux.personas.map(personaHtml).join("");
  document.getElementById("journeys").innerHTML = ux.journeys
    .map((j) => journeyHtml(j, byId[j.persona], ux.stages))
    .join("");
}

main();
