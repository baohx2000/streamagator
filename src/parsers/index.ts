import Papa from 'papaparse';
import { cleanBOM } from '../utils/normalize';
import { parseNetflix } from './netflix';
import { parseAmazon } from './amazon';
import { parseHulu } from './hulu';
import { parseHuluPDF } from './hulu-pdf';
import { parsePlex } from './plex';
import { parseStreamagator } from './streamagator';
import type { ParseResult, StreamingService } from '../types';

export function detectService(fileName: string, headers: string[]): StreamingService {
  const lower = fileName.toLowerCase();
  if (lower.includes('netflix')) return 'netflix';
  if (lower.includes('amazon') || lower.includes('prime')) return 'amazon';
  if (lower.includes('hulu')) return 'hulu';
  if (lower.includes('plex')) return 'plex';

  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  // Streamagator export: has 'id' and 'contentype' columns
  if (normalizedHeaders.includes('id') && normalizedHeaders.includes('contenttype')) {
    return 'streamagator' as StreamingService;
  }
  // Plex: Date + Title + Type + Season + Episode + EpisodeTitle
  if (normalizedHeaders.includes('type') && normalizedHeaders.includes('episodetitle')) {
    return 'plex';
  }
  // Netflix: exactly Title + Date
  if (normalizedHeaders.includes('title') && normalizedHeaders.includes('date') && headers.length === 2) {
    return 'netflix';
  }
  if (normalizedHeaders.some(h => h.includes('watchdate') || h.includes('playback date') || h.includes('asin'))) {
    return 'amazon';
  }
  if (normalizedHeaders.some(h => h.includes('profile') || h.includes('hulu'))) {
    return 'hulu';
  }
  if (normalizedHeaders.includes('title') && normalizedHeaders.includes('date')) {
    return 'netflix'; // best guess
  }
  return 'unknown';
}

export async function parseFile(file: File): Promise<ParseResult> {
  // Handle Hulu PDF export
  if (file.name.toLowerCase().endsWith('.pdf')) {
    return parseHuluPDF(file);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      const firstLine = content.split('\n')[0];
      const headers = Papa.parse<string[]>(cleanBOM(firstLine), { header: false }).data[0] || [];

      const service = detectService(file.name, headers);

      let result: ParseResult;
      if (service === 'netflix') {
        result = parseNetflix(content, file.name);
      } else if (service === 'amazon') {
        result = parseAmazon(content, file.name);
      } else if (service === 'hulu') {
        result = parseHulu(content, file.name);
      } else if (service === 'plex') {
        result = parsePlex(content, file.name);
      } else if (service === ('streamagator' as StreamingService)) {
        result = parseStreamagator(content, file.name);
      } else {
        // Try netflix as fallback
        result = parseNetflix(content, file.name);
        if (result.entries.length === 0) {
          result = parseAmazon(content, file.name);
        }
        result.service = 'unknown';
      }

      resolve(result);
    };
    reader.readAsText(file, 'UTF-8');
  });
}
