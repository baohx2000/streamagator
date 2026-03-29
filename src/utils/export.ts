import { format } from 'date-fns';
import type { NormalizedEntry } from '../types';
import { SERVICE_LABELS } from '../constants/services';

export function exportToCSV(entries: NormalizedEntry[]): void {
  const header = 'Service,Title,Episode,Season,Content Type,Watched At\n';
  const rows = entries.map(e => {
    const cells = [
      SERVICE_LABELS[e.service],
      `"${e.title.replace(/"/g, '""')}"`,
      e.episodeTitle ? `"${e.episodeTitle.replace(/"/g, '""')}"` : '',
      e.season ?? '',
      e.contentType,
      format(e.watchedAt, 'yyyy-MM-dd'),
    ];
    return cells.join(',');
  });
  const csv = header + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `watch-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
