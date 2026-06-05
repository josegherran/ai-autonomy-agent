import type {
  AutonomyLevel,
  AutonomyMapping,
  Capability,
  CapabilityZone,
  ExposureScore,
} from '../types/autonomy'
import { AUTONOMY_LEVELS } from '../types/autonomy'

const SCORE_LADDER: ExposureScore[] = ['HUMAN', 'MOSTLY_HUMAN', 'SHARED', 'MOSTLY_AI', 'AI']

function toScore(n: number): ExposureScore {
  return SCORE_LADDER[Math.max(0, Math.min(4, Math.round(n)))]
}

const BASE_SCORES: Record<CapabilityZone, number[]> = {
  Core: [1, 2, 3, 4, 4],
  Contextual: [0, 1, 2, 3, 3],
  Shared: [0, 0, 1, 1, 2],
}

export function scoreCapability(capability: Capability): Record<AutonomyLevel, ExposureScore> {
  const zone = capability.zone
  const bases = BASE_SCORES[zone]

  let scores: Record<AutonomyLevel, ExposureScore> = {} as any
  for (let i = 0; i < AUTONOMY_LEVELS.length; i++) {
    const level = AUTONOMY_LEVELS[i]
    let score = bases[i]

    // Apply modifiers
    if (capability.flags.repetitive) score += 1
    if (capability.flags.dataRich) score += 0.5
    if (capability.flags.highJudgment) score -= 1
    if (capability.flags.highRisk && zone === 'Shared') score = Math.min(score, 2)

    scores[level] = toScore(score)
  }
  return scores
}

export function numericScore(score: ExposureScore): number {
  return SCORE_LADDER.indexOf(score)
}

export function parseTaskList(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
}

export function decomposeCapabilities(role: string, answers: Record<string, string>): Capability[] {
  const capabilities: Capability[] = []
  const tasksList = parseTaskList(answers['q1'] || '')

  for (let i = 0; i < tasksList.length; i++) {
    const task = tasksList[i]

    // Determine zone based on task characteristics
    let zone: CapabilityZone = 'Contextual'
    const isCore = (role + task).toLowerCase().includes('core') || (role + task).toLowerCase().includes('strategic')
    const isShared = (role + task).toLowerCase().includes('shared') || (role + task).toLowerCase().includes('collaborative')
    if (isCore) zone = 'Core'
    if (isShared) zone = 'Shared'

    // Check flags based on answers
    const repetitiveText = (answers['q4'] || '').toLowerCase()
    const dataRichText = (answers['q5'] || '').toLowerCase()
    const highJudgmentText = (answers['q6'] || '').toLowerCase()
    const riskText = (answers['q7'] || '').toLowerCase()

    const taskLower = task.toLowerCase()
    const flags = {
      repetitive: repetitiveText.includes(taskLower) || repetitiveText.includes(task.split(' ')[0]),
      dataRich: dataRichText.includes(taskLower) || dataRichText.includes(task.split(' ')[0]),
      highJudgment: highJudgmentText.includes(taskLower) || highJudgmentText.includes(task.split(' ')[0]),
      highRisk: riskText.includes(taskLower) || riskText.includes(task.split(' ')[0]),
    }

    const capability: Capability = {
      id: `cap-${i + 1}`,
      name: task,
      zone,
      notes: undefined,
      flags,
    }

    capabilities.push(capability)
  }

  return capabilities
}

export function mapAutonomyLevels(capabilities: Capability[]): AutonomyMapping[] {
  return capabilities.map((cap) => ({
    capabilityId: cap.id,
    capability: cap,
    scores: scoreCapability(cap),
  }))
}
