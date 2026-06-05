import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { handleAnalyzeRole } from "./tools/analyze-role.js";
import { handleDecomposeCapabilities } from "./tools/decompose-capabilities.js";
import { handleMapAutonomyLevels } from "./tools/map-autonomy-levels.js";
import { handleGenerateHeatmap } from "./tools/generate-heatmap.js";
import { handleExportArtifacts } from "./tools/export-artifacts.js";
import { AGENT_INSTRUCTIONS } from "./prompts/agent-instructions.js";

// ─── Server ───────────────────────────────────────────────────────────────────
const server = new Server(
  { name: "ai-autonomy-mapper", version: "1.0.0" },
  { capabilities: { tools: {}, prompts: {} } },
);

// ─── Tool definitions ─────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "analyze_role",
      description:
        "Start an AI autonomy analysis session for a job role. Creates a session and returns structured clarifying questions (grouped into 4 categories) to guide the conversation.",
      inputSchema: {
        type: "object",
        properties: {
          role: {
            type: "string",
            description: "Job role to analyze (e.g. 'Data Scientist', 'Marketing Manager')",
          },
          context: {
            type: "string",
            description: "Optional organizational or industry context (e.g. 'Financial services, 200-person team')",
          },
        },
        required: ["role"],
      },
    },
    {
      name: "decompose_capabilities",
      description:
        "Build a structured capability map from clarifying-question answers. Classifies capabilities into Core, Contextual, and Shared zones and flags automatable, judgment-heavy, and high-risk tasks.",
      inputSchema: {
        type: "object",
        properties: {
          session_id: {
            type: "string",
            description: "Session ID from analyze_role (recommended for state persistence)",
          },
          role: { type: "string", description: "Job role being analyzed" },
          answers: {
            type: "object",
            description: "Map of question IDs (q1–q10) to the user's answer strings",
            additionalProperties: { type: "string" },
          },
          capabilities_override: {
            type: "array",
            description:
              "Optional: provide a manually curated capability list to skip AI inference. Each item must match the Capability type.",
            items: { type: "object" },
          },
        },
        required: ["role", "answers"],
      },
    },
    {
      name: "map_autonomy_levels",
      description:
        "Assign AI exposure scores (🟦🟩🟨🟧🟥) for each capability at every autonomy level (L1–L5). Returns the full mapping table and identifies automation patterns.",
      inputSchema: {
        type: "object",
        properties: {
          session_id: { type: "string" },
          capabilities: {
            type: "array",
            description: "Validated capability list from decompose_capabilities",
            items: { type: "object" },
          },
          autonomy_target: {
            type: "string",
            enum: ["L1", "L2", "L3", "L4", "L5"],
            description: "Organization's target autonomy level (from answer to q9)",
          },
        },
        required: ["capabilities"],
      },
    },
    {
      name: "generate_heatmap",
      description:
        "Produce the AI Exposure Heatmap as a formatted markdown table with color-coded scores, key insights (top automation candidates, capabilities that expand, high-risk flags), and recommended autonomy target.",
      inputSchema: {
        type: "object",
        properties: {
          session_id: { type: "string" },
          autonomy_map: {
            type: "array",
            description: "Full autonomy mapping from map_autonomy_levels",
            items: { type: "object" },
          },
          autonomy_target: {
            type: "string",
            enum: ["L1", "L2", "L3", "L4", "L5"],
          },
        },
        required: ["autonomy_map"],
      },
    },
    {
      name: "export_artifacts",
      description:
        "Export all analysis artifacts as a markdown bundle: capability decomposition table, AI exposure heatmap, executive summary with key insights, and workshop facilitation guide.",
      inputSchema: {
        type: "object",
        properties: {
          session_id: { type: "string" },
          role: { type: "string" },
          capabilities: {
            type: "array",
            description: "Validated capabilities list",
            items: { type: "object" },
          },
          heatmap: {
            type: "string",
            description: "Heatmap markdown table string from generate_heatmap",
          },
          autonomy_target: {
            type: "string",
            enum: ["L1", "L2", "L3", "L4", "L5"],
          },
          autonomy_map: {
            type: "array",
            items: { type: "object" },
          },
        },
        required: ["role", "capabilities", "heatmap"],
      },
    },
  ],
}));

// ─── Tool handlers ────────────────────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case "analyze_role":
        result = handleAnalyzeRole(args as unknown as Parameters<typeof handleAnalyzeRole>[0]);
        break;
      case "decompose_capabilities":
        result = handleDecomposeCapabilities(
          args as unknown as Parameters<typeof handleDecomposeCapabilities>[0],
        );
        break;
      case "map_autonomy_levels":
        result = handleMapAutonomyLevels(
          args as unknown as Parameters<typeof handleMapAutonomyLevels>[0],
        );
        break;
      case "generate_heatmap":
        result = handleGenerateHeatmap(
          args as unknown as Parameters<typeof handleGenerateHeatmap>[0],
        );
        break;
      case "export_artifacts":
        result = handleExportArtifacts(
          args as unknown as Parameters<typeof handleExportArtifacts>[0],
        );
        break;
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error in ${name}: ${message}` }],
      isError: true,
    };
  }
});

// ─── Prompts ──────────────────────────────────────────────────────────────────
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: AGENT_INSTRUCTIONS.name,
      description: AGENT_INSTRUCTIONS.description,
      arguments: [],
    },
  ],
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name === AGENT_INSTRUCTIONS.name) {
    return {
      messages: [
        {
          role: "user",
          content: { type: "text", text: AGENT_INSTRUCTIONS.template },
        },
      ],
    };
  }
  throw new Error(`Unknown prompt: ${request.params.name}`);
});

// ─── Start ────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
