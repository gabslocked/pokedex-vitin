import { useState, useEffect, type KeyboardEvent, type CSSProperties } from 'react';
import { TYPE_CONFIG, ARTWORK_URL, SPRITE_URL } from '../lib/constants';
import type { Pokemon } from '../lib/types';

function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

interface PokemonCardProps {
  pokemon: Pokemon;
  index: number;
  onClick: (id: number) => void;
}

export default function PokemonCard({ pokemon, index, onClick }: PokemonCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 500);
    return () => clearTimeout(t);
  }, []);

  const primaryType = pokemon.types[0] ?? 'normal';
  const typeColor = TYPE_CONFIG[primaryType]?.color ?? '#A8A878';

  const numberLabel = `#${String(pokemon.id).padStart(4, '0')}`;

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(pokemon.id);
    }
  }

  return (
    <div
      className={`pokemon-card ${entering ? 'entering' : ''}`}
      style={
        {
          '--card-type-color': typeColor,
          '--card-index': index % 40,
        } as CSSProperties
      }
      role="button"
      tabIndex={0}
      onClick={() => onClick(pokemon.id)}
      onKeyDown={handleKeyDown}
    >
      <span className="pokemon-number">{numberLabel}</span>

      <div className="pokemon-img-wrapper">
        <img
          className={`pokemon-img ${imgLoaded ? 'loaded' : ''}`}
          src={ARTWORK_URL(pokemon.id)}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            const img = e.currentTarget;
            img.onerror = null;
            img.src = SPRITE_URL(pokemon.id);
          }}
          loading="lazy"
          decoding="async"
          alt={capitalize(pokemon.name)}
        />
      </div>

      <h3 className="pokemon-name">{capitalize(pokemon.name)}</h3>

      <div className="pokemon-types">
        {pokemon.types.map((type) => {
          const cfg = TYPE_CONFIG[type];
          return (
            <span
              key={type}
              className="type-badge"
              style={{ background: cfg?.color ?? '#A8A878' }}
            >
              {cfg?.name ?? capitalize(type)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
