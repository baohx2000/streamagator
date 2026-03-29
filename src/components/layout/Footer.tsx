export function Footer() {
  return (
    <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400">
      All processing happens in your browser. No data is ever uploaded or shared.
      {' · '}
      <a
        href="https://github.com/baohx2000/streamagator/blob/main/LICENSE"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        MIT License
      </a>
    </footer>
  );
}
