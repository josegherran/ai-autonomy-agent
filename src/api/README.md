# AI Autonomy Mapper — API Service

A RESTful API service that exposes the AI Capability Decomposition Framework programmatically, enabling integration with HR and workforce management systems.

## Structure

```
api/
├── src/
│   ├── routes/           # Express route handlers per phase
│   │   ├── sessions.ts       # POST /sessions — create analysis session
│   │   ├── capabilities.ts   # POST /sessions/:id/capabilities
│   │   ├── autonomy.ts       # POST /sessions/:id/autonomy
│   │   └── heatmap.ts        # GET  /sessions/:id/heatmap
│   ├── services/         # Core business logic (framework engine)
│   │   ├── decompositionService.ts
│   │   ├── autonomyService.ts
│   │   └── heatmapService.ts
│   ├── middleware/        # Auth, validation, error handling
│   │   ├── auth.ts
│   │   ├── validate.ts
│   │   └── errorHandler.ts
│   ├── types/            # Shared TypeScript types
│   │   └── autonomy.ts
│   └── app.ts            # Express app factory
├── package.json
├── tsconfig.json
└── openapi.yaml          # OpenAPI 3.1 spec
```

## Prerequisites

- Node.js ≥ 18
- `npm` or `pnpm`

## Getting Started

```bash
npm install
npm run dev        # ts-node-dev hot-reload server on :3000
npm run build      # compile to dist/
npm start          # run compiled server
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/sessions` | Create a new analysis session |
| `GET` | `/sessions/:id` | Retrieve session state |
| `POST` | `/sessions/:id/capabilities` | Submit clarifying answers → capability map |
| `POST` | `/sessions/:id/autonomy` | Generate autonomy level mapping |
| `GET` | `/sessions/:id/heatmap` | Retrieve heatmap artifact (markdown or JSON) |
| `GET` | `/sessions/:id/export` | Export all artifacts |
