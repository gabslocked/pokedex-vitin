import React, { useState, useEffect } from 'react';
import { TYPE_CONFIG, ARTWORK_URL, SPRITE_URL, STAT_NAMES } from '../lib/constants';
import { getPokemon, getSpecies, getEvolutionChain } from '../lib/api';
import type { Pokemon, Species, EvolutionStage } from '../lib/types';

function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function statTierClass(value: number): string {
  if (value >= 150) return 'tier-great';
  if (value >= 100) return 'tier-good';
  if (value >= 60) return 'tier-mid';
  return 'tier-low';
}

function evoDetail(evo: EvolutionStage): string {
  if (evo.minLevel) return `Nv. ${evo.minLevel}`;
  if (evo.item) return capitalize(evo.item);
  if (evo.trigger === 'trade') return 'Troca';
  if (evo.trigger) return capitalize(evo.trigger);
  return '';
}

interface PokemonModalProps {
  pokemonId: number | null;
  onClose: () => void;
  onNavigate: (id: number) => void;
}

type ActiveTab = 'about' | 'stats' | 'evolution';

export default function PokemonModal({ pokemonId, onClose, onNavigate }: PokemonModalProps) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<Species | null>(null);
  const [evolution, setEvolution] = useState<EvolutionStage[] | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('about');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pokemonId === null) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setPokemon(null);
      setSpecies(null);
      setEvolution(null);
      setActiveTab('about');

      const [poke, spec] = await Promise.all([
        getPokemon(pokemonId!),
        getSpecies(pokemonId!),
      ]);

      if (cancelled) return;

      setPokemon(poke);
      setSpecies(spec);

      if (spec?.evolutionChainUrl) {
        const chain = await getEvolutionChain(spec.evolutionChainUrl);
        if (!cancelled) setEvolution(chain);
      }

      setLoading(false);
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [pokemonId]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (pokemonId === null) return null;

  const primaryType = pokemon?.types[0] ?? 'normal';
  const secondaryType = pokemon?.types[1] ?? null;
  const color1 = TYPE_CONFIG[primaryType]?.color ?? '#A8A878';
  const color2 = secondaryType ? (TYPE_CONFIG[secondaryType]?.color ?? color1) : color1;
  const gradient = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} type="button" aria-label="Fechar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="20"
            height="20"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div
          className="modal-hero"
          style={
            {
              '--modal-type-color': color1,
              background: gradient,
            } as React.CSSProperties
          }
        >
          <div className="modal-hero-meta">
            <span className="modal-number">
              {pokemon ? `#${String(pokemon.id).padStart(4, '0')}` : '—'}
            </span>
            <h2 className="modal-name">{pokemon ? capitalize(pokemon.name) : '...'}</h2>
          </div>

          <div className="modal-types">
            {pokemon?.types.map((type) => {
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

          {pokemon && (
            <img
              className="modal-pokemon-img"
              src={ARTWORK_URL(pokemon.id)}
              alt={capitalize(pokemon.name)}
              onError={(e) => {
                const img = e.currentTarget;
                img.onerror = null;
                img.src = pokemon.spriteFallback || SPRITE_URL(pokemon.id);
              }}
            />
          )}
        </div>

        <div
          className="modal-body"
          style={{ '--modal-type-color': color1 } as React.CSSProperties}
        >
          <div className="modal-tabs">
            <button
              className={`tab-btn${activeTab === 'about' ? ' active' : ''}`}
              onClick={() => setActiveTab('about')}
              type="button"
            >
              Sobre
            </button>
            <button
              className={`tab-btn${activeTab === 'stats' ? ' active' : ''}`}
              onClick={() => setActiveTab('stats')}
              type="button"
            >
              Stats
            </button>
            <button
              className={`tab-btn${activeTab === 'evolution' ? ' active' : ''}`}
              onClick={() => setActiveTab('evolution')}
              type="button"
            >
              Evolução
            </button>
          </div>

          {loading && <div className="tab-panel active" style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>}

          {!loading && activeTab === 'about' && pokemon && (
            <div className="tab-panel active">
              {species?.flavorText && (
                <div className="about-description">{species.flavorText}</div>
              )}
              <div className="about-grid">
                <div className="about-item">
                  <div className="about-label">Altura</div>
                  <div className="about-value">{(pokemon.height / 10).toFixed(1)} m</div>
                </div>
                <div className="about-item">
                  <div className="about-label">Peso</div>
                  <div className="about-value">{(pokemon.weight / 10).toFixed(1)} kg</div>
                </div>
                <div className="about-item">
                  <div className="about-label">Categoria</div>
                  <div className="about-value">{species?.genus ?? '—'}</div>
                </div>
                <div className="about-item">
                  <div className="about-label">Habilidades</div>
                  <div className="about-value">
                    {pokemon.abilities
                      .map((a) =>
                        a.isHidden
                          ? `${capitalize(a.name)} (Oculta)`
                          : capitalize(a.name)
                      )
                      .join(', ')}
                  </div>
                </div>
                <div className="about-item">
                  <div className="about-label">Grupo de Ovos</div>
                  <div className="about-value">
                    {species?.eggGroups?.map(capitalize).join(', ') ?? '—'}
                  </div>
                </div>
                <div className="about-item">
                  <div className="about-label">Taxa de Captura</div>
                  <div className="about-value">{species?.captureRate ?? '—'}</div>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'stats' && pokemon && (
            <div className="tab-panel active">
              <div className="stats-list">
                {pokemon.stats.map((stat) => {
                  const pct = Math.min((stat.value / 255) * 100, 100);
                  return (
                    <div key={stat.name} className="stat-row">
                      <span className="stat-label">
                        {STAT_NAMES[stat.name] ?? capitalize(stat.name)}
                      </span>
                      <span className="stat-value">{stat.value}</span>
                      <div className="stat-bar-track">
                        <div
                          className={`stat-bar-fill ${statTierClass(stat.value)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {(() => {
                  const total = pokemon.stats.reduce((sum, s) => sum + s.value, 0);
                  const totalPct = Math.min((total / 720) * 100, 100);
                  return (
                    <div className="stat-row stat-total">
                      <span className="stat-label">Total</span>
                      <span className="stat-value">{total}</span>
                      <div className="stat-bar-track">
                        <div
                          className="stat-bar-fill tier-good"
                          style={{ width: `${totalPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {!loading && activeTab === 'evolution' && (
            <div className="tab-panel active">
              <div className="evolution-chain">
                {evolution && evolution.length > 0 ? (
                  evolution.map((evo, i) => (
                    <React.Fragment key={evo.id}>
                      {i > 0 && (
                        <div className="evo-arrow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="20"
                            height="20"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                          {evoDetail(evo) && (
                            <span className="evo-arrow-label">{evoDetail(evo)}</span>
                          )}
                        </div>
                      )}
                      <div
                        className="evo-stage"
                        role="button"
                        tabIndex={0}
                        onClick={() => onNavigate(evo.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onNavigate(evo.id);
                          }
                        }}
                      >
                        <div className="evo-img-wrapper">
                          <img
                            className="evo-img"
                            src={ARTWORK_URL(evo.id)}
                            alt={capitalize(evo.name)}
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.onerror = null;
                              img.src = evo.sprite || SPRITE_URL(evo.id);
                            }}
                          />
                        </div>
                        <span className="evo-name">{capitalize(evo.name)}</span>
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', opacity: 0.6 }}>
                    Sem cadeia de evolução.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
