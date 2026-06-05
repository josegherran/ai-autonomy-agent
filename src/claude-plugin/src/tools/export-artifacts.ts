import { getSession } from "../store/session-store.js";
import type { AutonomyLevel, AutonomyMapping, Capability } from "../types.js";
import { AUTONOMY_LEVELS, LEVEL_LABELS } from "../types.js";

export interface ExportArtifactsArgs {
  session_id?: string;
  role: string;
  capabilities: Capability[];
  heatmap: string;
  autonomy_target?: AutonomyLevel;
  autonomy_map?: AutonomyMapping[];
}

export function handleExportArtifacts(args: ExportArtifactsArgs) {
  const session = args.session_id ? getSession(args.session_id) : undefined;
  const role    = session?.role ?? args.role;
  const target: AutonomyLevel =
    args.autonomy_target ?? session?.autonomyTarget ?? "L3";
  const answers = session?.answers ?? {};
  const date    = new Date().toISOString().split("T")[0];

  // ── Artifact 1: Capability Decomposition Table ─────────────────────────────
  const decompTable = [
    `## Capability Decomposition — ${role}`,
    "",
    "| Zone | Capability | Characteristics |",
    "|------|------------|-----------------|",
    ...args.capabilities.map((cap) => {
      const traits: string[] = [];
      if (cap.repetitive)   traits.push("repetitive");
      if (cap.highJudgment) traits.push("high judgment");
      if (cap.highRisk)     traits.push("⚠️ high risk");
      if (cap.dataRich)     traits.push("data-rich");
      return `| ${cap.zone} | ${cap.name} | ${traits.join(", ") || "—"} |`;
    }),
  ].join("\n");

  // ── Artifact 2: AI Exposure Heatmap ───────────────────────────────────────
  const heatmapArtifact = [
    `## AI Exposure Heatmap — ${role}`,
    "",
    args.heatmap,
    "",
    "**Legend:** 🟦 Fully human | 🟩 Mostly human | 🟨 Shared | 🟧 Mostly AI | 🟥 AI-native",
  ].join("\n");

  // ── Artifact 3: Executive Summary ─────────────────────────────────────────
  const highRisk = args.capabilities.filter((c) => c.highRisk).map((c) => c.name);
  const automatable = args.capabilities.filter((c) => c.repetitive).map((c) => c.name);
  const humanCentric = args.capabilities
    .filter((c) => c.highJudgment && !c.repetitive)
    .map((c) => c.name);

  const execSummary = [
    `## Executive Summary`,
    "",
    `| | |`,
    `|---|---|`,
    `| **Role analyzed** | ${role} |`,
    `| **Total capabilities mapped** | ${args.capabilities.length} |`,
    `| **Recommended autonomy target** | ${target} — ${LEVEL_LABELS[target].split(" — ")[0]} |`,
    `| **Analysis date** | ${date} |`,
    "",
    "### Key Insights",
    "",
    `- **Quick wins for AI investment:** ${automatable.length ? automatable.join(", ") : "None identified"}`,
    `- **Upskilling priorities (capabilities that expand):** ${humanCentric.length ? humanCentric.join(", ") : "None identified"}`,
    `- **Human judgment irreplaceable:** ${highRisk.length ? highRisk.join(", ") : "None flagged"}`,
    "",
    "### Redesign Recommendations",
    "",
    "| Autonomy Level | Description | Human Role |",
    "|---------------|-------------|------------|",
    ...AUTONOMY_LEVELS.map((l) => `| **${l}** | ${LEVEL_LABELS[l].split(" — ")[1] ?? ""} | *(define per capability)* |`),
  ].join("\n");

  // ── Artifact 4: Workshop Facilitation Guide ────────────────────────────────
  const qaLines = Object.keys(answers).length
    ? Object.entries(answers).map(([k, v]) => `**${k.toUpperCase()}:** ${v}`)
    : ["*(No recorded answers — populate manually from session notes)*"];

  const workshop = [
    `## Workshop Facilitation Guide — ${role}`,
    "",
    "### Session Q&A Summary",
    "",
    ...qaLines,
    "",
    "### Facilitation Tips",
    "",
    "1. Walk through the heatmap row by row — invite participants to challenge scores.",
    "2. For each 🟥 capability: *'What governance guardrail is needed before automating this?'*",
    "3. For each 🟦 at L4+: *'What would need to change for AI to assist here?'*",
    "4. For each ⚠️ high-risk capability: confirm explicit human-in-the-loop approval steps.",
    "5. Capture redesign actions: which tasks to automate, augment, or expand.",
  ].join("\n");

  // ── Full bundle ────────────────────────────────────────────────────────────
  const fullBundle = [
    `# AI Autonomy Mapper — Full Report`,
    `**Role:** ${role} | **Target:** ${target} | **Date:** ${date}`,
    "",
    "---", "", decompTable,
    "", "---", "", heatmapArtifact,
    "", "---", "", execSummary,
    "", "---", "", workshop,
  ].join("\n");

  return {
    session_id: args.session_id ?? null,
    artifacts: {
      capability_decomposition: decompTable,
      heatmap: heatmapArtifact,
      executive_summary: execSummary,
      workshop_guide: workshop,
    },
    full_bundle: fullBundle,
    message:
      "All artifacts exported. Present the full_bundle to the user as a formatted document and offer to refine any section or re-run any phase.",
  };
}
