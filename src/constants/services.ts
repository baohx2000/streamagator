import type { StreamingService } from '../types';

export const SERVICE_COLORS: Record<StreamingService, string> = {
  netflix: '#E50914',
  amazon: '#00A8E1',
  hulu: '#3DBB3D',
  plex: '#E5A00D',
  unknown: '#6B7280',
};

export const SERVICE_LABELS: Record<StreamingService, string> = {
  netflix: 'Netflix',
  amazon: 'Prime Video',
  hulu: 'Hulu',
  plex: 'Plex',
  unknown: 'Unknown',
};

export const SERVICE_BG_CLASSES: Record<StreamingService, string> = {
  netflix: 'bg-red-600',
  amazon: 'bg-sky-500',
  hulu: 'bg-green-500',
  plex: 'bg-yellow-500',
  unknown: 'bg-gray-500',
};

export const SERVICE_TEXT_CLASSES: Record<StreamingService, string> = {
  netflix: 'text-red-600',
  amazon: 'text-sky-500',
  hulu: 'text-green-500',
  plex: 'text-yellow-500',
  unknown: 'text-gray-500',
};

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
