import Papa from 'papaparse';
import { cleanBOM, parseFlexibleDate, generateId } from '../utils/normalize';
import type { NormalizedEntry, ParseResult } from '../types';

const TITLE_KEYS = ['Title', 'title', 'Content Title', 'content_title', 'ContentTitle'];
const DATE_KEYS = ['WatchDate', 'Playback Date', 'playback_date', 'ViewDate', 'Date Watched', 'date', 'Playback Start Datetime (UTC)'];
const TYPE_KEYS = ['ContentType', 'Content Type', 'content_type', 'Type'];

// Amazon's detailed CSV wraps string values in extra quotes: """value""" → "value"
function stripQuotes(s: string): string {
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1);
  }
  return s;
}

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
    const rawTitle = stripQuotes((row[titleKey] || '').trim());
    const rawDate = stripQuotes((row[dateKey] || '').trim());
    if (!rawTitle || !rawDate || rawTitle === 'Not available') continue;

    // Skip promo clips and autoplay previews
    const materialType = stripQuotes((row['Material Type Description'] || '').trim());
    const isAutoplay = stripQuotes((row['Is Autoplay'] || '').trim());
    if (materialType === 'Promo' || isAutoplay === 'Yes') continue;

    const watchedAt = parseFlexibleDate(rawDate);
    if (!watchedAt) {
      warnings.push(`Could not parse date: "${rawDate}"`);
      continue;
    }

    const rawType = typeKey ? stripQuotes((row[typeKey] || '').toUpperCase()) : '';
    let contentType: NormalizedEntry['contentType'] = rawType.includes('MOVIE') ? 'movie' : rawType.includes('EPISODE') ? 'episode' : 'unknown';

    // Amazon title format: "EpisodeTitle-ShowTitle - Season N" (plain hyphen, no spaces before dash)
    let title: string;
    let episodeTitle: string | undefined;
    const dashIdx = contentType !== 'movie' ? rawTitle.indexOf('-') : -1;
    if (dashIdx !== -1) {
      episodeTitle = rawTitle.substring(0, dashIdx).trim();
      title = rawTitle.substring(dashIdx + 1).trim();
      // If content type is still unknown but we split on a dash, it's an episode
      if (contentType === 'unknown') contentType = 'episode';
    } else {
      title = rawTitle;
    }
    // Strip trailing " - Season N" from series title
    title = title.replace(/ - Season \d+$/i, '');

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
