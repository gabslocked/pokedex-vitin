import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { getList, getPokemon } from '../lib/api';
import type { PokemonListItem, Pokemon, SortOption } from '../lib/types';
import { TYPE_CONFIG, GENERATIONS } from '../lib/constants';
import Filters from '../components/Filters';
import PokemonCard from '../components/PokemonCard';
import PokemonModal from '../components/PokemonModal';
import BackToTop from '../components/BackToTop';

const PAGE_SIZE = 40;

export default function Home() {
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [pokemonCache, setPokemonCache] = useState<Record<number, Pokemon>>({});
  const [filteredList, setFilteredList] = useState<PokemonListItem[]>([]);
  const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [activeGen, setActiveGen] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('id-asc');

  const [modalPokemonId, setModalPokemonId] = useState<number | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Record<number, Pokemon>>({});

  // Background fetch all pokemon details for type filtering
  async function fetchAllTypes(list: PokemonListItem[]) {
    for (let i = 0; i < list.length; i += 50) {
      const batch = list.slice(i, i + 50);
      const results = await Promise.all(batch.map(p => getPokemon(p.id)));
      results.forEach(p => {
        if (p) cacheRef.current[p.id] = p;
      });
      if (i % 200 === 0) setPokemonCache({ ...cacheRef.current });
      await new Promise(r => setTimeout(r, 100));
    }
    setPokemonCache({ ...cacheRef.current });
  }

  // Initialization
  useEffect(() => {
    async function init() {
      const list = await getList();
      setAllPokemon(list);
      setFilteredList(list);

      // Load first page
      const firstPage = list.slice(0, PAGE_SIZE);
      const results = await Promise.all(firstPage.map(p => getPokemon(p.id)));
      results.forEach(p => {
        if (p) cacheRef.current[p.id] = p;
      });

      const initial = firstPage
        .map(p => cacheRef.current[p.id])
        .filter(Boolean) as Pokemon[];
      setDisplayedPokemon(initial);
      setCurrentOffset(PAGE_SIZE);
      setIsLoading(false);

      // Start background fetch
      fetchAllTypes(list);
    }
    init();
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    const query = searchQuery.trim().toLowerCase();

    let filtered = allPokemon.filter(p => {
      // Search
      if (query) {
        const paddedId = String(p.id).padStart(4, '0');
        if (
          !p.name.includes(query) &&
          String(p.id) !== query &&
          !paddedId.includes(query)
        )
          return false;
      }
      // Generation
      if (activeGen !== null) {
        const gen = GENERATIONS.find(g => g.gen === activeGen);
        if (gen && (p.id < gen.min || p.id > gen.max)) return false;
      }
      // Type
      if (activeTypes.size > 0) {
        const cached = cacheRef.current[p.id];
        if (!cached) return false;
        if (!cached.types.some(t => activeTypes.has(t))) return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'id-asc':
          return a.id - b.id;
        case 'id-desc':
          return b.id - a.id;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
      }
    });

    setFilteredList(filtered);
    setCurrentOffset(0);
    setDisplayedPokemon([]);
  }, [allPokemon, searchQuery, activeTypes, activeGen, sortOption, pokemonCache]);

  // Re-run filters when dependencies change
  useEffect(() => {
    if (allPokemon.length === 0) return;
    applyFilters();
  }, [applyFilters]);

  // Load next page
  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || currentOffset >= filteredList.length) return;
    setIsLoadingMore(true);

    const slice = filteredList.slice(currentOffset, currentOffset + PAGE_SIZE);
    const toFetch = slice.filter(p => !cacheRef.current[p.id]);
    if (toFetch.length > 0) {
      const results = await Promise.all(toFetch.map(p => getPokemon(p.id)));
      results.forEach(p => {
        if (p) cacheRef.current[p.id] = p;
      });
    }

    const newPokemon = slice
      .map(p => cacheRef.current[p.id])
      .filter(Boolean) as Pokemon[];
    setDisplayedPokemon(prev => [...prev, ...newPokemon]);
    setCurrentOffset(prev => prev + slice.length);
    setIsLoadingMore(false);
  }, [filteredList, currentOffset, isLoadingMore]);

  // Trigger first page load when filteredList resets
  useEffect(() => {
    if (filteredList.length > 0 && displayedPokemon.length === 0 && currentOffset === 0) {
      loadNextPage();
    }
  }, [filteredList, displayedPokemon.length, currentOffset, loadNextPage]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadNextPage();
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadNextPage]);

  // Filter handlers
  const handleToggleType = (type: string) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const handleSelectGen = (gen: number | null) => {
    setActiveGen(prev => (prev === gen ? null : gen));
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setActiveTypes(new Set());
    setActiveGen(null);
    setSortOption('id-asc');
  };

  return (
    <>
      <Head>
        <title>Pokédex Completa — Todas as Gerações</title>
        <meta
          name="description"
          content="Pokédex completa com todos os 1025 Pokémon de todas as gerações"
        />
      </Head>

      {isLoading && (
        <div className="loading-overlay">
          <div className="pokeball-loader" />
          <p className="loading-text">Carregando Pokédex...</p>
        </div>
      )}

      <header className="header">
        <div className="header-brand">
          <div className="header-icon" aria-hidden="true" />
          <h1 className="header-title">
            Poké<span>dex</span>
          </h1>
        </div>
        <span className="header-count">{allPokemon.length} Pokémon</span>
      </header>

      <Filters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTypes={activeTypes}
        onToggleType={handleToggleType}
        activeGen={activeGen}
        onSelectGen={handleSelectGen}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onClearAll={handleClearAll}
      />

      <div className="main" style={{ paddingBottom: 0 }}>
        <div className="stats-bar">
          <span className="stats-count">
            {filteredList.length === allPokemon.length ? (
              <>
                Exibindo todos os <strong>{allPokemon.length}</strong> Pokémon
              </>
            ) : (
              <>
                Exibindo <strong>{filteredList.length}</strong> de{' '}
                <strong>{allPokemon.length}</strong> Pokémon
              </>
            )}
          </span>
        </div>
      </div>

      <div className="main" style={{ paddingTop: 0 }}>
        <main className="pokemon-grid">
          {displayedPokemon.map((pokemon, i) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              index={i}
              onClick={setModalPokemonId}
            />
          ))}
          {filteredList.length === 0 && !isLoading && (
            <div className="no-results">
              <div className="no-results-icon">?</div>
              <p className="no-results-title">Nenhum Pokémon encontrado</p>
              <p className="no-results-sub">Tente ajustar os filtros</p>
            </div>
          )}
        </main>

        {currentOffset < filteredList.length && (
          <div ref={sentinelRef} className="scroll-sentinel">
            <div className="mini-spinner" />
          </div>
        )}
      </div>

      <PokemonModal
        pokemonId={modalPokemonId}
        onClose={() => setModalPokemonId(null)}
        onNavigate={setModalPokemonId}
      />

      <BackToTop />
    </>
  );
}
