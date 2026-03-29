import { useRef, useState, useCallback } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface UploadZoneProps {
  onFiles: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export function UploadZone({ onFiles, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv') || f.name.endsWith('.pdf'));
    if (files.length > 0) onFiles(files);
  }, [onFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={twMerge(
        'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors select-none',
        dragging
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
          : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.pdf"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      {dragging ? (
        <FileUp className="w-10 h-10 text-indigo-500" />
      ) : (
        <Upload className="w-10 h-10 text-gray-400" />
      )}
      <div className="text-center">
        <p className="font-medium text-gray-700 dark:text-gray-300">
          {dragging ? 'Drop your files here' : 'Drop files here or click to browse'}
        </p>
        <p className="text-sm text-gray-500 mt-1">Accepts CSV (Netflix, Prime Video, Hulu) or PDF (Hulu data export)</p>
      </div>
    </div>
  );
}
