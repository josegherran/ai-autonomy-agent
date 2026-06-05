import { numericScore } from "../engine/autonomy-engine.js";
import { getSession } from "../store/session-store.js";
import type { AutonomyLevel, AutonomyMapping } from "../types.js";
import { AUTONOMY_LEVELS, EXPOSURE_EMOJI, LEVEL_LABELS } from "../types.js";

export interface GenerateHeatmapArgs {
  session_id?: string;
  autonomy_map: AutonomyMapping[];
  autonomy_target?: AutonomyLevel;
}

export function handleGenerateHeatmap(args: GenerateHeatmapArgs) {
  const { autonomy_map } = args;

  // Resolve autonomy target (explicit arg > session > fallback L3)
  let target: AutonomyLevel = args.autonomy_target ?? "L3";
  if (args.session_id) {
    const session = getSession(args.session_id);
    if (session?.autonomyTarget) target = session.autonomyTarget;
  }
  // Allow explicit arg to override session value
  if (args.autonomy_target) target = args.autonomy_target;

  // ── Heatmap table ──────────────────────────────────────────────────────────
  const header    = `| Capability | ${AUTONOMY_LEVELS.join(" | ")} |`;
  const separator = `|${"------------|".repeat(AUTONOMY_LEVELS.length + 1)}`;
  const rows = autonomy_map.map(
    ({ capability, scores }) =>
      `| ${capability.name} | ${AUTONOMY_LEVELS.map((l) => EXPOSURE_EMOJI[scores[l]]).join(" | ")} |`,
  );
  const heatmap = [header, separator, ...rows].join("\n");

  const legend =
    "🟦 Fully human-centric | 🟩 Mostly human; minor AI support | 🟨 Shared responsibility | 🟧 AI does most work; human oversight | 🟥 Highly automatable";

  // ── Insights ───────────────────────────────────────────────────────────────
  const ranked = [...autonomy_map]
    .map(({ capability, scores }) => ({
      name: capability.name,
      zone: capability.zone,
      highRisk: capability.highRisk ?? false,
      avgScore:
        AUTONOMY_LEVELS.reduce((sum, l) => sum + numericScore(scores[l]), 0) /
        AUTONOMY_LEVELS.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const top_automation_candidates = ranked.slice(0, 3).map((c) => c.name);
  const capabilities_that_expand  = ranked.slice(-3).reverse().map((c) => c.name);
  const high_risk_capabilities    = autonomy_map
    .filter(({ capability }) => capability.highRisk)
    .map(({ capability }) => capability.name);

  // ── Target-level summary ───────────────────────────────────────────────────
  const target_snapshot = autonomy_map.map(({ capability, scores }) => ({
    capability: capability.name,
    at_target: `${EXPOSURE_EMOJI[scores[target]]} ${scores[target].replace("_", " ")}`,
    high_risk: capability.highRisk ?? false,
  }));

  return {
    session_id: args.session_id ?? null,
    heatmap,
    legend,
    level_reference: AUTONOMY_LEVELS.map((l) => `**${l}** — ${LEVEL_LABELS[l]}`).join("\n"),
    insights: {
      top_automation_candidates,
      capabilities_that_expand,
      high_risk_capabilities,
      recommended_autonomy_target: target,
    },
    target_snapshot,
    next_step:
      "Present the heatmap and insights to the user. Then call export_artifacts to package the full deliverable.",
  };
}
