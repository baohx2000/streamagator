import Papa from 'papaparse';
import { cleanBOM, parseFlexibleDate, generateId } from '../utils/normalize';
import type { NormalizedEntry, ParseResult } from '../types';

export function parsePlex(content: string, fileName: string): ParseResult {
  const warnings: string[] = [];
  const entries: NormalizedEntry[] = [];

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => cleanBOM(h).trim(),
  });

  const rows = result.data;
  if (rows.length === 0) {
    return { entries: [], warnings: ['No rows found in file.'], service: 'plex', fileName };
  }

  const sampleRow = rows[0];
  const keys = Object.keys(sampleRow).map(k => k.toLowerCase());

  if (!keys.includes('date') || !keys.includes('title') || !keys.includes('type')) {
    return {
      entries: [],
      warnings: [`Could not detect Plex columns. Found: ${Object.keys(sampleRow).join(', ')}`],
      service: 'plex',
      fileName,
    };
  }

  for (const row of rows) {
    const rawDate = (row['Date'] || '').trim();
    const rawTitle = (row['Title'] || '').trim();
    const mediaType = (row['Type'] || '').trim().toLowerCase();
    const episodeTitle = (row['EpisodeTitle'] || '').trim() || undefined;
    const seasonRaw = (row['Season'] || '').trim();
    const episodeRaw = (row['Episode'] || '').trim();

    if (!rawDate || !rawTitle) continue;

    const watchedAt = parseFlexibleDate(rawDate);
    if (!watchedAt) {
      warnings.push(`Could not parse date: "${rawDate}"`);
      continue;
    }

    const season = seasonRaw ? parseInt(seasonRaw, 10) : undefined;
    const episode = episodeRaw ? parseInt(episodeRaw, 10) : undefined;
    const contentType = mediaType === 'movie' ? 'movie' : mediaType === 'episode' ? 'episode' : 'unknown';

    const idKey = episodeTitle ? `${rawTitle}|${seasonRaw}|${episodeRaw}|${episodeTitle}` : rawTitle;
    const id = generateId('plex', idKey, rawDate);

    entries.push({
      id,
      service: 'plex',
      title: rawTitle,
      rawTitle,
      episodeTitle,
      season,
      episode,
      contentType,
      watchedAt,
      watchedAtRaw: rawDate,
    });
  }

  return { entries, warnings, service: 'plex', fileName };
}
