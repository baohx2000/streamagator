import { format, getDay, differenceInDays } from 'date-fns';
import type { NormalizedEntry, AggregatedStats, StreamingService } from '../types';
import { DAYS_OF_WEEK } from '../constants/services';

export function computeStats(entries: NormalizedEntry[]): AggregatedStats {
  const byService: Record<StreamingService, number> = { netflix: 0, amazon: 0, hulu: 0, plex: 0, unknown: 0 };
  const monthMap = new Map<string, { netflix: number; amazon: number; hulu: number; plex: number; unknown: number }>();
  const dayMap = new Map<string, number>();
  const titleMap = new Map<string, { count: number; service: StreamingService }>();
  const dateSet = new Set<string>();
  const uniqueTitleSet = new Set<string>();

  DAYS_OF_WEEK.forEach(d => dayMap.set(d, 0));

  for (const entry of entries) {
    byService[entry.service] = (byService[entry.service] || 0) + 1;

    const month = format(entry.watchedAt, 'yyyy-MM');
    if (!monthMap.has(month)) {
      monthMap.set(month, { netflix: 0, amazon: 0, hulu: 0, plex: 0, unknown: 0 });
    }
    monthMap.get(month)![entry.service]++;

    const dayKey = DAYS_OF_WEEK[getDay(entry.watchedAt)];
    dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);

    const titleKey = entry.title.toLowerCase();
    if (!titleMap.has(titleKey)) {
      titleMap.set(titleKey, { count: 0, service: entry.service });
    }
    titleMap.get(titleKey)!.count++;

    uniqueTitleSet.add(titleKey);
    dateSet.add(format(entry.watchedAt, 'yyyy-MM-dd'));
  }

  // Build sorted month array
  const sortedMonths = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, counts]) => ({
      month: format(new Date(month + '-01'), 'MMM yyyy'),
      ...counts,
    }));

  // Most active month
  let mostActiveMonth = '';
  let maxMonthCount = 0;
  for (const [month, counts] of monthMap.entries()) {
    const total = counts.netflix + counts.amazon + counts.hulu + counts.plex + counts.unknown;
    if (total > maxMonthCount) {
      maxMonthCount = total;
      mostActiveMonth = format(new Date(month + '-01'), 'MMM yyyy');
    }
  }

  // Top 10 titles
  const topTitles = Array.from(titleMap.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([title, { count, service }]) => ({ title, count, service }));

  // Streak calculation
  const sortedDates = Array.from(dateSet).sort();
  let longestStreak = sortedDates.length > 0 ? 1 : 0;
  let currentRun = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = differenceInDays(new Date(sortedDates[i]), new Date(sortedDates[i - 1]));
    if (diff === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
  let currentStreak = 0;
  if (sortedDates.length > 0) {
    const last = sortedDates[sortedDates.length - 1];
    if (last === today || last === yesterday) {
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const diff = differenceInDays(new Date(sortedDates[i + 1]), new Date(sortedDates[i]));
        if (diff === 1) currentStreak++;
        else break;
      }
    }
  }

  return {
    total: entries.length,
    uniqueTitles: uniqueTitleSet.size,
    byService,
    byMonth: sortedMonths,
    byDayOfWeek: DAYS_OF_WEEK.map(day => ({ day, count: dayMap.get(day) || 0 })),
    topTitles,
    longestStreak,
    currentStreak,
    mostActiveMonth,
  };
}
