import Papa from 'papaparse';
import { cleanBOM, parseFlexibleDate, generateId } from '../utils/normalize';
import type { NormalizedEntry, ParseResult } from '../types';

const TITLE_KEYS = ['Title', 'title', 'Show Title', 'show_title', 'Name', 'Video Title'];
const DATE_KEYS = ['Date Watched', 'date_watched', 'WatchedDate', 'Watched At', 'Playback Date', 'Date'];
const TYPE_KEYS = ['Content Type', 'content_type', 'Type', 'type'];

function findKey(obj: Record<string, string>, candidates: string[]): string | undefined {
  for (const c of candidates) {
    if (c in obj) return c;
  }
  const lower = candidates.map(c => c.toLowerCase());
  return Object.keys(obj).find(k => lower.includes(k.toLowerCase()));
}

export function parseHulu(content: string, fileName: string): ParseResult {
  const warnings: string[] = [];
  const entries: NormalizedEntry[] = [];

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => cleanBOM(h).trim(),
  });

  const rows = result.data;
  if (rows.length === 0) {
    return { entries: [], warnings: ['No rows found in file.'], service: 'hulu', fileName };
  }

  const sampleRow = rows[0];
  const titleKey = findKey(sampleRow, TITLE_KEYS);
  const dateKey = findKey(sampleRow, DATE_KEYS);
  const typeKey = findKey(sampleRow, TYPE_KEYS);

  if (!titleKey || !dateKey) {
    return {
      entries: [],
      warnings: [
        `Could not detect Hulu columns. Found: ${Object.keys(sampleRow).join(', ')}. ` +
          'Please follow the export instructions to get the correct file format.',
      ],
      service: 'hulu',
      fileName,
    };
  }

  for (const row of rows) {
    const rawTitle = (row[titleKey] || '').trim();
    const rawDate = (row[dateKey] || '').trim();
    if (!rawTitle || !rawDate) continue;

    const watchedAt = parseFlexibleDate(rawDate);
    if (!watchedAt) {
      warnings.push(`Could not parse date: "${rawDate}"`);
      continue;
    }

    const rawType = typeKey ? (row[typeKey] || '').toLowerCase() : '';
    const contentType = rawType.includes('movie') ? 'movie' : rawType.includes('episode') || rawType.includes('series') ? 'episode' : 'unknown';

    entries.push({
      id: generateId('hulu', rawTitle, rawDate),
      service: 'hulu',
      title: rawTitle,
      rawTitle,
      contentType: contentType as NormalizedEntry['contentType'],
      watchedAt,
      watchedAtRaw: rawDate,
    });
  }

  return { entries, warnings, service: 'hulu', fileName };
}
