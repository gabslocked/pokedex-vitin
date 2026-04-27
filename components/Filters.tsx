import { TYPE_CONFIG, GENERATIONS } from '../lib/constants';
import type { SortOption } from '../lib/types';

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTypes: Set<string>;
  onToggleType: (type: string) => void;
  activeGen: number | null;
  onSelectGen: (gen: number | null) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onClearAll: () => void;
}

export default function Filters({
  searchQuery,
  onSearchChange,
  activeTypes,
  onToggleType,
  activeGen,
  onSelectGen,
  sortOption,
  onSortChange,
  onClearAll,
}: FiltersProps) {
  const hasActiveFilters =
    searchQuery.length > 0 ||
    activeTypes.size > 0 ||
    activeGen !== null ||
    sortOption !== 'id-asc';

  return (
    <section className="filters">
      <div className="main" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="search-wrapper">
          <div className="search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="18"
              height="18"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            className="search-input"
            id="search-input"
            type="search"
            placeholder="Buscar por nome ou número..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="filter-pills-row" role="group" aria-label="Filtrar por tipo">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              className={`type-pill${activeTypes.has(key) ? ' active' : ''}`}
              style={{ background: cfg.color }}
              onClick={() => onToggleType(key)}
              type="button"
            >
              {cfg.name}
            </button>
          ))}
        </div>

        <div className="filter-controls">
          <div className="filter-pills-row" role="group" aria-label="Filtrar por geração">
            {GENERATIONS.map((gen) => (
              <button
                key={gen.gen}
                className={`gen-pill${activeGen === gen.gen ? ' active' : ''}`}
                onClick={() => onSelectGen(activeGen === gen.gen ? null : gen.gen)}
                type="button"
              >
                {gen.label} · {gen.region}
              </button>
            ))}
          </div>

          <select
            className="sort-select"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="id-asc">Número ↑</option>
            <option value="id-desc">Número ↓</option>
            <option value="name-asc">Nome A–Z</option>
            <option value="name-desc">Nome Z–A</option>
          </select>

          {hasActiveFilters && (
            <button className="btn-clear" onClick={onClearAll} type="button">
              Limpar filtros
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
