import Papa from 'papaparse';
import { cleanBOM, parseFlexibleDate } from '../utils/normalize';
import type { NormalizedEntry, ParseResult, StreamingService } from '../types';
import { SERVICE_LABELS } from '../constants/services';

// Reverse map from label → service key
const LABEL_TO_SERVICE: Record<string, StreamingService> = Object.fromEntries(
  (Object.entries(SERVICE_LABELS) as [StreamingService, string][]).map(([k, v]) => [v, k])
);

export function parseStreamagator(content: string, fileName: string): ParseResult {
  const warnings: string[] = [];
  const entries: NormalizedEntry[] = [];

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => cleanBOM(h).trim(),
  });

  const rows = result.data;
  if (rows.length === 0) {
    return { entries: [], warnings: ['No rows found in file.'], service: 'unknown', fileName };
  }

  for (const row of rows) {
    const id = (row['id'] || '').trim();
    const serviceLabel = (row['Service'] || '').trim();
    const rawTitle = (row['Title'] || '').trim();
    const rawDate = (row['Date'] || '').trim();
    const episodeTitle = (row['EpisodeTitle'] || '').trim() || undefined;
    const seasonRaw = (row['Season'] || '').trim();
    const episodeRaw = (row['Episode'] || '').trim();
    const contentTypeRaw = (row['ContentType'] || '').trim().toLowerCase();

    if (!id || !rawTitle || !rawDate) continue;

    const watchedAt = parseFlexibleDate(rawDate);
    if (!watchedAt) {
      warnings.push(`Could not parse date: "${rawDate}"`);
      continue;
    }

    const service: StreamingService = LABEL_TO_SERVICE[serviceLabel] ?? 'unknown';
    const contentType = contentTypeRaw === 'movie' ? 'movie' : contentTypeRaw === 'episode' ? 'episode' : 'unknown';
    const season = seasonRaw ? parseInt(seasonRaw, 10) : undefined;
    const episode = episodeRaw ? parseInt(episodeRaw, 10) : undefined;

    entries.push({
      id,
      service,
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

  return { entries, warnings, service: 'unknown', fileName };
}
