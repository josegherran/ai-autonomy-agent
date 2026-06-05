import type { ClarifyingQuestion } from "../types.js";

export const CLARIFYING_QUESTIONS: ClarifyingQuestion[] = [
  // Group A — Capability Definition
  {
    id: "q1",
    group: "capability_definition",
    groupLabel: "Capability Definition",
    text: "What are the non-negotiable, day-to-day tasks for this role?",
  },
  {
    id: "q2",
    group: "capability_definition",
    groupLabel: "Capability Definition",
    text: "Which tasks vary based on strategy, seniority, team structure, or business context?",
  },
  {
    id: "q3",
    group: "capability_definition",
    groupLabel: "Capability Definition",
    text: "Which tasks require cross-functional interaction or stakeholder communication?",
  },
  // Group B — AI Suitability
  {
    id: "q4",
    group: "ai_suitability",
    groupLabel: "AI Suitability",
    text: "Which tasks are highly repetitive or rule-based?",
  },
  {
    id: "q5",
    group: "ai_suitability",
    groupLabel: "AI Suitability",
    text: "Which tasks depend heavily on domain expertise or judgment?",
  },
  {
    id: "q6",
    group: "ai_suitability",
    groupLabel: "AI Suitability",
    text: "Where is data availability high or low in this role?",
  },
  // Group C — Risk & Governance
  {
    id: "q7",
    group: "risk_governance",
    groupLabel: "Risk & Governance",
    text: "Which tasks require direct human accountability?",
  },
  {
    id: "q8",
    group: "risk_governance",
    groupLabel: "Risk & Governance",
    text: "Are there ethical, regulatory, or compliance constraints to consider?",
  },
  // Group D — Autonomy Target
  {
    id: "q9",
    group: "autonomy_target",
    groupLabel: "Autonomy Target",
    text: "What level of AI autonomy is acceptable for your organization? (L1–L5 — ask for explanation if needed)",
  },
  {
    id: "q10",
    group: "autonomy_target",
    groupLabel: "Autonomy Target",
    text: "Where should humans stay in-the-loop (approve actions) vs. on-the-loop (monitor outcomes)?",
  },
];

/** Returns questions keyed by group, preserving display order */
export function getQuestionsByGroup(): Record<string, ClarifyingQuestion[]> {
  const order = ["capability_definition", "ai_suitability", "risk_governance", "autonomy_target"];
  const map: Record<string, ClarifyingQuestion[]> = {};
  for (const g of order) map[g] = [];
  for (const q of CLARIFYING_QUESTIONS) map[q.group].push(q);
  return map;
}
