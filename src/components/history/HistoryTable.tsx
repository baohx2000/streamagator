import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ServiceBadge, ContentBadge } from '../ui/Badge';
import type { NormalizedEntry } from '../../types';

const PAGE_SIZE = 100;

interface HistoryTableProps {
  entries: NormalizedEntry[];
  uniqueOnly: boolean;
}

export function HistoryTable({ entries, uniqueOnly }: HistoryTableProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const displayEntries = uniqueOnly
    ? (() => {
        const seen = new Set<string>();
        return entries.filter(e => {
          const key = `${e.service}|${e.title.toLowerCase()}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      })()
    : entries;

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [entries, uniqueOnly]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(v => Math.min(v + PAGE_SIZE, displayEntries.length)); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [displayEntries.length]);

  const shown = displayEntries.slice(0, visible);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">
        Showing {shown.length.toLocaleString()} of {displayEntries.length.toLocaleString()} entries
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Episode</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {shown.map(entry => (
              <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-2">
                  <ServiceBadge service={entry.service} />
                </td>
                <td className="px-4 py-2 max-w-xs">
                  <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                    {entry.title}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500 max-w-xs">
                  <span className="line-clamp-1">{entry.episodeTitle || '—'}</span>
                </td>
                <td className="px-4 py-2">
                  <ContentBadge type={entry.contentType} />
                </td>
                <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                  {format(entry.watchedAt, 'MMM d, yyyy')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div ref={sentinelRef} />
    </div>
  );
}
