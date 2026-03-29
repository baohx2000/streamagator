import type { NormalizedEntry } from '../types';

const STORAGE_KEY = 'streamagator_entries';

type SerializedEntry = Omit<NormalizedEntry, 'watchedAt'> & { watchedAt: string };

export function saveEntries(entries: NormalizedEntry[]): void {
  try {
    const serialized: SerializedEntry[] = entries.map(e => ({
      ...e,
      watchedAt: e.watchedAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

export function loadEntries(): NormalizedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: SerializedEntry[] = JSON.parse(raw);
    return parsed.map(e => ({ ...e, watchedAt: new Date(e.watchedAt) }));
  } catch {
    return [];
  }
}

export function clearEntries(): void {
  localStorage.removeItem(STORAGE_KEY);
}
