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

  // If the input gets cleared, return to the default list.
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
  const localHits = state.loadedPokemon.filter((p) => p.name.includes(query));
  if (localHits.length) {
    clearCards();
    setMessage("");
    renderPokemonCards(localHits);
    return;
  }

  // If it's not in the currently loaded list, try fetching it directly via API.
  setLoading(true);
  try {
    const pokemon = await fetchPokemon(query);
    clearCards();
    setMessage("");
    renderPokemonCards([pokemon]);
  } catch {
    clearCards();
    setMessage("No Pokémon found.");
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
