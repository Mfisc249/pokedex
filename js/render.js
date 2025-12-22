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

function openOverlay(pokemon, state) {
  const overlay = document.getElementById("overlay");
  const statsHtml = statsTemplate(pokemon);
  overlay.innerHTML = overlayTemplate(pokemon, getCardBgClass(pokemon), statsHtml);
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  attachOverlayEvents(state);
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
  openOverlay(p, state);
  await tryLoadEvoChain(p.id);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

async function tryLoadEvoChain(id) {
  try { await fetchEvolutionChainForPokemon(id); }
  catch { /* optional: ignore */ }
}
