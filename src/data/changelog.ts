export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.1.3',
    date: '2026-03-30',
    changes: [
      'Fix Amazon Prime CSV: filter out "Not available" title entries',
      'Fix Amazon Prime CSV: strip season suffix from series titles (e.g. "Show - Season 2" → "Show")',
      'Fix Amazon Prime CSV: correctly classify episodes in Most Watched screen',
    ],
  },
  {
    version: '0.1.2',
    date: '2026-03-29',
    changes: [
      'Fix Amazon Prime Video importer for the detailed CSV export format',
    ],
  },
  {
    version: '0.1.1',
    date: '2026-03-29',
    changes: [
      'Move Updates to a modal in the header, accessible from anywhere in the app',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-03-29',
    changes: [
      'Add year filter dropdown for year-in-review stats',
      'Add Updates section with app changelog',
      'Re-importable CSV exports with original entry IDs preserved',
    ],
  },
  {
    version: '0.0.9',
    date: '2026-03-29',
    changes: [
      'Streamagator CSV exports can now be re-imported',
      'Export includes original entry IDs so deduplication works on re-import',
    ],
  },
  {
    version: '0.0.8',
    date: '2026-03-29',
    changes: [
      'Move View History button above uploaders',
      'Add confirmation dialog before clearing data',
      'Fix stale Unknown spinner after successful file upload',
    ],
  },
  {
    version: '0.0.7',
    date: '2026-03-29',
    changes: [
      'Watch history is now saved to local browser storage',
      'App reopens directly to history view on return visits',
      'Add Clear Data button to reset all saved history',
    ],
  },
  {
    version: '0.0.6',
    date: '2026-03-29',
    changes: [
      'Add MIT license link to footer',
      'Fix upload description to say CSV/PDF',
    ],
  },
  {
    version: '0.0.5',
    date: '2026-03-29',
    changes: [
      'Add Plex watch history support via CSV export script',
    ],
  },
];
