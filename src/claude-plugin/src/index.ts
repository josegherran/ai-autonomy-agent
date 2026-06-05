import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "ai-autonomy-mapper", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "analyze_role",
      description:
        "Start an AI autonomy analysis session for a given job role. Returns clarifying questions grouped by category.",
      inputSchema: {
        type: "object",
        properties: {
          role: { type: "string", description: "Job role to analyze (e.g. 'Data Scientist')" },
          context: { type: "string", description: "Optional organizational or industry context" },
        },
        required: ["role"],
      },
    },
    {
      name: "decompose_capabilities",
      description:
        "Build a structured capability map from clarifying-question answers. Returns Core / Contextual / Shared capability zones.",
      inputSchema: {
        type: "object",
        properties: {
          role: { type: "string" },
          answers: {
            type: "object",
            description: "Key-value pairs of question IDs to user answers",
          },
        },
        required: ["role", "answers"],
      },
    },
    {
      name: "map_autonomy_levels",
      description:
        "Assign AI exposure scores (L1–L5) for each capability. Returns the full autonomy mapping table.",
      inputSchema: {
        type: "object",
        properties: {
          capabilities: {
            type: "array",
            items: { type: "object" },
            description: "Capability list from decompose_capabilities",
          },
          autonomy_target: {
            type: "string",
            enum: ["L1", "L2", "L3", "L4", "L5"],
            description: "Organization's target autonomy level",
          },
        },
        required: ["capabilities"],
      },
    },
    {
      name: "generate_heatmap",
      description:
        "Produce the AI Exposure Heatmap artifact as a markdown table with color-coded exposure scores.",
      inputSchema: {
        type: "object",
        properties: {
          autonomy_map: {
            type: "array",
            items: { type: "object" },
            description: "Autonomy mapping from map_autonomy_levels",
          },
        },
        required: ["autonomy_map"],
      },
    },
    {
      name: "export_artifacts",
      description:
        "Export the capability decomposition table, AI exposure heatmap, and workshop facilitation guide as markdown.",
      inputSchema: {
        type: "object",
        properties: {
          role: { type: "string" },
          capabilities: { type: "array", items: { type: "object" } },
          heatmap: { type: "string" },
        },
        required: ["role", "capabilities", "heatmap"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // TODO: implement tool handlers
  throw new Error(`Tool not yet implemented: ${request.params.name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
