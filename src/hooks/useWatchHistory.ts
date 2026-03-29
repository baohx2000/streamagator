import { useState, useMemo } from 'react';
import type { NormalizedEntry, FilterState, AggregatedStats, StreamingService } from '../types';
import { computeStats } from '../utils/stats';

const DEFAULT_FILTERS: FilterState = {
  services: ['netflix', 'amazon', 'hulu', 'plex', 'unknown'],
  contentType: 'all',
  dateFrom: '',
  dateTo: '',
  search: '',
};

export function useWatchHistory() {
  const [entries, setEntries] = useState<NormalizedEntry[]>([]);
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);

  function addEntries(newEntries: NormalizedEntry[]) {
    setEntries(prev => {
      const existingIds = new Set(prev.map(e => e.id));
      const deduped = newEntries.filter(e => !existingIds.has(e.id));
      return [...prev, ...deduped].sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime());
    });
  }

  function removeService(service: StreamingService) {
    setEntries(prev => prev.filter(e => e.service !== service));
  }

  function setFilters(partial: Partial<FilterState>) {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }

  function resetFilters() {
    setFiltersState(DEFAULT_FILTERS);
  }

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (!filters.services.includes(entry.service)) return false;
      if (filters.contentType !== 'all' && entry.contentType !== filters.contentType) return false;
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (entry.watchedAt < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (entry.watchedAt > to) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!entry.title.toLowerCase().includes(q) && !(entry.episodeTitle?.toLowerCase().includes(q))) {
          return false;
        }
      }
      return true;
    });
  }, [entries, filters]);

  const stats: AggregatedStats = useMemo(() => computeStats(filteredEntries), [filteredEntries]);

  const serviceEntryCounts = useMemo(() => {
    const counts: Record<StreamingService, number> = { netflix: 0, amazon: 0, hulu: 0, plex: 0, unknown: 0 };
    for (const e of entries) counts[e.service]++;
    return counts;
  }, [entries]);

  return {
    entries,
    filteredEntries,
    filters,
    stats,
    serviceEntryCounts,
    addEntries,
    removeService,
    setFilters,
    resetFilters,
  };
}
