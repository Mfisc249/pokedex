function pokemonCardTemplate(pokemon, bgClass) {
  const types = pokemon.types.map(t => t.type.name);
  const img = getPokemonImage(pokemon);
  return `
    <article class="card ${bgClass}" data-id="${pokemon.id}">
      <div class="card-inner">
        <h2 class="card-title">${pokemon.name}</h2>
        <div class="types">${typePillsTemplate(types)}</div>
        <img class="card-img" src="${img}" alt="${pokemon.name}" loading="lazy">
      </div>
    </article>
  `;
}

function typePillsTemplate(types) {
  return types.map(t => `<span class="type-pill">${t}</span>`).join("");
}

function overlayTemplate(pokemon, bgColor, statsHtml, aboutHtml, evoHtml) {
  return `
    <div class="modal" style="background:${bgColor}">
      <button class="nav-arrow nav-left" data-nav="-1">‹</button>
      <button class="nav-arrow nav-right" data-nav="1">›</button>

      <div class="modal-head">
        <h2 class="modal-title">${pokemon.name}</h2>
        <button class="modal-close" data-close="1">✕</button>
      </div>

      <div class="tabs">
        <button class="tab active" data-tab="about">About</button>
        <button class="tab" data-tab="stats">Stats</button>
        <button class="tab" data-tab="evolution">Evolution</button>
      </div>

      <div class="tab-content">
        <div class="tab-panel active" id="tab-about">${aboutHtml}</div>
        <div class="tab-panel" id="tab-stats">${statsHtml}</div>
        <div class="tab-panel" id="tab-evolution">${evoHtml}</div>
      </div>
    </div>
  `;
}

function statsTemplate(pokemon) {
  return pokemon.stats.map(s => {
    return `<div class="stat"><span>${s.stat.name}</span><strong>${s.base_stat}</strong></div>`;
  }).join("");
}

function getPokemonImage(pokemon) {
  const spr = pokemon.sprites;
  return spr.other?.["official-artwork"]?.front_default || spr.front_default || "";
}

function aboutTemplate(pokemon) {
  const img = getPokemonImage(pokemon);
  return `
    <div class="about-content">
      <img class="about-img" src="${img}" alt="${pokemon.name}">
      <div class="about-info">
        <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
        <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Base Experience:</strong> ${pokemon.base_experience}</p>
        <p><strong>Abilities:</strong> ${
          pokemon.abilities.map(a => a.ability.name).join(", ")
        }</p>
      </div>
    </div>
  `;
}

function evolutionTemplate(evoChain) {
  if (!evoChain || evoChain.length === 0) {
    return "<p>No evolution data available</p>";
  }
  
  return `
    <div class="evolution">
      ${evoChain.map(evo => `
        <div class="evo-item">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png" alt="${evo.name}">
          <span>${evo.name}</span>
        </div>
      `).join("→")}
    </div>
  `;
}
