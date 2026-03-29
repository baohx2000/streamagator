import { format } from 'date-fns';
import { ServiceBadge } from '../ui/Badge';
import type { NormalizedEntry } from '../../types';

interface Props {
  entries: NormalizedEntry[];
}

interface RecentItem {
  title: string;
  service: NormalizedEntry['service'];
  lastWatchedAt: Date;
  count: number;
}

export function RecentWatches({ entries }: Props) {
  // Group by title, sorted by most recently watched, show top 15
  const titleMap = new Map<string, RecentItem>();
  for (const entry of entries) {
    const key = `${entry.service}|${entry.title.toLowerCase()}`;
    const existing = titleMap.get(key);
    if (!existing) {
      titleMap.set(key, { title: entry.title, service: entry.service, lastWatchedAt: entry.watchedAt, count: 1 });
    } else {
      existing.count++;
      if (entry.watchedAt > existing.lastWatchedAt) existing.lastWatchedAt = entry.watchedAt;
    }
  }

  const items = Array.from(titleMap.values())
    .sort((a, b) => b.lastWatchedAt.getTime() - a.lastWatchedAt.getTime())
    .slice(0, 15);

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Watches</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <ServiceBadge service={item.service} />
              <span className="text-gray-900 dark:text-gray-100 truncate">{item.title}</span>
              {item.count > 1 && (
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">×{item.count}</span>
              )}
            </div>
            <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
              {format(item.lastWatchedAt, 'MMM d, yyyy')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
