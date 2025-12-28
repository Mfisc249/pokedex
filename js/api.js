const API_BASE = "https://pokeapi.co/api/v2";
const pokemonCache = new Map();
const speciesCache = new Map();
const evoCache = new Map();

async function fetchPokemonList(limit, offset) {
  const url = `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("List fetch failed");
  return res.json();
}

async function fetchPokemon(nameOrId) {
  const key = String(nameOrId).toLowerCase();
  if (pokemonCache.has(key)) return pokemonCache.get(key);

  const res = await fetch(`${API_BASE}/pokemon/${key}`);
  if (!res.ok) throw new Error("Pokemon not found");
  const data = await res.json();
  pokemonCache.set(key, data);
  pokemonCache.set(String(data.id), data);
  return data;
}

async function fetchPokemonByUrl(url) {
  const id = url.split("/").filter(Boolean).pop();
  return fetchPokemon(id);
}

async function fetchSpecies(id) {
  const key = String(id);
  if (speciesCache.has(key)) return speciesCache.get(key);

  const res = await fetch(`${API_BASE}/pokemon-species/${key}`);
  if (!res.ok) throw new Error("Species fetch failed");
  const data = await res.json();
  speciesCache.set(key, data);
  return data;
}

async function fetchEvolutionChainForPokemon(id) {
  const species = await fetchSpecies(id);
  const url = species.evolution_chain?.url;
  if (!url) return null;
  if (evoCache.has(url)) return evoCache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Evo chain fetch failed");
  const data = await res.json();
  evoCache.set(url, data);
  return data;
}

// Returns ALL evolution paths (supports branching chains like Eevee).
// Output example: [["eevee","vaporeon"],["eevee","jolteon"],...]
function extractEvolutionPaths(chainNode) {
  if (!chainNode || !chainNode.species) return [];

  const name = chainNode.species.name;
  const next = chainNode.evolves_to || [];

  if (!next.length) {
    return [[name]];
  }

  const paths = [];
  next.forEach((child) => {
    const childPaths = extractEvolutionPaths(child);
    childPaths.forEach((p) => paths.push([name, ...p]));
  });
  return paths;
}

function getUniqueEvolutionNames(paths) {
  const set = new Set();
  (paths || []).forEach((p) => (p || []).forEach((n) => set.add(n)));
  return Array.from(set);
}
