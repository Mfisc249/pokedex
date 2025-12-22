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

function overlayTemplate(pokemon, bgClass, statsHtml) {
  const types = pokemon.types.map(t => t.type.name);
  const img = getPokemonImage(pokemon);
  return `
    <div class="modal ${bgClass}">
      <button class="nav-arrow nav-left" data-nav="-1" aria-label="Previous">‹</button>
      <button class="nav-arrow nav-right" data-nav="1" aria-label="Next">›</button>

      <div class="modal-head">
        <div>
          <h2 class="modal-title">${pokemon.name}</h2>
          <div class="types">${typePillsTemplate(types)}</div>
        </div>
        <button class="modal-close" data-close="1" aria-label="Close">Close</button>
      </div>

      <div class="modal-body">
        <img class="modal-img" src="${img}" alt="${pokemon.name}">
        <div class="stats">${statsHtml}</div>
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
