import Papa from 'papaparse';
import { cleanBOM, parseFlexibleDate, generateId } from '../utils/normalize';
import type { NormalizedEntry, ParseResult } from '../types';

const TITLE_KEYS = ['Title', 'title', 'Content Title', 'content_title', 'ContentTitle'];
const DATE_KEYS = ['WatchDate', 'Playback Date', 'playback_date', 'ViewDate', 'Date Watched', 'date'];
const TYPE_KEYS = ['ContentType', 'Content Type', 'content_type', 'Type'];

function findKey(obj: Record<string, string>, candidates: string[]): string | undefined {
  for (const c of candidates) {
    if (c in obj) return c;
  }
  const lower = candidates.map(c => c.toLowerCase());
  return Object.keys(obj).find(k => lower.includes(k.toLowerCase()));
}

export function parseAmazon(content: string, fileName: string): ParseResult {
  const warnings: string[] = [];
  const entries: NormalizedEntry[] = [];

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => cleanBOM(h).trim(),
  });

  const rows = result.data;
  if (rows.length === 0) {
    return { entries: [], warnings: ['No rows found in file.'], service: 'amazon', fileName };
  }

  const sampleRow = rows[0];
  const titleKey = findKey(sampleRow, TITLE_KEYS);
  const dateKey = findKey(sampleRow, DATE_KEYS);
  const typeKey = findKey(sampleRow, TYPE_KEYS);

  if (!titleKey) {
    warnings.push(`Could not find title column. Found columns: ${Object.keys(sampleRow).join(', ')}`);
    return { entries: [], warnings, service: 'amazon', fileName };
  }
  if (!dateKey) {
    warnings.push(`Could not find date column. Found columns: ${Object.keys(sampleRow).join(', ')}`);
    return { entries: [], warnings, service: 'amazon', fileName };
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

    const rawType = typeKey ? (row[typeKey] || '').toUpperCase() : '';
    const contentType = rawType.includes('MOVIE') ? 'movie' : rawType.includes('EPISODE') ? 'episode' : 'unknown';

    // Attempt episode title parsing for Amazon (format varies)
    let title = rawTitle;
    let episodeTitle: string | undefined;
    const colonIdx = rawTitle.indexOf(' - ');
    if (colonIdx !== -1 && contentType !== 'movie') {
      title = rawTitle.substring(0, colonIdx).trim();
      episodeTitle = rawTitle.substring(colonIdx + 3).trim();
    }

    entries.push({
      id: generateId('amazon', rawTitle, rawDate),
      service: 'amazon',
      title,
      rawTitle,
      episodeTitle,
      contentType: contentType as NormalizedEntry['contentType'],
      watchedAt,
      watchedAtRaw: rawDate,
    });
  }

  return { entries, warnings, service: 'amazon', fileName };
}
