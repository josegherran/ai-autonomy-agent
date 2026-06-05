export type AutonomyLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
export type ExposureScore = 'HUMAN' | 'MOSTLY_HUMAN' | 'SHARED' | 'MOSTLY_AI' | 'AI'
export type CapabilityZone = 'Core' | 'Contextual' | 'Shared'

export const AUTONOMY_LEVELS: AutonomyLevel[] = ['L1', 'L2', 'L3', 'L4', 'L5']

export const LEVEL_LABELS: Record<AutonomyLevel, string> = {
  L1: 'Static assistant — AI provides guidance; human applies and validates',
  L2: 'Embedded helper — AI automates routine tasks; human selects and refines',
  L3: 'Task automation — AI executes well-defined tasks; human oversees',
  L4: 'Operational collaborator — AI runs workflows; human focuses on decisions',
  L5: 'Multi-agent environment — AI coordinates adaptively; human provides governance',
}

export const EXPOSURE_EMOJI: Record<ExposureScore, string> = {
  HUMAN: '🟦',
  MOSTLY_HUMAN: '🟩',
  SHARED: '🟨',
  MOSTLY_AI: '🟧',
  AI: '🟥',
}

export const EXPOSURE_LABEL: Record<ExposureScore, string> = {
  HUMAN: 'Fully human-centric',
  MOSTLY_HUMAN: 'Mostly human; minor AI support',
  SHARED: 'Shared responsibility',
  MOSTLY_AI: 'AI does most work; human oversight needed',
  AI: 'Highly automatable / AI-native',
}

export interface Capability {
  id: string
  name: string
  zone: CapabilityZone
  notes?: string
  repetitive?: boolean
  highJudgment?: boolean
  highRisk?: boolean
  dataRich?: boolean
}

export interface AutonomyMapping {
  capability: Capability
  scores: Record<AutonomyLevel, ExposureScore>
}

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

export interface ClarifyingQuestion {
  id: string
  group: 'capability_definition' | 'ai_suitability' | 'risk_governance' | 'autonomy_target'
  groupLabel: string
  text: string
}
