export interface PokemonListItem {
  id: number;
  name: string;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  abilities: { name: string; isHidden: boolean }[];
  stats: { name: string; value: number }[];
  height: number;
  weight: number;
  sprite: string;
  spriteFallback: string;
}

export interface Species {
  id: number;
  name: string;
  genus: string;
  flavorText: string;
  generation: number | null;
  isLegendary: boolean;
  isMythical: boolean;
  isBaby: boolean;
  color: string | null;
  habitat: string | null;
  eggGroups: string[];
  captureRate: number | null;
  baseHappiness: number | null;
  growthRate: string | null;
  evolutionChainUrl: string | null;
}

export interface EvolutionStage {
  id: number;
  name: string;
  sprite: string;
  minLevel: number | null;
  trigger: string | null;
  item: string | null;
}

export type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc';
