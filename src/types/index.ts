export type StreamingService = 'netflix' | 'amazon' | 'hulu' | 'unknown';

export type ContentType = 'movie' | 'episode' | 'unknown';

export interface NormalizedEntry {
  id: string;
  service: StreamingService;
  title: string;
  rawTitle: string;
  episodeTitle?: string;
  season?: number;
  episode?: number;
  contentType: ContentType;
  watchedAt: Date;
  watchedAtRaw: string;
}

export interface FilterState {
  services: StreamingService[];
  contentType: ContentType | 'all';
  dateFrom: string;
  dateTo: string;
  search: string;
}

export interface AggregatedStats {
  total: number;
  uniqueTitles: number;
  byService: Record<StreamingService, number>;
  byMonth: Array<{ month: string; netflix: number; amazon: number; hulu: number; unknown: number }>;
  byDayOfWeek: Array<{ day: string; count: number }>;
  topTitles: Array<{ title: string; count: number; service: StreamingService }>;
  longestStreak: number;
  currentStreak: number;
  mostActiveMonth: string;
}

export interface ParseResult {
  entries: NormalizedEntry[];
  warnings: string[];
  service: StreamingService;
  fileName: string;
}

export interface ServiceUploadState {
  status: 'idle' | 'parsing' | 'done' | 'error';
  count: number;
  fileName?: string;
  warnings: string[];
  error?: string;
}
