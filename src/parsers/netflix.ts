import Papa from 'papaparse';
import { cleanBOM, parseDate, generateId, parseNetflixTitle } from '../utils/normalize';
import type { NormalizedEntry, ParseResult } from '../types';

export function parseNetflix(content: string, fileName: string): ParseResult {
  const warnings: string[] = [];
  const entries: NormalizedEntry[] = [];

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => cleanBOM(h).trim(),
  });

  const rows = result.data;
  if (rows.length === 0) {
    return { entries: [], warnings: ['No rows found in file.'], service: 'netflix', fileName };
  }

  const sampleRow = rows[0];
  const titleKey = Object.keys(sampleRow).find(k => k.toLowerCase() === 'title');
  const dateKey = Object.keys(sampleRow).find(k => k.toLowerCase() === 'date');

  if (!titleKey || !dateKey) {
    return {
      entries: [],
      warnings: [`Could not detect Netflix columns. Found: ${Object.keys(sampleRow).join(', ')}`],
      service: 'netflix',
      fileName,
    };
  }

  for (const row of rows) {
    const rawTitle = (row[titleKey] || '').trim();
    const rawDate = (row[dateKey] || '').trim();
    if (!rawTitle || !rawDate) continue;

    // Netflix exports use 2-digit years (MM/DD/YY), but some older exports use 4-digit (MM/DD/YYYY)
    let watchedAt = parseDate(rawDate, 'MM/dd/yy') ?? parseDate(rawDate, 'MM/dd/yyyy');
    if (!watchedAt) {
      // Try DD/MM/YY locale variant if month > 12
      watchedAt = parseDate(rawDate, 'dd/MM/yy') ?? parseDate(rawDate, 'dd/MM/yyyy');
      if (watchedAt) warnings.push(`Date ambiguity: interpreted "${rawDate}" as DD/MM/YY.`);
    }
    if (!watchedAt) {
      warnings.push(`Could not parse date: "${rawDate}"`);
      continue;
    }

    const parsed = parseNetflixTitle(rawTitle);
    const id = generateId('netflix', rawTitle, rawDate);

    entries.push({
      id,
      service: 'netflix',
      title: parsed.seriesTitle,
      rawTitle,
      episodeTitle: parsed.episodeTitle,
      season: parsed.season,
      contentType: parsed.isEpisode ? 'episode' : 'movie',
      watchedAt,
      watchedAtRaw: rawDate,
    });
  }

  return { entries, warnings, service: 'netflix', fileName };
}
