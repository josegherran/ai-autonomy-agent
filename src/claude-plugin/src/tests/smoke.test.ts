/**
 * Smoke tests for the AI Autonomy Mapper MCP plugin.
 * Exercises the full 5-tool pipeline with a sample "Data Scientist" role.
 * Run with: npx tsx src/tests/smoke.test.ts
 */
import assert from "node:assert/strict";

import { handleAnalyzeRole } from "../tools/analyze-role.js";
import { handleDecomposeCapabilities } from "../tools/decompose-capabilities.js";
import { handleMapAutonomyLevels } from "../tools/map-autonomy-levels.js";
import { handleGenerateHeatmap } from "../tools/generate-heatmap.js";
import { handleExportArtifacts } from "../tools/export-artifacts.js";
import { decomposeCapabilities, parseTaskList, scoreCapability } from "../engine/autonomy-engine.js";
import { CLARIFYING_QUESTIONS, getQuestionsByGroup } from "../data/clarifying-questions.js";
import type { AutonomyMapping } from "../types.js";

let passed = 0;
let failed = 0;

function test(label: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${label}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${label}`);
    console.error(`     ${(err as Error).message}`);
    failed++;
  }
}

// ─── Engine unit tests ────────────────────────────────────────────────────────
console.log("\n[engine]");

test("parseTaskList: splits comma-separated tasks", () => {
  const result = parseTaskList("data cleaning, model training, reporting");
  assert.equal(result.length, 3);
  assert.ok(result.includes("model training"));
});

test("parseTaskList: splits newline and bullet tasks", () => {
  const result = parseTaskList("- data cleaning\n• model training\n1. reporting");
  assert.equal(result.length, 3);
});

test("parseTaskList: filters out very short entries", () => {
  const result = parseTaskList("a, ab, data cleaning");
  assert.equal(result.length, 1);
});

test("scoreCapability: Core repetitive task reaches AI by L4", () => {
  const scores = scoreCapability({
    id: "test-1", name: "Data entry", zone: "Core", repetitive: true,
  });
  assert.equal(scores["L4"], "AI");
  assert.equal(scores["L5"], "AI");
});

test("scoreCapability: Core high-risk task capped at SHARED", () => {
  const scores = scoreCapability({
    id: "test-2", name: "Compliance review", zone: "Core", highRisk: true,
  });
  const numericMap: Record<string, number> = { HUMAN: 0, MOSTLY_HUMAN: 1, SHARED: 2, MOSTLY_AI: 3, AI: 4 };
  for (const level of ["L1","L2","L3","L4","L5"] as const) {
    assert.ok(numericMap[scores[level]] <= 2, `Expected ≤ SHARED at ${level}, got ${scores[level]}`);
  }
});

test("scoreCapability: Shared zone starts human-centric", () => {
  const scores = scoreCapability({ id: "test-3", name: "Stakeholder comms", zone: "Shared" });
  assert.equal(scores["L1"], "HUMAN");
  assert.equal(scores["L2"], "HUMAN");
});

test("decomposeCapabilities: parses answers into capabilities", () => {
  const caps = decomposeCapabilities({
    role: "Data Scientist",
    answers: {
      q1: "data cleaning, model training, hypothesis testing",
      q2: "experiment design, strategic planning",
      q3: "stakeholder reporting, cross-team alignment",
      q4: "data cleaning",
      q5: "hypothesis testing, strategic planning",
      q6: "High data availability",
      q7: "model training",
      q8: "No regulatory constraints",
    },
  });
  assert.ok(caps.length >= 3);
  assert.ok(caps.some((c) => c.zone === "Core"));
  assert.ok(caps.some((c) => c.zone === "Contextual"));
  assert.ok(caps.some((c) => c.zone === "Shared"));
});

// ─── Tool integration tests ───────────────────────────────────────────────────
console.log("\n[tools]");

const SAMPLE_ANSWERS = {
  q1: "data cleaning, model training, hypothesis testing",
  q2: "experiment design, strategic planning",
  q3: "stakeholder reporting, cross-team alignment",
  q4: "data cleaning",
  q5: "hypothesis testing, strategic planning",
  q6: "High data availability in most tasks",
  q7: "model training deployment",
  q8: "No specific regulatory constraints",
  q9: "L3",
  q10: "Humans stay in-the-loop for model deployment decisions",
};

// Tool 1: analyze_role
const step1 = handleAnalyzeRole({ role: "Data Scientist", context: "Tech company" });

test("analyze_role: returns session_id", () => {
  assert.ok(typeof step1.session_id === "string" && step1.session_id.length > 0);
});

test("analyze_role: returns 4 question groups", () => {
  assert.equal(step1.clarifying_questions.length, 4);
});

test("analyze_role: total of 10 questions across all groups", () => {
  const total = step1.clarifying_questions.reduce((s, g) => s + g.questions.length, 0);
  assert.equal(total, 10);
});

// Tool 2: decompose_capabilities
const step2 = handleDecomposeCapabilities({
  session_id: step1.session_id,
  role: "Data Scientist",
  answers: SAMPLE_ANSWERS,
});

test("decompose_capabilities: returns capabilities array", () => {
  assert.ok(Array.isArray(step2.capabilities) && step2.capabilities.length > 0);
});

test("decompose_capabilities: renders markdown table", () => {
  assert.ok(step2.table.includes("| Zone |"));
  assert.ok(step2.table.includes("Core") || step2.table.includes("Contextual") || step2.table.includes("Shared"));
});

test("decompose_capabilities: no more than 12 capabilities", () => {
  assert.ok(step2.capabilities.length <= 12);
});

// Tool 3: map_autonomy_levels
const step3 = handleMapAutonomyLevels({
  session_id: step1.session_id,
  capabilities: step2.capabilities,
  autonomy_target: "L3",
});

test("map_autonomy_levels: returns autonomy_map with correct length", () => {
  assert.equal(step3.autonomy_map.length, step2.capabilities.length);
});

test("map_autonomy_levels: every mapping has all 5 level scores", () => {
  for (const mapping of step3.autonomy_map as AutonomyMapping[]) {
    for (const l of ["L1","L2","L3","L4","L5"] as const) {
      assert.ok(mapping.scores[l], `Missing score for ${l} on ${mapping.capability.name}`);
    }
  }
});

test("map_autonomy_levels: renders markdown table with emoji", () => {
  assert.ok(step3.table.includes("🟦") || step3.table.includes("🟩") || step3.table.includes("🟨") || step3.table.includes("🟧") || step3.table.includes("🟥"));
});

// Tool 4: generate_heatmap
const step4 = handleGenerateHeatmap({
  session_id: step1.session_id,
  autonomy_map: step3.autonomy_map as AutonomyMapping[],
  autonomy_target: "L3",
});

test("generate_heatmap: returns heatmap string", () => {
  assert.ok(typeof step4.heatmap === "string" && step4.heatmap.length > 50);
});

test("generate_heatmap: insights has 3 automation candidates", () => {
  assert.ok(Array.isArray(step4.insights.top_automation_candidates));
  assert.ok(step4.insights.top_automation_candidates.length <= 3);
});

test("generate_heatmap: recommended target is L3", () => {
  assert.equal(step4.insights.recommended_autonomy_target, "L3");
});

// Tool 5: export_artifacts
const step5 = handleExportArtifacts({
  session_id: step1.session_id,
  role: "Data Scientist",
  capabilities: step2.capabilities,
  heatmap: step4.heatmap,
  autonomy_target: "L3",
  autonomy_map: step3.autonomy_map as AutonomyMapping[],
});

test("export_artifacts: returns full_bundle", () => {
  assert.ok(typeof step5.full_bundle === "string" && step5.full_bundle.length > 200);
});

test("export_artifacts: bundle contains all 4 artifact sections", () => {
  assert.ok(step5.full_bundle.includes("Capability Decomposition"));
  assert.ok(step5.full_bundle.includes("AI Exposure Heatmap"));
  assert.ok(step5.full_bundle.includes("Executive Summary"));
  assert.ok(step5.full_bundle.includes("Workshop Facilitation"));
});

test("export_artifacts: artifacts object has all 4 keys", () => {
  const keys = Object.keys(step5.artifacts);
  assert.ok(keys.includes("capability_decomposition"));
  assert.ok(keys.includes("heatmap"));
  assert.ok(keys.includes("executive_summary"));
  assert.ok(keys.includes("workshop_guide"));
});

// ─── Data tests ───────────────────────────────────────────────────────────────
console.log("\n[data]");

test("CLARIFYING_QUESTIONS has exactly 10 items", () => {
  assert.equal(CLARIFYING_QUESTIONS.length, 10);
});

test("getQuestionsByGroup returns 4 groups", () => {
  const groups = getQuestionsByGroup();
  assert.equal(Object.keys(groups).length, 4);
});

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
