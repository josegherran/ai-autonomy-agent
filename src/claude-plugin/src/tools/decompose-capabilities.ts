import { decomposeCapabilities } from "../engine/autonomy-engine.js";
import { getSession, updateSession } from "../store/session-store.js";
import type { Capability } from "../types.js";
import { AUTONOMY_LEVELS } from "../types.js";

export interface DecomposeCapabilitiesArgs {
  session_id?: string;
  role: string;
  answers: Record<string, string>;
  /** Provide a manually curated list to skip heuristic inference */
  capabilities_override?: Capability[];
}

export function handleDecomposeCapabilities(args: DecomposeCapabilitiesArgs) {
  const capabilities =
    args.capabilities_override ??
    decomposeCapabilities({ role: args.role, answers: args.answers });

  // Persist to session if provided
  if (args.session_id) {
    try {
      updateSession(args.session_id, { answers: args.answers, capabilities });
    } catch {
      // Session may not exist if called without analyze_role — silently continue
    }
  }

  // Render markdown table for the LLM to present to the user
  const tableRows = capabilities.map(
    (cap) =>
      `| ${cap.zone} | ${cap.name} | ${cap.notes ?? "—"} |`,
  );

  const table = [
    "| Zone | Capability | Notes |",
    "|------|------------|-------|",
    ...tableRows,
  ].join("\n");

  const warning =
    capabilities.length > 10
      ? `⚠️ The list has ${capabilities.length} capabilities. Consider asking the user to group related ones to stay within 10–12.`
      : undefined;

  return {
    session_id: args.session_id ?? null,
    capabilities,
    capability_count: capabilities.length,
    table,
    warning: warning ?? null,
    next_step:
      "Present this capability table to the user. Ask them to validate it — they can add, rename, or remove capabilities. Once confirmed, call map_autonomy_levels with the validated capabilities list.",
  };
}
