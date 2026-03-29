import { ServiceBadge } from '../ui/Badge';
import type { NormalizedEntry, StreamingService } from '../../types';

interface Props {
  entries: NormalizedEntry[];
}

interface SeriesRow {
  title: string;
  service: StreamingService;
  uniqueEpisodes: number;
  totalWatches: number;
  seasons: Set<number>;
}

const MIN_EPISODES = 8;

export function MostWatched({ entries }: Props) {
  const seriesMap = new Map<string, SeriesRow>();

  for (const entry of entries) {
    if (entry.contentType !== 'episode') continue;
    const key = `${entry.service}|${entry.title.toLowerCase()}`;
    if (!seriesMap.has(key)) {
      seriesMap.set(key, {
        title: entry.title,
        service: entry.service,
        uniqueEpisodes: 0,
        totalWatches: 0,
        seasons: new Set(),
      });
    }
    const row = seriesMap.get(key)!;
    row.totalWatches++;
    // Count unique episodes by episode title (fall back to rawTitle)
    row.uniqueEpisodes = (() => {
      // We'll track this via a separate set per series — rebuild below
      return row.uniqueEpisodes;
    })();
    if (entry.season != null) row.seasons.add(entry.season);
  }

  // Rebuild with proper unique episode tracking
  const episodeSets = new Map<string, Set<string>>();
  for (const entry of entries) {
    if (entry.contentType !== 'episode') continue;
    const key = `${entry.service}|${entry.title.toLowerCase()}`;
    if (!episodeSets.has(key)) episodeSets.set(key, new Set());
    const epKey = entry.episodeTitle ? entry.episodeTitle.toLowerCase() : entry.rawTitle.toLowerCase();
    episodeSets.get(key)!.add(epKey);
  }

  const rows = Array.from(seriesMap.entries())
    .map(([key, row]) => ({ ...row, uniqueEpisodes: episodeSets.get(key)?.size ?? 0 }))
    .filter(row => row.uniqueEpisodes >= MIN_EPISODES)
    .sort((a, b) => b.uniqueEpisodes - a.uniqueEpisodes);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
        <p className="text-lg font-medium">No series with {MIN_EPISODES} or more unique episodes yet.</p>
        <p className="text-sm mt-1">Watch more episodes and they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{rows.length} series with {MIN_EPISODES}+ unique episodes</p>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Series</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3 text-right">Unique Episodes</th>
              <th className="px-4 py-3 text-right">Total Watches</th>
              <th className="px-4 py-3 text-right">Seasons</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">{row.title}</td>
                <td className="px-4 py-2"><ServiceBadge service={row.service} /></td>
                <td className="px-4 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">{row.uniqueEpisodes}</td>
                <td className="px-4 py-2 text-right tabular-nums text-gray-500">
                  {row.totalWatches > row.uniqueEpisodes
                    ? <span title="Includes rewatches">{row.totalWatches} <span className="text-xs text-gray-400">(+{row.totalWatches - row.uniqueEpisodes} rewatches)</span></span>
                    : row.totalWatches}
                </td>
                <td className="px-4 py-2 text-right text-gray-500">
                  {row.seasons.size > 0 ? row.seasons.size : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
