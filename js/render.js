function getCardBgClass(pokemon) {
  const t = pokemon.types?.[0]?.type?.name || "normal";
  return `bg-${t}`;
}

function setMessage(text) {
  const el = document.getElementById("message");
  el.textContent = text || "";
  el.classList.toggle("hidden", !text);
}

function renderPokemonCards(pokemonArr) {
  const grid = document.getElementById("cardGrid");
  const html = pokemonArr.map(p => pokemonCardTemplate(p, getCardBgClass(p))).join("");
  grid.insertAdjacentHTML("beforeend", html);
}

function clearCards() {
  document.getElementById("cardGrid").innerHTML = "";
}

async function openOverlay(pokemon, state) {
  const species = await fetchSpecies(pokemon.id);
  const evoData = await fetchEvolutionChainForPokemon(pokemon.id);

  const evoChain = evoData
    ? parseEvolutionChain(evoData.chain)
    : [];

  const html = overlayTemplate(
    pokemon,
    getCardBgClass(pokemon),
    statsTemplate(pokemon),
    aboutTemplate(pokemon),
    evolutionTemplate(evoChain)
  );

  const overlay = document.getElementById("overlay");
  overlay.innerHTML = html;
  overlay.classList.remove("hidden");

  attachOverlayEvents(state);
  initTabs();
}

function closeOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = "";
  document.body.style.overflow = "";
}

function attachOverlayEvents(state) {
  const overlay = document.getElementById("overlay");
  overlay.addEventListener("click", e => onOverlayClick(e), { once:false });
  overlay.addEventListener("click", e => onOverlayNav(e, state), { once:false });
}

function onOverlayClick(e) {
  if (e.target.id === "overlay") closeOverlay();
  if (e.target.dataset.close) closeOverlay();
}

function onOverlayNav(e, state) {
  const dir = Number(e.target.dataset.nav);
  if (!dir) return;
  const next = state.currentIndex + dir;
  showOverlayByIndex(next, state);
}

async function showOverlayByIndex(index, state) {
  const safe = clamp(index, 0, state.loadedPokemon.length - 1);
  state.currentIndex = safe;
  const p = state.loadedPokemon[safe];
  await openOverlay(p, state);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function parseEvolutionChain(chain) {
  const result = [];
  let current = chain;
  
  while (current) {
    const id = current.species.url.split("/").filter(Boolean).pop();
    result.push({
      name: current.species.name,
      id: id
    });
    current = current.evolves_to[0];
  }
  
  return result;
}

function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
    });
  });
}
