function pokemonCardTemplate(pokemon, bgClass) {
  const ctx = { types: pokemon.types.map((t) => t.type.name), img: getPokemonImage(pokemon), id: padId(pokemon.id) };
  return `<article class="card ${bgClass}" data-id="${pokemon.id}">${cardImageBlock(ctx.img, pokemon.name)}<span class="number">#${ctx.id}</span><h2 class="name">${formatName(pokemon.name)}</h2><div class="types">${typeBadgesHtml(ctx.types)}</div></article>`;
}

function cardImageBlock(img, altText) {
  return `<div class="img-container"><img class="image" src="${img}" alt="${altText}" loading="lazy" /><img class="background" src="assets/Icons/default/pokeball.svg" alt="" aria-hidden="true" /></div>`;
}

function typeBadgesHtml(types) {
  return types
    .map((type) => `<div class="poke__type__bg ${type}"><img src="assets/Icons/${type}.svg" alt="${type}" /></div>`)
    .join("");
}

function overlayTemplate(pokemon, bgClass, aboutHtml, statsHtml, genderHtml, evolutionHtml, tabsHtml, activeTab, canPrev, canNext) {
  const types = pokemon.types.map((t) => t.type.name);
  const img = getPokemonImage(pokemon);
  const id = padId(pokemon.id);
  return `<div class="poke-modal ${bgClass}">${overlayNavButtons(canPrev, canNext)}${overlayTopSection(pokemon, types, img, id)}${overlayBottomSection(aboutHtml, statsHtml, genderHtml, evolutionHtml, tabsHtml, activeTab)}</div>`;
}

function overlayNavButtons(canPrev, canNext) {
  return `<button class="nav-btn nav-left" data-nav="-1" aria-label="Previous" ${canPrev ? "" : "disabled"}><span>←</span></button><button class="nav-btn nav-right" data-nav="1" aria-label="Next" ${canNext ? "" : "disabled"}><span>→</span></button>`;
}

function overlayTopSection(pokemon, types, img, id) {
  return `<div class="poke-modal-top"><button class="modal-close" data-close="1" aria-label="Close">✕</button><div class="poke-modal-head">${overlayHeadLeft(types, pokemon, id)}<img class="modal-sprite" src="${img}" alt="${pokemon.name}" /></div><img class="modal-pokeball" src="assets/Icons/default/pokeball.svg" alt="" aria-hidden="true" /></div>`;
}

function overlayHeadLeft(types, pokemon, id) {
  const pills = types.map((t) => `<span class="type-pill">${t}</span>`).join("");
  return `<div><div class="modal-id">#${id}</div><h2 class="modal-title">${formatName(pokemon.name)}</h2><div class="modal-types">${pills}</div></div>`;
}

function overlayBottomSection(aboutHtml, statsHtml, genderHtml, evolutionHtml, tabsHtml, activeTab) {
  return `<div class="poke-modal-bottom"><div class="tabs">${tabsHtml}</div><div class="tab-content">${tabPanel("about", activeTab, aboutHtml)}${tabPanel("stats", activeTab, statsHtml)}${tabPanel("gender", activeTab, genderHtml)}${tabPanel("evolution", activeTab, evolutionHtml)}</div></div>`;
}

function tabPanel(key, activeTab, content) {
  const active = activeTab === key ? "active" : "";
  return `<div class="tab-panel ${active}" id="tab-${key}">${content}</div>`;
}

function tabsTemplate(activeTab) {
  return `<button class="tab ${activeTab === "about" ? "active" : ""}" data-tab="about">About</button><button class="tab ${activeTab === "stats" ? "active" : ""}" data-tab="stats">Base Stats</button><button class="tab ${activeTab === "gender" ? "active" : ""}" data-tab="gender">Gender</button><button class="tab ${activeTab === "evolution" ? "active" : ""}" data-tab="evolution">Evolution</button>`;
}

function aboutTemplate(pokemon) {
  const abilities = pokemon.abilities.map((a) => formatName(a.ability.name)).join(", ");
  return `<div class="about-grid"><div class="about-row"><span>Species</span><b>${formatName(pokemon.name)}</b></div><div class="about-row"><span>Height</span><b>${pokemon.height * 10} cm</b></div><div class="about-row"><span>Weight</span><b>${(pokemon.weight / 10).toFixed(1)} kg</b></div><div class="about-row"><span>Abilities</span><b>${abilities}</b></div></div>`;
}

