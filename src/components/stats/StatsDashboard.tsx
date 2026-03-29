import { StatCard } from './StatCard';
import { WatchByServiceChart } from './WatchByServiceChart';
import { WatchByMonthChart } from './WatchByMonthChart';
import { RecentWatches } from './RecentWatches';
import { TopTitlesChart } from './TopTitlesChart';
import type { AggregatedStats, NormalizedEntry } from '../../types';

interface Props {
  stats: AggregatedStats;
  entries: NormalizedEntry[];
}

export function StatsDashboard({ stats, entries }: Props) {
  const hasNetflix = stats.byService.netflix > 0;
  const hasAmazon = stats.byService.amazon > 0;
  const hasHulu = stats.byService.hulu > 0;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Watch Events" value={stats.total} />
        <StatCard label="Unique Titles" value={stats.uniqueTitles} />
        <StatCard label="Longest Streak" value={stats.longestStreak} sub="consecutive days" />
        <StatCard label="Most Active Month" value={stats.mostActiveMonth || '—'} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WatchByServiceChart byService={stats.byService} />
        <RecentWatches entries={entries} />
        <WatchByMonthChart
          byMonth={stats.byMonth}
          hasNetflix={hasNetflix}
          hasAmazon={hasAmazon}
          hasHulu={hasHulu}
        />
        <TopTitlesChart topTitles={stats.topTitles} />
      </div>
    </div>
  );
}
