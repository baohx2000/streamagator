# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript type check (tsc -b) then Vite production build
npm run lint     # ESLint across the entire codebase
npm run preview  # Serve the production build locally
```

There are no tests in this project.

## Architecture

**Streamagator** is a privacy-first, fully client-side React+Vite app. All data stays in the browser — there is no backend, no API calls, and no data transmission.

### Data Flow

1. User uploads CSV/PDF files from Netflix, Amazon, or Hulu
2. `src/parsers/index.ts` detects the service from filename and CSV headers, then routes to the appropriate parser
3. Each parser (`netflix.ts`, `amazon.ts`, `hulu.ts`, `hulu-pdf.ts`) normalizes records into `NormalizedEntry` (defined in `src/types/index.ts`)
4. `src/utils/normalize.ts` handles shared utilities: BOM stripping, multi-format date parsing, deterministic ID generation (hash of service+title+date for deduplication)
5. `useWatchHistory` hook (`src/hooks/useWatchHistory.ts`) holds all entries in state, deduplicates by ID, and memoizes filtered results and stats
6. `src/utils/stats.ts` computes aggregated stats (streaks, top titles, breakdowns by month/day/service)

### Key Architectural Decisions

- **Deduplication**: IDs are deterministic hashes — re-uploading the same file won't add duplicates
- **Vite base path**: Set to `./` (relative) in `vite.config.ts` for static hosting compatibility
- **TypeScript strictness**: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` are all enabled — the build will fail if these are violated
- **Tailwind v4**: Uses the Vite plugin integration, not PostCSS

### Component Organization

- `src/components/upload/` — File upload UI and per-service export instructions
- `src/components/stats/` — Dashboard, charts (Recharts), and stat cards
- `src/components/history/` — Paginated/filterable watch history table
- `src/components/layout/` — Header and footer
- `src/components/ui/` — Shared primitives (Button, Badge, Spinner, EmptyState)

### Service Constants

Colors, labels, and Tailwind classes for each streaming service live in `src/constants/services.ts`. Add new services here first.

## Releases

Before every release, update `src/data/changelog.ts` with the new version, date, and a bullet list of changes. Then create the release with `gh release create`.
