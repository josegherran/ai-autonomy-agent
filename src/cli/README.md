# AI Autonomy Mapper — CLI Tool

A terminal-based interface for HR professionals and AI leaders to run the full AI Capability Decomposition workflow from the command line.

## Structure

```
cli/
├── src/
│   ├── commands/         # One file per CLI command
│   │   ├── analyze.ts        # autonomy analyze <role>
│   │   ├── heatmap.ts        # autonomy heatmap <session-id>
│   │   └── export.ts         # autonomy export <session-id> [--format md|json|csv]
│   ├── prompts/          # Interactive terminal prompt flows (per phase)
│   │   ├── clarifyingQuestions.ts
│   │   └── capabilityReview.ts
│   ├── services/         # Core framework logic (shared with api/)
│   │   └── autonomyEngine.ts
│   ├── utils/
│   │   ├── display.ts        # Table/heatmap rendering in terminal
│   │   └── fileExport.ts     # Write markdown/CSV/JSON to disk
│   └── index.ts          # CLI entry point (commander setup)
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js ≥ 18
- `npm` or `pnpm`

## Getting Started

```bash
npm install
npm run build
npm link          # makes `autonomy` available globally
```

Or run directly:

```bash
npx tsx src/index.ts analyze "Data Scientist"
```

## Commands

```
autonomy analyze <role> [--context <text>]    Run full analysis interactively
autonomy heatmap <session-id>                 Render heatmap for a saved session
autonomy export  <session-id> [--format md]   Export artifacts to ./output/
autonomy list                                 List all saved sessions
```

## Example

```bash
$ autonomy analyze "Marketing Manager"

AI Autonomy Mapper v1.0.0
─────────────────────────
Role: Marketing Manager

Phase 1 — Clarifying Questions
? What are the non-negotiable, day-to-day tasks for this role? ...
```
