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
  const html = pokemonArr
    .map((p) => pokemonCardTemplate(p, getCardBgClass(p)))
    .join("");
  grid.insertAdjacentHTML("beforeend", html);
}

function clearCards() {
  document.getElementById("cardGrid").innerHTML = "";
}

async function openOverlay(pokemon, state) {
  const overlay = document.getElementById("overlay");
  const activeTab = "about";

  let species = null;
  try {
    species = await fetchSpecies(pokemon.id);
  } catch {
    species = null;
  }

  const html = overlayTemplate(
    pokemon,
    getCardBgClass(pokemon),
    aboutTemplate(pokemon),
    statsTemplate(pokemon),
    genderTemplate(species),
    evolutionPlaceholderTemplate(),
    tabsTemplate(activeTab),
    activeTab
  );

  overlay.innerHTML = html;
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  attachOverlayEvents(state);
  initTabs(pokemon);
}

function closeOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = "";
  document.body.classList.remove("no-scroll");
}

let overlayEventAttached = false;

function attachOverlayEvents(state) {
  const overlay = document.getElementById("overlay");

  // Remove old listeners if they exist
  if (overlayEventAttached) {
    overlay.replaceWith(overlay.cloneNode(true));
  }
  overlayEventAttached = true;

  const newOverlay = document.getElementById("overlay");
  
  newOverlay.addEventListener("click", (e) => {
    if (e.target.id === "overlay") closeOverlay();
    if (e.target.dataset.close) closeOverlay();
  });

  newOverlay.addEventListener("click", (e) => {
    const navBtn = e.target.closest("[data-nav]");
    if (!navBtn) return;
    
    const dir = Number(navBtn.dataset.nav || 0);
    if (!dir) return;
    
    const next = state.currentIndex + dir;
    showOverlayByIndex(next, state);
  });
}

function initTabs(pokemon) {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.tab;

      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById("tab-" + key).classList.add("active");

      if (key === "evolution") {
        loadEvolutionTimeline(pokemon.id);
      }
    });
  });
}

async function loadEvolutionTimeline(pokemonId) {
  const timelineWrap = document.getElementById("evoTimeline");
  const loading = document.getElementById("evoLoading");
  if (!timelineWrap || !loading) return;
  if (timelineWrap.dataset.loaded === "1") return;

  loading.classList.remove("hidden");
  timelineWrap.dataset.loaded = "1";

  try {
    const evo = await fetchEvolutionChainForPokemon(pokemonId);
    const paths = evo ? extractEvolutionPaths(evo.chain) : [];
    const uniqueNames = getUniqueEvolutionNames(paths);
    const pokemons = await Promise.all(uniqueNames.map((n) => fetchPokemon(n)));

    const pokemonByName = new Map();
    pokemons.forEach((p) => pokemonByName.set(p.name, p));

    const pokemonPaths = (paths || []).map((p) => p.map((name) => pokemonByName.get(name)).filter(Boolean));
    timelineWrap.innerHTML = evolutionTimelineTemplate(pokemonPaths);
  } catch {
    timelineWrap.innerHTML = `<p class="tab-hint">Could not load evolution data.</p>`;
  } finally {
    loading.classList.add("hidden");
  }
}

function showOverlayByIndex(index, state) {
  const safe = clamp(index, 0, state.loadedPokemon.length - 1);
  state.currentIndex = safe;
  const p = state.loadedPokemon[safe];
  openOverlay(p, state);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
