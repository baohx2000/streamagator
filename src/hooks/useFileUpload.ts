import { useState } from 'react';
import type { ServiceUploadState, StreamingService } from '../types';
import { parseFile } from '../parsers';

type UploadStates = Record<StreamingService, ServiceUploadState>;

const DEFAULT_STATE: ServiceUploadState = { status: 'idle', count: 0, warnings: [] };

export function useFileUpload(onParsed: (entries: import('../types').NormalizedEntry[]) => void) {
  const [uploadStates, setUploadStates] = useState<UploadStates>({
    netflix: { ...DEFAULT_STATE },
    amazon: { ...DEFAULT_STATE },
    hulu: { ...DEFAULT_STATE },
    plex: { ...DEFAULT_STATE },
    unknown: { ...DEFAULT_STATE },
  });

  function setServiceState(service: StreamingService, state: Partial<ServiceUploadState>) {
    setUploadStates(prev => ({
      ...prev,
      [service]: { ...prev[service], ...state },
    }));
  }

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const lower = file.name.toLowerCase();
      if (!lower.endsWith('.csv') && !lower.endsWith('.pdf')) {
        setServiceState('unknown', {
          status: 'error',
          error: `"${file.name}" is not a supported file type (CSV or PDF).`,
          warnings: [],
        });
        continue;
      }

      // Temporarily set parsing state — use 'unknown' until detected
      setServiceState('unknown', { status: 'parsing', warnings: [] });

      try {
        const result = await parseFile(file);
        const svc = result.service === 'unknown' ? 'unknown' : result.service;

        setServiceState(svc, {
          status: result.entries.length > 0 ? 'done' : 'error',
          count: result.entries.length,
          fileName: file.name,
          warnings: result.warnings,
          error: result.entries.length === 0 ? 'No entries could be parsed from this file.' : undefined,
        });

        if (result.entries.length > 0) {
          onParsed(result.entries);
        }
      } catch (err) {
        setServiceState('unknown', {
          status: 'error',
          error: String(err),
          warnings: [],
        });
      }
    }
  }

  return { uploadStates, handleFiles };
}
