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
  const html = pokemonArr.map((p) => {
  const vm = buildCardVm(p);
  return pokemonCardTemplate(vm);
}).join("");
  grid.insertAdjacentHTML("beforeend", html);
}

function clearCards() {
  document.getElementById("cardGrid").innerHTML = "";
}

async function openOverlay(pokemon, state) {
  const overlay = getOverlayEl();
  const species = await fetchSpeciesSafe(pokemon.id);
  const html = buildOverlayHtml(pokemon, species, "about", state);
  renderOverlay(overlay, html);
  attachOverlayEvents(state);
  initTabs(pokemon);
}

function closeOverlay() {
  const overlay = getOverlayEl();
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = "";
  document.body.classList.remove("no-scroll");
}

function attachOverlayEvents(state) {
  const overlay = getOverlayEl();
  overlay.onclick = (e) => handleOverlayClick(e, state);
}

function initTabs(pokemon) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => onTabClick(tab, pokemon));
  });
}

async function loadEvolutionTimeline(pokemonId) {
  const ctx = getEvoDomContext();
  if (!ctx || ctx.timeline.dataset.loaded === "1") return;
  startEvoLoading(ctx);
  try {
    const view = await fetchEvolutionView(pokemonId);
    renderEvolution(view, ctx);
  } finally {
    stopEvoLoading(ctx);
  }
}

function buildEvolutionViewModel(pokemonPaths) {
  if (!pokemonPaths || !pokemonPaths.length) return { root: null, branches: [], maxLen: 0 };
  const root = pokemonPaths[0]?.[0] || null;
  if (!root) return { root: null, branches: [], maxLen: 0 };
  const branches = pokemonPaths.map((path) => removeRootFromPath(path, root));
  const maxLen = Math.max(1, ...branches.map((p) => p.length));
  return { root, branches, maxLen };
}

function removeRootFromPath(path, root) {
  const arr = Array.isArray(path) ? [...path] : [];
  while (arr.length && arr[0]?.id === root.id) arr.shift();
  return arr;
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

function getOverlayEl() {
  return document.getElementById("overlay");
}

async function fetchSpeciesSafe(id) {
  try {
    return await fetchSpecies(id);
  } catch {
    return null;
  }
}


  function buildOverlayHtml(pokemon, species, activeTab, state) {
  const vm = buildOverlayVm(pokemon, species, activeTab, state);
  return overlayTemplate(vm);
}


function navState(state) {
  return {
    canPrev: state.currentIndex > 0,
    canNext: state.currentIndex < state.loadedPokemon.length - 1
  };
}

function renderOverlay(overlay, html) {
  overlay.innerHTML = html;
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function handleOverlayClick(e, state) {
  if (shouldCloseOverlay(e)) return closeOverlay();
  const navBtn = e.target.closest("[data-nav]");
  if (!navBtn || navBtn.disabled) return;
  const dir = Number(navBtn.dataset.nav || 0);
  if (dir) showOverlayByIndex(state.currentIndex + dir, state);
}

function shouldCloseOverlay(e) {
  return e.target.id === "overlay" || e.target.dataset.close;
}

function onTabClick(tab, pokemon) {
  const key = tab.dataset.tab;
  toggleActiveTabs(key);
  if (key === "evolution") loadEvolutionTimeline(pokemon.id);
}

function toggleActiveTabs(key) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === key));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "tab-" + key));
}

function getEvoDomContext() {
  const timeline = document.getElementById("evoTimeline");
  const loading = document.getElementById("evoLoading");
  if (!timeline || !loading) return null;
  return { timeline, loading };
}

function startEvoLoading(ctx) {
  ctx.loading.classList.remove("hidden");
  ctx.timeline.dataset.loaded = "1";
}

async function fetchEvolutionView(pokemonId) {
  try {
    const chain = await fetchEvolutionChainForPokemon(pokemonId);
    const paths = chain ? extractEvolutionPaths(chain.chain) : [];
    const pokemons = await loadEvolutionPokemon(paths);
    return buildEvolutionViewModel(mapPathsToPokemon(paths, pokemons));
  } catch {
    return null;
  }
}

function loadEvolutionPokemon(paths) {
  const names = getUniqueEvolutionNames(paths);
  return Promise.all(names.map((name) => fetchPokemon(name)));
}

function mapPathsToPokemon(paths, pokemons) {
  const byName = new Map(pokemons.map((p) => [p.name, p]));
  return (paths || []).map((p) => (p || []).map((n) => byName.get(n)).filter(Boolean));
}

