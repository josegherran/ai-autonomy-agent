// Autonomy Levels (L1-L5 progression)
export type AutonomyLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
export const AUTONOMY_LEVELS: AutonomyLevel[] = ['L1', 'L2', 'L3', 'L4', 'L5']
export const LEVEL_LABELS: Record<AutonomyLevel, string> = {
  L1: 'Human-centric with AI suggestions',
  L2: 'Mostly human-led with AI support',
  L3: 'Balanced human-AI partnership',
  L4: 'Mostly AI-driven with human oversight',
  L5: 'Fully autonomous AI execution',
}

// Exposure Score (5 levels from human to AI)
export type ExposureScore = 'HUMAN' | 'MOSTLY_HUMAN' | 'SHARED' | 'MOSTLY_AI' | 'AI'
export const EXPOSURE_EMOJI: Record<ExposureScore, string> = {
  HUMAN: '🟦',
  MOSTLY_HUMAN: '🟩',
  SHARED: '🟨',
  MOSTLY_AI: '🟧',
  AI: '🟥',
}
export const EXPOSURE_LABEL: Record<ExposureScore, string> = {
  HUMAN: 'Human-centric',
  MOSTLY_HUMAN: 'Mostly human',
  SHARED: 'Shared (50-50)',
  MOSTLY_AI: 'Mostly AI',
  AI: 'Fully AI',
}

// Capability Zone
export type CapabilityZone = 'Core' | 'Contextual' | 'Shared'

// Capability with scoring information
export interface Capability {
  id: string
  name: string
  zone: CapabilityZone
  notes?: string
  flags: {
    repetitive: boolean
    dataRich: boolean
    highJudgment: boolean
    highRisk: boolean
  }
}

// Autonomy mapping for a single capability across all levels
export interface AutonomyMapping {
  capabilityId: string
  capability: Capability
  scores: Record<AutonomyLevel, ExposureScore>
}

// Analysis session tracking all answers and results
export interface AnalysisSession {
  id: string
  role: string
  context?: string
  answers: Record<string, string>
  capabilities: Capability[]
  autonomyMap: AutonomyMapping[]
  autonomyTarget: AutonomyLevel
  createdAt: string
  updatedAt: string
}

// Clarifying question structure
export interface ClarifyingQuestion {
  id: string
  group: 'capability_definition' | 'ai_suitability' | 'risk_governance' | 'autonomy_target'
  text: string
  help?: string
  required: boolean
}

// Clarifying questions reference
export const CLARIFYING_QUESTIONS: ClarifyingQuestion[] = [
  // Group: Capability Definition (Q1-Q3)
  {
    id: 'q1',
    group: 'capability_definition',
    text: 'What are the primary job tasks (3-5)?',
    help: 'List key responsibilities and activities',
    required: true,
  },
  {
    id: 'q2',
    group: 'capability_definition',
    text: 'What data, tools, or systems are involved?',
    help: 'Describe information flow and dependencies',
    required: true,
  },
  {
    id: 'q3',
    group: 'capability_definition',
    text: 'What decisions or outcomes does this role drive?',
    help: 'Explain impact on business or stakeholders',
    required: true,
  },
  // Group: AI Suitability (Q4-Q6)
  {
    id: 'q4',
    group: 'ai_suitability',
    text: 'Which tasks are repetitive or follow patterns?',
    help: 'Identify candidates for automation',
    required: true,
  },
  {
    id: 'q5',
    group: 'ai_suitability',
    text: 'Which tasks are data-rich?',
    help: 'Tasks with abundant training data or inputs',
    required: true,
  },
  {
    id: 'q6',
    group: 'ai_suitability',
    text: 'Which tasks require high judgment or expertise?',
    help: 'Tasks needing human experience or intuition',
    required: true,
  },
  // Group: Risk & Governance (Q7-Q8)
  {
    id: 'q7',
    group: 'risk_governance',
    text: 'Are there high-risk or compliance-sensitive tasks?',
    help: 'Legal, safety, or regulatory constraints',
    required: true,
  },
  {
    id: 'q8',
    group: 'risk_governance',
    text: 'What governance, oversight, or audit requirements exist?',
    help: 'Control mechanisms and accountability rules',
    required: true,
  },
  // Group: Autonomy Target (Q9-Q10, optional)
  {
    id: 'q9',
    group: 'autonomy_target',
    text: 'What is your organizational culture on AI autonomy?',
    help: 'Risk appetite and trust level',
    required: false,
  },
  {
    id: 'q10',
    group: 'autonomy_target',
    text: 'Are there specific autonomy level constraints or goals?',
    help: 'Desired or required outcomes',
    required: false,
  },
]
