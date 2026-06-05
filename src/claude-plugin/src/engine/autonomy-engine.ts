import type {
  AutonomyLevel,
  AutonomyMapping,
  Capability,
  CapabilityZone,
  ExposureScore,
} from "../types.js";
import { AUTONOMY_LEVELS } from "../types.js";

// ─── Numeric score ladder ─────────────────────────────────────────────────────
// HUMAN=0  MOSTLY_HUMAN=1  SHARED=2  MOSTLY_AI=3  AI=4
const SCORE_LADDER: ExposureScore[] = [
  "HUMAN",
  "MOSTLY_HUMAN",
  "SHARED",
  "MOSTLY_AI",
  "AI",
];

function toExposureScore(n: number): ExposureScore {
  return SCORE_LADDER[Math.max(0, Math.min(4, Math.round(n)))];
}

// ─── Base score progression [L1,L2,L3,L4,L5] by capability zone ──────────────
// Numbers map to the SCORE_LADDER above (0=HUMAN … 4=AI)
const BASE_SCORES: Record<CapabilityZone, number[]> = {
  Core:        [1, 2, 3, 4, 4], // 🟩 🟨 🟧 🟥 🟥
  Contextual:  [0, 1, 2, 3, 3], // 🟦 🟩 🟨 🟧 🟧
  Shared:      [0, 0, 1, 1, 2], // 🟦 🟦 🟩 🟩 🟨
};

// ─── Score a single capability across all 5 levels ───────────────────────────
export function scoreCapability(cap: Capability): Record<AutonomyLevel, ExposureScore> {
  const base = [...BASE_SCORES[cap.zone]];

  const scores = base.map((v) => {
    let s = v;
    if (cap.repetitive)   s += 1;    // Repetitive → automates earlier
    if (cap.dataRich)     s += 0.5;  // Data-rich → enables automation
    if (cap.highJudgment) s -= 1;    // High judgment → keeps human longer
    if (cap.highRisk)     s = Math.min(s, 2); // High risk → cap at SHARED
    return s;
  });

  const result = {} as Record<AutonomyLevel, ExposureScore>;
  AUTONOMY_LEVELS.forEach((level, i) => {
    result[level] = toExposureScore(scores[i]);
  });
  return result;
}

// ─── Parse a free-text task list (comma / semicolon / newline / bullet) ───────
export function parseTaskList(text: string): string[] {
  return text
    .split(/[\n,;•\-\*]+/)
    .map((t) => t.trim().replace(/^\d+[.)]\s*/, "").trim())
    .filter((t) => t.length > 3 && t.length < 120);
}

// ─── Check if a task name has keywords matching a free-text answer ────────────
function mentionedIn(task: string, answer: string): boolean {
  const taskLower = task.toLowerCase();
  const ansLower  = answer.toLowerCase();
  // Match any significant word (>4 chars) from the task name
  const words = taskLower.split(/\s+/).filter((w) => w.length > 4);
  return words.length > 0 && words.some((w) => ansLower.includes(w));
}

// ─── Capability decomposition from clarifying-question answers ────────────────
export interface DecomposeInput {
  role: string;
  answers: Record<string, string>;
}

export function decomposeCapabilities(input: DecomposeInput): Capability[] {
  const { answers } = input;

  const coreTasks       = parseTaskList(answers.q1 ?? "");
  const contextualTasks = parseTaskList(answers.q2 ?? "");
  const sharedTasks     = parseTaskList(answers.q3 ?? "");

  const repetitiveAns    = answers.q4 ?? "";
  const judgmentAns      = answers.q5 ?? "";
  const dataAns          = answers.q6 ?? "";
  const accountabilityAns = answers.q7 ?? "";
  const riskAns          = answers.q8 ?? "";

  const dataRichGlobal = /high|abundant|rich|available|lots|large dataset/i.test(dataAns);
  const hasRegulatory  = /regulat|compliance|legal|ethic|gdpr|hipaa|sox|audit/i.test(riskAns);

  let counter = 1;

  function build(name: string, zone: CapabilityZone): Capability {
    const repetitive   = mentionedIn(name, repetitiveAns);
    const highJudgment = mentionedIn(name, judgmentAns);
    const accountability = mentionedIn(name, accountabilityAns);
    const highRisk     = accountability || hasRegulatory;
    const dataRich     = dataRichGlobal && !mentionedIn(name, "manual");

    const notes: string[] = [];
    if (highRisk)     notes.push("⚠️ high risk — human oversight required");
    if (highJudgment) notes.push("requires high human judgment");
    if (repetitive)   notes.push("highly automatable");
    if (dataRich)     notes.push("data-rich environment");

    return {
      id: `cap-${String(counter++).padStart(2, "0")}`,
      name,
      zone,
      notes: notes.join("; ") || undefined,
      repetitive,
      highJudgment,
      highRisk,
      dataRich,
    };
  }

  const capabilities: Capability[] = [
    ...coreTasks.map((t) => build(t, "Core")),
    ...contextualTasks.map((t) => build(t, "Contextual")),
    ...sharedTasks.map((t) => build(t, "Shared")),
  ];

  // Enforce max-12 recommendation from the framework spec
  return capabilities.slice(0, 12);
}

// ─── Map capabilities to full autonomy scoring ────────────────────────────────
export function mapAutonomyLevels(capabilities: Capability[]): AutonomyMapping[] {
  return capabilities.map((cap) => ({
    capability: cap,
    scores: scoreCapability(cap),
  }));
}

// ─── Numeric score value for sorting/averaging ────────────────────────────────
export function numericScore(score: ExposureScore): number {
  return SCORE_LADDER.indexOf(score);
}
