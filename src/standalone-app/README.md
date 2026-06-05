# AI Autonomy Mapper — Standalone Application

A web-based single-page application providing a step-by-step guided UI for the full AI Capability Decomposition workflow.

## Structure

```
standalone-app/
├── public/               # Static assets
├── src/
│   ├── components/       # UI components (phase wizards, heatmap renderer)
│   │   ├── PhaseWizard/
│   │   ├── CapabilityTable/
│   │   ├── HeatmapGrid/
│   │   └── ExportPanel/
│   ├── pages/            # Route-level pages
│   │   ├── Home.tsx
│   │   ├── Analysis.tsx
│   │   └── Results.tsx
│   ├── services/         # API client / local inference calls
│   │   └── autonomyService.ts
│   ├── store/            # State management (Zustand / Redux)
│   │   └── analysisStore.ts
│   ├── types/            # Shared TypeScript types
│   │   └── autonomy.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Prerequisites

- Node.js ≥ 18
- `npm` or `pnpm`

## Getting Started

```bash
npm install
npm run dev        # development server
npm run build      # production build → dist/
npm run preview    # preview production build
```

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| State | Zustand |
| Styling | Tailwind CSS |
| Export | `html2canvas` + `jsPDF` for PDF/PNG heatmaps |
