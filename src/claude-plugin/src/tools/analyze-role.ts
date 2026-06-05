import { createSession } from "../store/session-store.js";
import { getQuestionsByGroup } from "../data/clarifying-questions.js";

export interface AnalyzeRoleArgs {
  role: string;
  context?: string;
}

export function handleAnalyzeRole(args: AnalyzeRoleArgs) {
  const session = createSession(args.role, args.context);
  const byGroup = getQuestionsByGroup();

  const questionGroups = Object.entries(byGroup).map(([, questions]) => ({
    groupId: questions[0].group,
    groupLabel: questions[0].groupLabel,
    questions: questions.map((q) => ({ id: q.id, text: q.text })),
  }));

  return {
    session_id: session.id,
    role: session.role,
    context: session.context ?? null,
    clarifying_questions: questionGroups,
    workflow_instructions: [
      "1. Present Group A (Capability Definition) — questions q1, q2, q3 — one at a time or together.",
      "2. After the user answers Group A, present Group B (AI Suitability) — q4, q5, q6.",
      "3. After Group B, present Group C (Risk & Governance) — q7, q8.",
      "4. Finally present Group D (Autonomy Target) — q9, q10.",
      "5. Collect all answers into a {q1:..., q2:..., ...} map.",
      "6. Call decompose_capabilities with the session_id and the answers map.",
    ],
  };
}
