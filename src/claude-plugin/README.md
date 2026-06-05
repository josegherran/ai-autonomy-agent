# AI Autonomy Mapper — Claude Code Plugin (MCP)

An MCP (Model Context Protocol) server that gives any MCP-capable AI host — Claude.ai, Claude Desktop, Cursor, VS Code Copilot — the full **AI Capability Decomposition Framework** as callable tools.

## Project Structure

```
claude-plugin/
├── src/
│   ├── index.ts                    # MCP server entry point (tools + prompts)
│   ├── types.ts                    # Shared types (Capability, AutonomyMapping, …)
│   ├── data/
│   │   └── clarifying-questions.ts # 10 structured clarifying questions (4 groups)
│   ├── engine/
│   │   └── autonomy-engine.ts      # Scoring heuristics: zone × modifiers → L1-L5
│   ├── store/
│   │   └── session-store.ts        # In-memory session state (keyed by UUID)
│   ├── tools/
│   │   ├── analyze-role.ts         # Tool: analyze_role
│   │   ├── decompose-capabilities.ts # Tool: decompose_capabilities
│   │   ├── map-autonomy-levels.ts  # Tool: map_autonomy_levels
│   │   ├── generate-heatmap.ts     # Tool: generate_heatmap
│   │   └── export-artifacts.ts     # Tool: export_artifacts
│   ├── prompts/
│   │   └── agent-instructions.ts   # MCP prompt: ai_autonomy_mapper_instructions
│   └── tests/
│       └── smoke.test.ts           # 24 smoke tests (engine + tools + data)
├── dist/                           # Compiled output (git-ignored)
├── .mcp.json                       # MCP server descriptor
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js ≥ 18
- `npm` or `pnpm`
- Any MCP-capable host (Claude Desktop, VS Code with Copilot agent mode, Cursor)

## Getting Started

```bash
npm install
npm run build       # compile TypeScript → dist/
npm test            # run 24 smoke tests via tsx
```

## Register with your MCP host

### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "ai-autonomy-mapper": {
      "command": "node",
      "args": ["/absolute/path/to/src/claude-plugin/dist/index.js"]
    }
  }
}
```

### VS Code (`.vscode/mcp.json` in your workspace)

```json
{
  "servers": {
    "ai-autonomy-mapper": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/src/claude-plugin/dist/index.js"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "ai-autonomy-mapper": {
      "command": "node",
      "args": ["/absolute/path/to/src/claude-plugin/dist/index.js"]
    }
  }
}
```

## Tool Surface

| Tool | Phase | Description |
|------|-------|-------------|
| `analyze_role` | 1 | Create session + return 10 clarifying questions in 4 groups |
| `decompose_capabilities` | 2–3 | Parse answers → Core / Contextual / Shared capability map |
| `map_autonomy_levels` | 4 | Score each capability at L1–L5 with 🟦🟩🟨🟧🟥 |
| `generate_heatmap` | 5 | Produce AI Exposure Heatmap table + top-3 insights |
| `export_artifacts` | 6 | Bundle decomposition table, heatmap, executive summary, workshop guide |

## MCP Prompt

`ai_autonomy_mapper_instructions` — Load this prompt at the start of a session to give the AI host the full workflow guide, autonomy level definitions, and operating rules.

## Scoring Engine

Capabilities are scored by zone × modifier flags:

| Zone | Base L1–L5 |
|------|-----------|
| Core | 🟩 🟨 🟧 🟥 🟥 |
| Contextual | 🟦 🟩 🟨 🟧 🟧 |
| Shared | 🟦 🟦 🟩 🟩 🟨 |

Modifiers applied per capability:
- `repetitive: true` → +1 step (automates earlier)
- `dataRich: true` → +0.5 step
- `highJudgment: true` → −1 step (stays human longer)
- `highRisk: true` → capped at 🟨 / SHARED (never fully automated)

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run dev` | Watch mode (`tsc --watch`) |
| `npm run lint` | Type-check without emitting (`tsc --noEmit`) |
| `npm test` | Run 24 smoke tests via `tsx` |
