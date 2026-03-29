import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { parse, isValid } from 'date-fns';
import { generateId } from '../utils/normalize';
import type { NormalizedEntry, ParseResult } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
  }
  return pages.join('\n');
}

function parseHuluDate(raw: string): Date | null {
  // Format: "20 Mar 2026 04:00:13"
  const d = parse(raw.trim(), 'dd MMM yyyy HH:mm:ss', new Date());
  return isValid(d) ? d : null;
}

export async function parseHuluPDF(file: File): Promise<ParseResult> {
  const warnings: string[] = [];
  const entries: NormalizedEntry[] = [];

  let fullText: string;
  try {
    const buffer = await file.arrayBuffer();
    fullText = await extractPDFText(buffer);
  } catch (err) {
    return {
      entries: [],
      warnings: [`Failed to read PDF: ${String(err)}`],
      service: 'hulu',
      fileName: file.name,
    };
  }

  // Find the Watch History section
  const watchHistoryMarker = 'Watch History';
  const headerMarker = 'Episode Name';
  const sectionStart = fullText.indexOf(watchHistoryMarker);
  if (sectionStart === -1) {
    return {
      entries: [],
      warnings: ['Could not find "Watch History" section in this PDF. Is this a Hulu data export?'],
      service: 'hulu',
      fileName: file.name,
    };
  }

  // Advance past the column headers
  let dataStart = fullText.indexOf(headerMarker, sectionStart);
  if (dataStart === -1) {
    return {
      entries: [],
      warnings: ['Found "Watch History" section but could not locate column headers.'],
      service: 'hulu',
      fileName: file.name,
    };
  }
  // Skip past "Episode Name   Series Name   Season   Last Played At"
  const headerEnd = fullText.indexOf('Last Played At', dataStart);
  if (headerEnd === -1) {
    return {
      entries: [],
      warnings: ['Could not find "Last Played At" column header.'],
      service: 'hulu',
      fileName: file.name,
    };
  }

  // Find the end of the watch history section (next major section or end of text)
  const sectionEnd = (() => {
    const nextSectionMarkers = ['Devices And Logins', 'Advertising', 'Pay-Per-View History', 'Cloud DVR'];
    let end = fullText.length;
    for (const marker of nextSectionMarkers) {
      const idx = fullText.indexOf(marker, headerEnd);
      if (idx !== -1 && idx < end) end = idx;
    }
    return end;
  })();

  const historyText = fullText.slice(headerEnd + 'Last Played At'.length, sectionEnd).trim();

  // Each entry ends with a date pattern: "DD MMM YYYY HH:MM:SS"
  // Split on date boundaries, parsing each chunk as one record
  const datePattern = /(\d{2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2})/g;
  const dateMatches = [...historyText.matchAll(datePattern)];

  if (dateMatches.length === 0) {
    return {
      entries: [],
      warnings: ['No watch history entries found in the Watch History section.'],
      service: 'hulu',
      fileName: file.name,
    };
  }

  for (let i = 0; i < dateMatches.length; i++) {
    const dateMatch = dateMatches[i];
    const dateStr = dateMatch[1];
    const dateIdx = dateMatch.index!;

    // The text before this date (and after the previous date) is the fields
    const prevEnd = i === 0 ? 0 : dateMatches[i - 1].index! + dateMatches[i - 1][1].length;
    const chunk = historyText.slice(prevEnd, dateIdx).trim();

    // Chunk format: "Episode Name   Series Name   Season"
    // Fields are separated by 2+ spaces
    const parts = chunk.split(/\s{2,}/).map(s => s.trim()).filter(Boolean);

    if (parts.length < 3) {
      warnings.push(`Skipping malformed row: "${chunk}"`);
      continue;
    }

    // Last field is season, second-to-last is series name, everything before is episode name
    const seasonRaw = parts[parts.length - 1];
    const seriesName = parts[parts.length - 2];
    const episodeName = parts.slice(0, parts.length - 2).join(' ');

    const watchedAt = parseHuluDate(dateStr);
    if (!watchedAt) {
      warnings.push(`Could not parse date: "${dateStr}"`);
      continue;
    }

    const isNA = (s: string) => s === 'N/A' || s === 'NA' || s === '';
    const isMovie = isNA(seriesName) || isNA(seasonRaw);
    const season = isNA(seasonRaw) ? undefined : parseInt(seasonRaw, 10) || undefined;

    // Skip trailers/ads (very short titles or known trailer patterns)
    const isTrailer = episodeName.toLowerCase().includes('trailer') ||
      episodeName.toLowerCase().includes('official') ||
      episodeName.toLowerCase().includes('teaser');

    if (isTrailer) {
      warnings.push(`Skipping trailer/promo: "${episodeName}"`);
      continue;
    }

    const title = isMovie ? episodeName : seriesName;
    const rawTitle = `${episodeName}|${seriesName}|${seasonRaw}`;

    entries.push({
      id: generateId('hulu', rawTitle, dateStr),
      service: 'hulu',
      title,
      rawTitle: isMovie ? episodeName : `${seriesName}: ${episodeName}`,
      episodeTitle: isMovie ? undefined : episodeName,
      season,
      contentType: isMovie ? 'movie' : 'episode',
      watchedAt,
      watchedAtRaw: dateStr,
    });
  }

  return { entries, warnings, service: 'hulu', fileName: file.name };
}
