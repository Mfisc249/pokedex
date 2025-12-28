function pokemonCardTemplate(pokemon, bgClass) {
  const types = pokemon.types.map((t) => t.type.name);
  const img = getPokemonImage(pokemon);
  const id = String(pokemon.id).padStart(3, "0");

  return `
    <article class="card ${bgClass}" data-id="${pokemon.id}">
      <div class="img-container">
        <img class="image" src="${img}" alt="${pokemon.name}" loading="lazy" />
        <img class="background" src="assets/Icons/default/pokeball.svg" alt="" aria-hidden="true" />
      </div>

      <span class="number">#${id}</span>
      <h2 class="name">${formatName(pokemon.name)}</h2>

      <div class="types">
        ${types
          .map(
            (type) => `
              <div class="poke__type__bg ${type}">
                <img src="assets/Icons/${type}.svg" alt="${type}" />
              </div>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function overlayTemplate(
  pokemon,
  bgClass,
  aboutHtml,
  statsHtml,
  genderHtml,
  evolutionHtml,
  tabsHtml,
  activeTab,
  canPrev,
  canNext
) {
  const types = pokemon.types.map((t) => t.type.name);
  const img = getPokemonImage(pokemon);
  const id = String(pokemon.id).padStart(3, "0");

  return `
    <div class="poke-modal ${bgClass}">
      <button class="nav-btn nav-left" data-nav="-1" aria-label="Previous" ${canPrev ? "" : "disabled"}>
        <span>←</span>
      </button>
      <button class="nav-btn nav-right" data-nav="1" aria-label="Next" ${canNext ? "" : "disabled"}>
        <span>→</span>
      </button>

      <div class="poke-modal-top">
        <button class="modal-close" data-close="1" aria-label="Close">✕</button>

        <div class="poke-modal-head">
          <div>
            <div class="modal-id">#${id}</div>
            <h2 class="modal-title">${formatName(pokemon.name)}</h2>
            <div class="modal-types">
              ${types
                .map((t) => `<span class="type-pill">${t}</span>`)
                .join("")}
            </div>
          </div>

          <img class="modal-sprite" src="${img}" alt="${pokemon.name}" />
        </div>

        <img class="modal-pokeball" src="assets/Icons/default/pokeball.svg" alt="" aria-hidden="true" />
      </div>

      <div class="poke-modal-bottom">
        <div class="tabs">
          ${tabsHtml}
        </div>

        <div class="tab-content">
          <div class="tab-panel ${activeTab === "about" ? "active" : ""}" id="tab-about">${aboutHtml}</div>
          <div class="tab-panel ${activeTab === "stats" ? "active" : ""}" id="tab-stats">${statsHtml}</div>
          <div class="tab-panel ${activeTab === "gender" ? "active" : ""}" id="tab-gender">${genderHtml}</div>
          <div class="tab-panel ${activeTab === "evolution" ? "active" : ""}" id="tab-evolution">${evolutionHtml}</div>
        </div>
      </div>
    </div>
  `;
}

function tabsTemplate(activeTab) {
  return `
    <button class="tab ${activeTab === "about" ? "active" : ""}" data-tab="about">About</button>
    <button class="tab ${activeTab === "stats" ? "active" : ""}" data-tab="stats">Base Stats</button>
    <button class="tab ${activeTab === "gender" ? "active" : ""}" data-tab="gender">Gender</button>
    <button class="tab ${activeTab === "evolution" ? "active" : ""}" data-tab="evolution">Evolution</button>
  `;
}

function aboutTemplate(pokemon) {
  const abilities = pokemon.abilities.map((a) => formatName(a.ability.name)).join(", ");
  return `
    <div class="about-grid">
      <div class="about-row"><span>Species</span><b>${formatName(pokemon.name)}</b></div>
      <div class="about-row"><span>Height</span><b>${(pokemon.height * 10)} cm</b></div>
      <div class="about-row"><span>Weight</span><b>${(pokemon.weight / 10).toFixed(1)} kg</b></div>
      <div class="about-row"><span>Abilities</span><b>${abilities}</b></div>
    </div>
  `;
}

function statsTemplate(pokemon) {
  return `
    <div class="stats-list">
      ${pokemon.stats
        .map(
          (s) => `
          <div class="stat-row">
            <span>${formatName(s.stat.name)}</span>
            <b>${s.base_stat}</b>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

function genderTemplate(species) {
  if (!species) {
    return `<p class="tab-hint">No gender data available.</p>`;
  }

  const eggGroups = (species.egg_groups || []).map((g) => formatName(g.name)).join(", ") || "-";
  const genderDiff = species.has_gender_differences ? "Yes" : "No";

  let genderText = "Unknown";
  if (species.gender_rate === -1) {
    genderText = "Genderless";
  } else if (typeof species.gender_rate === "number") {
    const female = Math.round((species.gender_rate / 8) * 100);
    const male = 100 - female;
    genderText = `${female}% female / ${male}% male`;
  }

  return `
    <div class="about-grid">
      <div class="about-row"><span>Gender rate</span><b>${genderText}</b></div>
      <div class="about-row"><span>Gender differences</span><b>${genderDiff}</b></div>
      <div class="about-row"><span>Egg groups</span><b>${eggGroups}</b></div>
    </div>
  `;
}

function evolutionPlaceholderTemplate() {
  return `
    <p class="tab-hint">Open this tab to load the evolution timeline.</p>
    <div class="evo-loading hidden" id="evoLoading">
      <div class="mini-spinner"></div>
      <span>Loading evolution…</span>
    </div>
    <div id="evoTimeline"></div>
  `;
}

function evolutionTimelineTemplate(root, branchPaths, maxLen) {
  if (!root) return `<p class="evo-empty">No evolution data.</p>`;

  const rootImg = getPokemonImage(root) || root.sprites?.front_default || "";
  const rootId = String(root.id).padStart(3, "0");

  const rootHtml = `
    <div class="evo-root">
      <div class="evo-item evo-root-item" data-evo-id="${root.id}" title="Open ${formatName(root.name)}">
        <img src="${rootImg}" alt="${root.name}" loading="lazy" />
        <div class="evo-name">${formatName(root.name)}</div>
        <div class="evo-id">#${rootId}</div>
      </div>
    </div>
  `;

  const rows = (branchPaths || []).map((path) => {
    const cells = [`<div class="evo-branch-arrow" aria-hidden="true">↳</div>`];

    for (let i = 0; i < maxLen; i++) {
      const p = path[i];
      if (i > 0) cells.push(`<div class="evo-arrow" aria-hidden="true">→</div>`);
      if (!p) {
        cells.push(`<div class="evo-spacer"></div>`);
        continue;
      }

      const img = getPokemonImage(p) || p.sprites?.front_default || "";
      const id = String(p.id).padStart(3, "0");
      cells.push(`
        <div class="evo-item" data-evo-id="${p.id}" title="Open ${formatName(p.name)}">
          <img src="${img}" alt="${p.name}" loading="lazy" />
          <div class="evo-name">${formatName(p.name)}</div>
          <div class="evo-id">#${id}</div>
        </div>
      `);
    }

    return `<div class="evo-row">${cells.join("")}</div>`;
  }).join("");

  return `
    <div class="evo-branches" data-cols="${maxLen}">
      ${rootHtml}
      ${rows}
    </div>
  `;
}

function formatName(name) {
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function getPokemonImage(pokemon) {
  const spr = pokemon.sprites;
  return spr.other?.["official-artwork"]?.front_default || spr.front_default || "";
}
