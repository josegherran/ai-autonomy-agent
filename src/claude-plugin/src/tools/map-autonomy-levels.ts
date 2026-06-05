import { mapAutonomyLevels, numericScore } from "../engine/autonomy-engine.js";
import { setAutonomyMap } from "../store/session-store.js";
import type { AutonomyLevel, Capability } from "../types.js";
import { AUTONOMY_LEVELS, EXPOSURE_EMOJI, LEVEL_LABELS } from "../types.js";

export interface MapAutonomyLevelsArgs {
  session_id?: string;
  capabilities: Capability[];
  autonomy_target?: AutonomyLevel;
}

export function handleMapAutonomyLevels(args: MapAutonomyLevelsArgs) {
  const autonomyMap = mapAutonomyLevels(args.capabilities);

  if (args.session_id) {
    try {
      setAutonomyMap(args.session_id, autonomyMap, args.autonomy_target);
    } catch {
      // silent — session optional
    }
  }

  // Render mapping table
  const header = `| Capability | Zone | ${AUTONOMY_LEVELS.join(" | ")} |`;
  const divider = `|------------|------|${AUTONOMY_LEVELS.map(() => "----").join("|")}|`;
  const rows = autonomyMap.map(
    ({ capability, scores }) =>
      `| ${capability.name} | ${capability.zone} | ${AUTONOMY_LEVELS.map((l) => EXPOSURE_EMOJI[scores[l]]).join(" | ")} |`,
  );
  const table = [header, divider, ...rows].join("\n");

  // Level reference sidebar
  const levelRef = AUTONOMY_LEVELS.map((l) => `**${l}** — ${LEVEL_LABELS[l]}`).join("\n");

  // Pattern analysis
  const automates_first = autonomyMap
    .filter(({ scores }) => scores["L3"] === "MOSTLY_AI" || scores["L3"] === "AI")
    .map(({ capability }) => capability.name);

  const remains_human_centric = autonomyMap
    .filter(({ scores }) => scores["L5"] === "HUMAN" || scores["L5"] === "MOSTLY_HUMAN")
    .map(({ capability }) => capability.name);

  const high_risk_flags = args.capabilities
    .filter((c) => c.highRisk)
    .map((c) => c.name);

  return {
    session_id: args.session_id ?? null,
    autonomy_map: autonomyMap,
    table,
    level_reference: levelRef,
    patterns: {
      automates_first,
      remains_human_centric,
      high_risk_flags,
    },
    next_step:
      "Call generate_heatmap with this autonomy_map to produce the AI Exposure Heatmap artifact.",
  };
}
