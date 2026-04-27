export const TYPE_CONFIG: Record<string, { color: string; name: string }> = {
  normal:   { color: '#A8A77A', name: 'Normal' },
  fire:     { color: '#EE8130', name: 'Fogo' },
  water:    { color: '#6390F0', name: 'Água' },
  electric: { color: '#F7D02C', name: 'Elétrico' },
  grass:    { color: '#7AC74C', name: 'Planta' },
  ice:      { color: '#96D9D6', name: 'Gelo' },
  fighting: { color: '#C22E28', name: 'Lutador' },
  poison:   { color: '#A33EA1', name: 'Veneno' },
  ground:   { color: '#E2BF65', name: 'Terra' },
  flying:   { color: '#A98FF3', name: 'Voador' },
  psychic:  { color: '#F95587', name: 'Psíquico' },
  bug:      { color: '#A6B91A', name: 'Inseto' },
  rock:     { color: '#B6A136', name: 'Pedra' },
  ghost:    { color: '#735797', name: 'Fantasma' },
  dragon:   { color: '#6F35FC', name: 'Dragão' },
  dark:     { color: '#705746', name: 'Sombrio' },
  steel:    { color: '#B7B7CE', name: 'Aço' },
  fairy:    { color: '#D685AD', name: 'Fada' },
};

export const GENERATIONS = [
  { gen: 1, label: 'Gen I',    region: 'Kanto',  min: 1,   max: 151  },
  { gen: 2, label: 'Gen II',   region: 'Johto',  min: 152, max: 251  },
  { gen: 3, label: 'Gen III',  region: 'Hoenn',  min: 252, max: 386  },
  { gen: 4, label: 'Gen IV',   region: 'Sinnoh', min: 387, max: 493  },
  { gen: 5, label: 'Gen V',    region: 'Unova',  min: 494, max: 649  },
  { gen: 6, label: 'Gen VI',   region: 'Kalos',  min: 650, max: 721  },
  { gen: 7, label: 'Gen VII',  region: 'Alola',  min: 722, max: 809  },
  { gen: 8, label: 'Gen VIII', region: 'Galar',  min: 810, max: 905  },
  { gen: 9, label: 'Gen IX',   region: 'Paldea', min: 906, max: 1025 },
];

export const STAT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};

export const ARTWORK_URL = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const SPRITE_URL = (id: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
