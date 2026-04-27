import type { PokemonListItem, Pokemon, Species, EvolutionStage } from './types';
import { ARTWORK_URL, SPRITE_URL } from './constants';

const BASE = 'https://pokeapi.co/api/v2';

const GEN_MAP: Record<string, number> = {
  'generation-i': 1,
  'generation-ii': 2,
  'generation-iii': 3,
  'generation-iv': 4,
  'generation-v': 5,
  'generation-vi': 6,
  'generation-vii': 7,
  'generation-viii': 8,
  'generation-ix': 9,
};

const pokemonCache = new Map<number, Pokemon>();
const speciesCache = new Map<number, Species>();
const evolutionCache = new Map<string, EvolutionStage[]>();

export async function getList(): Promise<PokemonListItem[]> {
  const res = await fetch(`${BASE}/pokemon?limit=1025&offset=0`);
  if (!res.ok) throw new Error(`Failed to fetch pokemon list: ${res.status}`);
  const data = await res.json() as { results: { name: string; url: string }[] };
  return data.results.map((entry) => {
    const parts = entry.url.replace(/\/$/, '').split('/');
    const id = parseInt(parts[parts.length - 1], 10);
    return { id, name: entry.name };
  });
}

export async function getPokemon(id: number): Promise<Pokemon | null> {
  if (pokemonCache.has(id)) return pokemonCache.get(id)!;

  try {
    const res = await fetch(`${BASE}/pokemon/${id}`);
    if (!res.ok) return null;
    const data = await res.json() as {
      id: number;
      name: string;
      height: number;
      weight: number;
      types: { type: { name: string } }[];
      abilities: { ability: { name: string }; is_hidden: boolean }[];
      stats: { stat: { name: string }; base_stat: number }[];
      sprites: {
        front_default: string | null;
        other?: { 'official-artwork'?: { front_default: string | null } };
      };
    };

    const pokemon: Pokemon = {
      id: data.id,
      name: data.name,
      height: data.height,
      weight: data.weight,
      types: data.types.map((t) => t.type.name),
      abilities: data.abilities.map((a) => ({
        name: a.ability.name,
        isHidden: a.is_hidden,
      })),
      stats: data.stats.map((s) => ({
        name: s.stat.name,
        value: s.base_stat,
      })),
      sprite: ARTWORK_URL(data.id),
      spriteFallback: data.sprites.front_default ?? SPRITE_URL(data.id),
    };

    pokemonCache.set(id, pokemon);
    return pokemon;
  } catch {
    return null;
  }
}

export async function getSpecies(id: number): Promise<Species | null> {
  if (speciesCache.has(id)) return speciesCache.get(id)!;

  try {
    const res = await fetch(`${BASE}/pokemon-species/${id}`);
    if (!res.ok) return null;
    const data = await res.json() as {
      id: number;
      name: string;
      genera: { genus: string; language: { name: string } }[];
      flavor_text_entries: { flavor_text: string; language: { name: string } }[];
      generation: { name: string } | null;
      is_legendary: boolean;
      is_mythical: boolean;
      is_baby: boolean;
      color: { name: string } | null;
      habitat: { name: string } | null;
      egg_groups: { name: string }[];
      capture_rate: number | null;
      base_happiness: number | null;
      growth_rate: { name: string } | null;
      evolution_chain: { url: string } | null;
    };

    const genusEntry = data.genera.find((g) => g.language.name === 'en');
    const flavorEntry = data.flavor_text_entries.find((f) => f.language.name === 'en');

    const species: Species = {
      id: data.id,
      name: data.name,
      genus: genusEntry?.genus ?? '',
      flavorText: flavorEntry?.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') ?? '',
      generation: data.generation ? (GEN_MAP[data.generation.name] ?? null) : null,
      isLegendary: data.is_legendary,
      isMythical: data.is_mythical,
      isBaby: data.is_baby,
      color: data.color?.name ?? null,
      habitat: data.habitat?.name ?? null,
      eggGroups: data.egg_groups.map((g) => g.name),
      captureRate: data.capture_rate,
      baseHappiness: data.base_happiness,
      growthRate: data.growth_rate?.name ?? null,
      evolutionChainUrl: data.evolution_chain?.url ?? null,
    };

    speciesCache.set(id, species);
    return species;
  } catch {
    return null;
  }
}

interface ChainLink {
  species: { name: string; url: string };
  evolution_details: {
    min_level: number | null;
    trigger: { name: string } | null;
    item: { name: string } | null;
  }[];
  evolves_to: ChainLink[];
}

function flattenChain(link: ChainLink, stages: EvolutionStage[]): void {
  const parts = link.species.url.replace(/\/$/, '').split('/');
  const id = parseInt(parts[parts.length - 1], 10);
  const detail = link.evolution_details[0] ?? null;

  stages.push({
    id,
    name: link.species.name,
    sprite: SPRITE_URL(id),
    minLevel: detail?.min_level ?? null,
    trigger: detail?.trigger?.name ?? null,
    item: detail?.item?.name ?? null,
  });

  for (const next of link.evolves_to) {
    flattenChain(next, stages);
  }
}

export async function getEvolutionChain(url: string): Promise<EvolutionStage[] | null> {
  if (evolutionCache.has(url)) return evolutionCache.get(url)!;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as { chain: ChainLink };

    const stages: EvolutionStage[] = [];
    flattenChain(data.chain, stages);

    evolutionCache.set(url, stages);
    return stages;
  } catch {
    return null;
  }
}
