import { parse, isValid } from 'date-fns';

export function cleanBOM(str: string): string {
  return str.replace(/^\uFEFF/, '');
}

export function parseDate(raw: string, formatStr: string): Date | null {
  const d = parse(raw.trim(), formatStr, new Date());
  return isValid(d) ? d : null;
}

export function parseFlexibleDate(raw: string): Date | null {
  const formats = [
    'MM/dd/yyyy',
    'yyyy-MM-dd',
    "yyyy-MM-dd'T'HH:mm:ssXXX",
    "yyyy-MM-dd'T'HH:mm:ss",
    'dd/MM/yyyy',
    'M/d/yyyy',
    'yyyy-MM-dd HH:mm:ss',
  ];
  for (const fmt of formats) {
    const d = parseDate(raw, fmt);
    if (d) return d;
  }
  const fallback = new Date(raw);
  return isValid(fallback) ? fallback : null;
}

export function generateId(service: string, rawTitle: string, watchedAtRaw: string): string {
  const str = `${service}|${rawTitle}|${watchedAtRaw}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `${service}_${Math.abs(hash).toString(36)}`;
}

interface ParsedNetflixTitle {
  seriesTitle: string;
  episodeTitle?: string;
  season?: number;
  episode?: number;
  isEpisode: boolean;
}

export function parseNetflixTitle(raw: string): ParsedNetflixTitle {
  // Pattern: "Series Name: Season X: Episode Title" or "Series Name: Episode Title"
  // Also handles "Series Name: Limited Series: Episode Title"
  const parts = raw.split(': ');
  if (parts.length >= 2) {
    const seasonMatch = parts[1].match(/^Season (\d+)$/i);
    if (seasonMatch && parts.length >= 3) {
      return {
        seriesTitle: parts[0],
        episodeTitle: parts.slice(2).join(': '),
        season: parseInt(seasonMatch[1], 10),
        isEpisode: true,
      };
    }
    if (parts[1].toLowerCase().includes('limited series') || parts[1].toLowerCase().includes('miniseries')) {
      return {
        seriesTitle: parts[0],
        episodeTitle: parts.slice(2).join(': '),
        isEpisode: true,
      };
    }
    return {
      seriesTitle: parts[0],
      episodeTitle: parts.slice(1).join(': '),
      isEpisode: true,
    };
  }
  return { seriesTitle: raw, isEpisode: false };
}
