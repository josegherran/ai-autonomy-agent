# AI Autonomy Mapper — Claude Code Plugin

A Claude code plugin (MCP-compatible) for integration into Claude.ai, Cursor, VS Code Copilot, and any MCP-capable host.

## Structure

```
claude-plugin/
├── src/
│   ├── index.ts          # Plugin entry point / MCP server
│   ├── tools/            # MCP tool definitions (one per agent phase)
│   │   ├── analyze-role.ts
│   │   ├── decompose-capabilities.ts
│   │   ├── map-autonomy.ts
│   │   └── generate-heatmap.ts
│   └── prompts/          # Shared system prompt and phase logic
│       └── agent-instructions.md
├── package.json
├── tsconfig.json
└── .mcp.json             # MCP server descriptor (name, version, entry)
```

## Prerequisites

- Node.js ≥ 18
- `npm` or `pnpm`
- MCP-compatible host (Claude Desktop, VS Code with Copilot, Cursor)

## Getting Started

```bash
npm install
npm run build
```

Then register the server in your MCP host configuration:

```json
{
  "mcpServers": {
    "ai-autonomy-mapper": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

## Tool Surface

| Tool | Description |
|------|-------------|
| `analyze_role` | Start a session for a given job role |
| `decompose_capabilities` | Build structured capability map from answers |
| `map_autonomy_levels` | Assign AI exposure scores per capability × level |
| `generate_heatmap` | Produce the AI Exposure Heatmap artifact |
| `export_artifacts` | Export decomposition table, heatmap, and workshop guide |
