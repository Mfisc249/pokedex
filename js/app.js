const state = {
  limit: 25,
  offset: 0,
  loadedPokemon: [],
  currentIndex: 0
};

function init() {
  wireEvents();
  loadNextBatch();
}

function wireEvents() {
  document.getElementById("searchInput").addEventListener("input", (e) => onSearchInput(e));
  document.getElementById("searchForm").addEventListener("submit", (e) => onSearchSubmit(e));
  document.getElementById("cardGrid").addEventListener("click", (e) => onCardClick(e));
}

function onSearchInput(e) {
  const query = e.target.value.trim();
  document.getElementById("searchBtn").disabled = query.length < 3;

  if (query.length === 0) {
    setMessage("");
    clearCards();
    renderPokemonCards(state.loadedPokemon);
  }
}

async function onSearchSubmit(e) {
  e.preventDefault();
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (query.length < 3) return;
  await runSearch(query);
}

async function runSearch(query) {
  const localHits = findLocalMatches(query);
  if (localHits.length) return renderSearchResults(localHits);
  await fetchAndRenderSearch(query);
}

function findLocalMatches(query) {
  return state.loadedPokemon.filter((p) => p.name.includes(query));
}

function renderSearchResults(list) {
  clearCards();
  setMessage("");
  renderPokemonCards(list);
}

function renderSearchError() {
  clearCards();
  setMessage("No Pokémon found.");
}

async function fetchAndRenderSearch(query) {
  setLoading(true);
  try {
    const pokemon = await fetchPokemon(query);
    renderSearchResults([pokemon]);
  } catch {
    renderSearchError();
  } finally {
    setLoading(false);
  }
}

async function loadNextBatch() {
  setLoading(true);
  try {
    const batch = await loadPokemonBatch(state.limit, state.offset);
    state.offset += state.limit;
    state.loadedPokemon.push(...batch);
    renderPokemonCards(batch);
    setMessage("");
  } catch (err) {
    setMessage("Loading failed. Please try again.");
  } finally {
    setLoading(false);
  }
}

async function loadPokemonBatch(limit, offset) {
  const list = await fetchPokemonList(limit, offset);
  const urls = (list.results || []).map((p) => p.url);
  return Promise.all(urls.map((url) => fetchPokemonByUrl(url)));
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
