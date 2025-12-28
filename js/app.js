const state = {
  limit: 25,
  offset: 0,
  loadedPokemon: [],
  currentIndex: 0
};

window.addEventListener("load", () => init());

function init() {
  wireEvents();
  loadNextBatch();
}

function wireEvents() {
  document.getElementById("loadMoreBtn").addEventListener("click", () => loadNextBatch());
  document.getElementById("searchInput").addEventListener("input", e => onSearchInput(e));
  document.getElementById("searchForm").addEventListener("submit", e => onSearchSubmit(e));
  document.getElementById("cardGrid").addEventListener("click", e => onCardClick(e));
}

function onSearchInput(e) {
  const val = e.target.value.trim();
  document.getElementById("searchBtn").disabled = val.length < 3;
}

async function onSearchSubmit(e) {
  e.preventDefault();
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  if (q.length < 3) return;
  runSearch(q);
}

function runSearch(query) {
  const results = state.loadedPokemon.filter(p => p.name.includes(query));
  clearCards();
  setMessage(results.length ? "" : "No Pokémon found.");
  renderPokemonCards(results);
}

async function loadNextBatch() {
  setLoading(true);
  try {
    const list = await fetchPokemonList(state.limit, state.offset);
    const batch = await loadPokemonDetails(list.results);
    state.loadedPokemon.push(...batch);
    state.offset += state.limit;
    renderPokemonCards(batch);
    setMessage("");
  } catch {
    setMessage("Loading failed. Please try again.");
  } finally {
    setLoading(false);
  }
}

async function loadNextBaseForms(targetCount) {
  const collected = [];

  while (collected.length < targetCount) {
    const list = await fetchPokemonList(state.limit, state.offset);
    state.offset += state.limit;

    if (!list.results || list.results.length === 0) break;

    const details = await Promise.all(
      list.results.map(async (item) => {
        const data = await fetch PokemonByUrl(item.url);
        const species = await fetchSpecies(p.id);
        const isBaseForm = !species.evolves_from_species;
        return isBaseForm ? p : null;
      })  
    );

    details.filter(Boolean).forEach((p) => collected.push(p));

    if (!list.next) break;
  }

  return collected.slice(0, targetCount);
}

function onCardClick(e) {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = Number(card.dataset.id);
  const idx = state.loadedPokemon.findIndex(p => p.id === id);
  if (idx < 0) return;
  state.currentIndex = idx;
  openOverlay(state.loadedPokemon[idx], state);
}

function setLoading(isLoading) {
  document.getElementById("loading").classList.toggle("hidden", !isLoading);
  document.getElementById("loadMoreBtn").disabled = isLoading;
}

