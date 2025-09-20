# IListaMo

IListaMo is a fully client-side estimating and quoting app. Build estimates, turn them into quotes, analyze profit, export PDFs, and track pipeline — all stored locally in your browser using localForage.

## Tech
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Zustand for state management (with localForage persistence)
- jsPDF (+ jspdf-autotable) for PDF export


## Scripts
- dev: start the dev server
- build: build for production
- start: run production server

## Run locally (Windows PowerShell)
```powershell
npm install
npm run dev
```

Open http://localhost:3000

## Project structure
See `src/` for app routes, components, store, lib, and types. Pages are currently placeholders and will be implemented iteratively.

## Data backup
- Export: generate a `.ilistamo` JSON from store
- Import: load a previously exported file (overwrites current data)

## License
MIT