function renderEvolution(view, ctx) {
  if (!view) {
    ctx.timeline.innerHTML = `<p class="tab-hint">Could not load evolution data.</p>`;
    return;
  }

  const rootVm = buildEvoItemVm(view.root, "evo-root-item");
  const rootHtml = evoRootWrapTemplate(evoItemTemplate(rootVm));

  const rowsHtml = (view.branches || []).map(path => buildEvoRowHtml(path, view.maxLen)).join("");
  ctx.timeline.innerHTML = evoBranchesTemplate(rootHtml, rowsHtml, view.maxLen);
}

function buildEvoRowHtml(path, maxLen) {
  let cells = evoBranchArrowTemplate();

  for (let i = 0; i < maxLen; i++) {
    if (i > 0) cells += evoArrowTemplate();

    const p = path[i];
    if (!p) cells += evoSpacerTemplate();
    else cells += evoItemTemplate(buildEvoItemVm(p));
  }

  return evoRowTemplate(cells);
}

function buildEvoItemVm(pokemon, extraClass) {
  return {
    id: pokemon.id,
    idPadded: padId(pokemon.id),
    name: pokemon.name,
    nameFormatted: formatName(pokemon.name),
    img: getPokemonImage(pokemon) || pokemon.sprites?.front_default || "",
    title: `Open ${formatName(pokemon.name)}`,
    extraClass: extraClass || ""
  };
}

function stopEvoLoading(ctx) {
  ctx.loading.classList.add("hidden");
}

function buildCardVm(pokemon) {
  const types = (pokemon.types || []).map(t => t.type.name);
  const typesHtml = types.map(typeBadgeTemplate).join("");

  return {
    id: pokemon.id,
    idPadded: padId(pokemon.id),
    name: pokemon.name,
    nameFormatted: formatName(pokemon.name),
    img: getPokemonImage(pokemon),
    bgClass: getCardBgClass(pokemon),
    typesHtml
  };
}

function buildOverlayVm(pokemon, species, activeTab, state) {
  const types = (pokemon.types || []).map(t => t.type.name);
  const typePillsHtml = types.map(typePillTemplate).join("");

  const aboutHtml = buildAboutHtml(pokemon);
  const statsHtml = buildStatsHtml(pokemon);
  const genderHtml = buildGenderHtml(species);
  const evolutionHtml = evolutionPlaceholderTemplate();

  const nav = navState(state);
  const navHtml = overlayNavButtonsTemplate(nav.canPrev, nav.canNext);

  return {
    id: pokemon.id,
    idPadded: padId(pokemon.id),
    name: pokemon.name,
    nameFormatted: formatName(pokemon.name),
    img: getPokemonImage(pokemon),
    bgClass: getCardBgClass(pokemon),

    typePillsHtml,
    navHtml,

    tabsHtml: tabsTemplate(activeTab),
    activeTab,

    aboutHtml,
    statsHtml,
    genderHtml,
    evolutionHtml
  };
}


function buildAboutHtml(pokemon) {
  const abilities = (pokemon.abilities || [])
    .map(a => formatName(a.ability.name))
    .join(", ");

  const rowsHtml = [
    aboutRowTemplate("Species", formatName(pokemon.name)),
    aboutRowTemplate("Height", `${pokemon.height * 10} cm`),
    aboutRowTemplate("Weight", `${(pokemon.weight / 10).toFixed(1)} kg`),
    aboutRowTemplate("Abilities", abilities || "-")
  ].join("");

  return aboutGridTemplate(rowsHtml);
}

function buildStatsHtml(pokemon) {
  const rowsHtml = (pokemon.stats || []).map(s => {
    return statsRowTemplate(formatName(s.stat.name), String(s.base_stat));
  }).join("");

  return statsListTemplate(rowsHtml);
}

function buildGenderHtml(species) {
  if (!species) return `<p class="tab-hint">No gender data available.</p>`;

  const genderText = formatGenderRate(species);
  const genderDiff = species.has_gender_differences ? "Yes" : "No";
  const eggGroups = ((species.egg_groups || []).map(g => formatName(g.name)).join(", ")) || "-";

  const rowsHtml = [
    aboutRowTemplate("Gender rate", genderText),
    aboutRowTemplate("Gender differences", genderDiff),
    aboutRowTemplate("Egg groups", eggGroups)
  ].join("");

  return aboutGridTemplate(rowsHtml);
}


function formatGenderRate(species) {
  if (species.gender_rate === -1) return "Genderless";
  if (typeof species.gender_rate !== "number") return "Unknown";
  const female = Math.round((species.gender_rate / 8) * 100);
  const male = 100 - female;
  return `${female}% female / ${male}% male`;
}

function formatName(name) {
  return name.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function padId(id) {
  return String(id).padStart(3, "0");
}

function getPokemonImage(pokemon) {
  const spr = pokemon.sprites;
  return spr.other?.["official-artwork"]?.front_default || spr.front_default || "";
}
