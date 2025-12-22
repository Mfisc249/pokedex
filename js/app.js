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

async function loadPokemonDetails(items) {
  const promises = items.map(i => fetchPokemonByUrl(i.url));
  return Promise.all(promises);
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
