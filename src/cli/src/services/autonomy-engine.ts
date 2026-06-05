import type {
  AutonomyLevel,
  AutonomyMapping,
  Capability,
  CapabilityZone,
  ExposureScore,
} from '../types/autonomy.js'
import { AUTONOMY_LEVELS } from '../types/autonomy.js'

const SCORE_LADDER: ExposureScore[] = ['HUMAN', 'MOSTLY_HUMAN', 'SHARED', 'MOSTLY_AI', 'AI']

function toScore(n: number): ExposureScore {
  return SCORE_LADDER[Math.max(0, Math.min(4, Math.round(n)))]
}

const BASE_SCORES: Record<CapabilityZone, number[]> = {
  Core:       [1, 2, 3, 4, 4],
  Contextual: [0, 1, 2, 3, 3],
  Shared:     [0, 0, 1, 1, 2],
}

export function scoreCapability(cap: Capability): Record<AutonomyLevel, ExposureScore> {
  const scores = BASE_SCORES[cap.zone].map((v) => {
    let s = v
    if (cap.repetitive)   s += 1
    if (cap.dataRich)     s += 0.5
    if (cap.highJudgment) s -= 1
    if (cap.highRisk)     s = Math.min(s, 2)
    return s
  })
  const result = {} as Record<AutonomyLevel, ExposureScore>
  AUTONOMY_LEVELS.forEach((l, i) => { result[l] = toScore(scores[i]) })
  return result
}

export function parseTaskList(text: string): string[] {
  return text
    .split(/[\n,;•\-*]+/)
    .map((t) => t.trim().replace(/^\d+[.)]\s*/, '').trim())
    .filter((t) => t.length > 3 && t.length < 120)
}

function mentionedIn(task: string, answer: string): boolean {
  const words = task.toLowerCase().split(/\s+/).filter((w) => w.length > 4)
  return words.length > 0 && words.some((w) => answer.toLowerCase().includes(w))
}

export function decomposeCapabilities(role: string, answers: Record<string, string>): Capability[] {
  const coreTasks       = parseTaskList(answers.q1 ?? '')
  const contextualTasks = parseTaskList(answers.q2 ?? '')
  const sharedTasks     = parseTaskList(answers.q3 ?? '')
  const repetitiveAns   = answers.q4 ?? ''
  const judgmentAns     = answers.q5 ?? ''
  const dataAns         = answers.q6 ?? ''
  const accountAns      = answers.q7 ?? ''
  const riskAns         = answers.q8 ?? ''

  const dataRichGlobal = /high|abundant|rich|available|lots|large dataset/i.test(dataAns)
  const hasRegulatory  = /regulat|compliance|legal|ethic|gdpr|hipaa|sox|audit/i.test(riskAns)

  let counter = 1
  function build(name: string, zone: CapabilityZone): Capability {
    const repetitive   = mentionedIn(name, repetitiveAns)
    const highJudgment = mentionedIn(name, judgmentAns)
    const highRisk     = mentionedIn(name, accountAns) || hasRegulatory
    const dataRich     = dataRichGlobal
    const notes: string[] = []
    if (highRisk)     notes.push('⚠️ high risk')
    if (highJudgment) notes.push('high judgment')
    if (repetitive)   notes.push('automatable')
    return { id: `cap-${String(counter++).padStart(2, '0')}`, name, zone, notes: notes.join(', ') || undefined, repetitive, highJudgment, highRisk, dataRich }
  }

  const caps = [
    ...coreTasks.map((t) => build(t, 'Core')),
    ...contextualTasks.map((t) => build(t, 'Contextual')),
    ...sharedTasks.map((t) => build(t, 'Shared')),
  ]
  void role
  return caps.slice(0, 12)
}

export function mapAutonomyLevels(capabilities: Capability[]): AutonomyMapping[] {
  return capabilities.map((cap) => ({ capability: cap, scores: scoreCapability(cap) }))
}

export function numericScore(score: ExposureScore): number {
  return SCORE_LADDER.indexOf(score)
}
