import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { FilterState, StreamingService } from '../../types';
import { SERVICE_LABELS } from '../../constants/services';

interface FilterBarProps {
  filters: FilterState;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  counts: Record<StreamingService, number>;
  availableYears: number[];
  uniqueOnly: boolean;
  setUniqueOnly: (v: boolean) => void;
}

const ALL_SERVICES: StreamingService[] = ['netflix', 'amazon', 'hulu', 'plex'];

export function FilterBar({ filters, setFilters, resetFilters, counts, availableYears, uniqueOnly, setUniqueOnly }: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => setFilters({ search: searchInput }), 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function toggleService(svc: StreamingService) {
    const current = filters.services;
    const next = current.includes(svc) ? current.filter(s => s !== svc) : [...current, svc];
    setFilters({ services: next.length > 0 ? next : current });
  }

  const hasActiveFilters =
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.year ||
    filters.contentType !== 'all' ||
    filters.services.length !== ALL_SERVICES.length + 1; // +1 for 'unknown'

  return (
    <div className="flex flex-wrap gap-3 items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Service toggles */}
      <div className="flex gap-2">
        {ALL_SERVICES.filter(s => counts[s] > 0).map(svc => (
          <button
            key={svc}
            onClick={() => toggleService(svc)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filters.services.includes(svc)
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                : 'bg-white dark:bg-gray-700 text-gray-500 border-gray-300 dark:border-gray-600'
            }`}
          >
            {SERVICE_LABELS[svc]} ({counts[svc].toLocaleString()})
          </button>
        ))}
      </div>

      {/* Year */}
      {availableYears.length > 1 && (
        <select
          value={filters.year}
          onChange={e => setFilters({ year: e.target.value })}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <option value="">All years</option>
          {availableYears.map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      )}

      {/* Content type */}
      <select
        value={filters.contentType}
        onChange={e => setFilters({ contentType: e.target.value as FilterState['contentType'] })}
        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
      >
        <option value="all">All types</option>
        <option value="movie">Movies</option>
        <option value="episode">Episodes</option>
        <option value="unknown">Unknown</option>
      </select>

      {/* Date range */}
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => setFilters({ dateFrom: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs"
        />
        <span>–</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => setFilters({ dateTo: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs"
        />
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-40">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search titles..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        />
        {searchInput && (
          <button onClick={() => { setSearchInput(''); setFilters({ search: '' }); }} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Unique titles toggle */}
      <button
        onClick={() => setUniqueOnly(!uniqueOnly)}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
          uniqueOnly
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
            : 'bg-white dark:bg-gray-700 text-gray-500 border-gray-300 dark:border-gray-600'
        }`}
      >
        Unique titles
      </button>

      {hasActiveFilters && (
        <button onClick={resetFilters} className="text-xs text-indigo-500 hover:underline whitespace-nowrap">
          Reset filters
        </button>
      )}
    </div>
  );
}