function statsTemplate(pokemon) {
  return `<div class="stats-list">${pokemon.stats.map((s) => `<div class="stat-row"><span>${formatName(s.stat.name)}</span><b>${s.base_stat}</b></div>`).join("")}</div>`;
}

function genderTemplate(species) {
  if (!species) return `<p class="tab-hint">No gender data available.</p>`;
  const eggGroups = formatEggGroups(species);
  const genderDiff = species.has_gender_differences ? "Yes" : "No";
  return genderGridTemplate(formatGenderRate(species), genderDiff, eggGroups);
}

function formatEggGroups(species) {
  return (species.egg_groups || []).map((g) => formatName(g.name)).join(", ") || "-";
}

function formatGenderRate(species) {
  if (species.gender_rate === -1) return "Genderless";
  if (typeof species.gender_rate !== "number") return "Unknown";
  const female = Math.round((species.gender_rate / 8) * 100);
  const male = 100 - female;
  return `${female}% female / ${male}% male`;
}

function genderGridTemplate(genderText, genderDiff, eggGroups) {
  return `<div class="about-grid"><div class="about-row"><span>Gender rate</span><b>${genderText}</b></div><div class="about-row"><span>Gender differences</span><b>${genderDiff}</b></div><div class="about-row"><span>Egg groups</span><b>${eggGroups}</b></div></div>`;
}

function evolutionPlaceholderTemplate() {
  return `<p class="tab-hint">Open this tab to load the evolution timeline.</p><div class="evo-loading hidden" id="evoLoading"><div class="mini-spinner"></div><span>Loading evolution…</span></div><div id="evoTimeline"></div>`;
}

function evolutionTimelineTemplate(root, branchPaths, maxLen) {
  if (!root) return `<p class="evo-empty">No evolution data.</p>`;
  const rootHtml = evoRootHtml(root);
  const rows = buildEvoRows(branchPaths, maxLen);
  return `<div class="evo-branches" data-cols="${maxLen}">${rootHtml}${rows}</div>`;
}

function buildEvoRows(paths, maxLen) {
  return (paths || []).map((path) => buildEvoRow(path, maxLen)).join("");
}

function buildEvoRow(path, maxLen) {
  const cells = [`<div class="evo-branch-arrow" aria-hidden="true">↳</div>`];
  for (let i = 0; i < maxLen; i++) {
    if (i > 0) cells.push(evoArrowHtml());
    cells.push(evoItemOrSpacer(path[i]));
  }
  return `<div class="evo-row">${cells.join("")}</div>`;
}

function evoArrowHtml() {
  return `<div class="evo-arrow" aria-hidden="true">→</div>`;
}

function evoItemOrSpacer(pokemon) {
  if (!pokemon) return `<div class="evo-spacer"></div>`;
  const img = getPokemonImage(pokemon) || pokemon.sprites?.front_default || "";
  const id = padId(pokemon.id);
  return `<div class="evo-item" data-evo-id="${pokemon.id}" title="Open ${formatName(pokemon.name)}"><img src="${img}" alt="${pokemon.name}" loading="lazy" /><div class="evo-name">${formatName(pokemon.name)}</div><div class="evo-id">#${id}</div></div>`;
}

function evoRootHtml(root) {
  const img = getPokemonImage(root) || root.sprites?.front_default || "";
  const id = padId(root.id);
  return `<div class="evo-root"><div class="evo-item evo-root-item" data-evo-id="${root.id}" title="Open ${formatName(root.name)}"><img src="${img}" alt="${root.name}" loading="lazy" /><div class="evo-name">${formatName(root.name)}</div><div class="evo-id">#${id}</div></div></div>`;
}

function formatName(name) {
  return name.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function padId(id) {
  return String(id).padStart(3, "0");
}

function getPokemonImage(pokemon) {
  const spr = pokemon.sprites;
  return spr.other?.["official-artwork"]?.front_default || spr.front_default || "";
}
