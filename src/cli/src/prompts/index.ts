import { input, checkbox, select, confirm } from '@inquirer/prompts'
import type { AnalysisSession, Capability } from '../types/autonomy.js'
import { AUTONOMY_LEVELS, LEVEL_LABELS } from '../types/autonomy.js'

export async function promptRole(): Promise<{ role: string; context?: string }> {
  const role = await input({
    message: 'Job title or role name:',
    default: 'Product Manager',
    validate: (v) => v.trim().length > 1 || 'Please enter a role',
  })

  const withContext = await confirm({
    message: 'Add context (industry, company size, etc.)?',
    default: false,
  })

  let context: string | undefined
  if (withContext) {
    context = await input({
      message: 'Context:',
      default: '',
    })
  }

  return { role: role.trim(), context: context?.trim() }
}

interface ClarifyingQuestion {
  id: string
  text: string
  group: string
}

const QUESTIONS: ClarifyingQuestion[] = [
  {
    id: 'q1',
    group: 'capability_definition',
    text: 'What are the non-negotiable, day-to-day tasks for this role?',
  },
  {
    id: 'q2',
    group: 'capability_definition',
    text: 'Which tasks vary based on strategy, seniority, team structure, or business context?',
  },
  {
    id: 'q3',
    group: 'capability_definition',
    text: 'Which tasks require cross-functional interaction or stakeholder communication?',
  },
  {
    id: 'q4',
    group: 'ai_suitability',
    text: 'Which tasks are highly repetitive or rule-based?',
  },
  {
    id: 'q5',
    group: 'ai_suitability',
    text: 'Which tasks depend heavily on domain expertise or judgment?',
  },
  {
    id: 'q6',
    group: 'ai_suitability',
    text: 'Where is data availability high or low in this role?',
  },
  {
    id: 'q7',
    group: 'risk_governance',
    text: 'Which tasks require direct human accountability?',
  },
  {
    id: 'q8',
    group: 'risk_governance',
    text: 'Are there ethical, regulatory, or compliance constraints to consider?',
  },
  {
    id: 'q9',
    group: 'autonomy_target',
    text: 'What level of AI autonomy is acceptable for your organization? (L1–L5)',
  },
  {
    id: 'q10',
    group: 'autonomy_target',
    text: 'Where should humans stay in-the-loop (approve) vs. on-the-loop (monitor)?',
  },
]

export async function promptClarifyingQuestions(session: AnalysisSession): Promise<Record<string, string>> {
  const groups = {
    capability_definition: QUESTIONS.filter((q) => q.group === 'capability_definition'),
    ai_suitability: QUESTIONS.filter((q) => q.group === 'ai_suitability'),
    risk_governance: QUESTIONS.filter((q) => q.group === 'risk_governance'),
    autonomy_target: QUESTIONS.filter((q) => q.group === 'autonomy_target'),
  }

  const answers = { ...session.answers }

  for (const [groupName, groupQuestions] of Object.entries(groups)) {
    const groupLabel = {
      capability_definition: 'Capability Definition',
      ai_suitability: 'AI Suitability',
      risk_governance: 'Risk & Governance',
      autonomy_target: 'Autonomy Target',
    }[groupName as keyof typeof groups]

    console.log(`\n📋 ${groupLabel}\n`)

    for (const q of groupQuestions) {
      const existing = answers[q.id]
      const defaultValue = existing ? `${existing.slice(0, 40)}...` : ''
      const answer = await input({
        message: q.text,
        default: defaultValue || '',
        validate: (v) => {
          if (['q9', 'q10'].includes(q.id)) return true
          return v.trim().length > 2 || 'Please provide at least 3 characters'
        },
      })
      answers[q.id] = answer.trim()
    }
  }

  return answers
}

export async function promptCapabilityReview(
  capabilities: Capability[],
): Promise<Capability[]> {
  let caps = [...capabilities]

  let editing = true
  while (editing) {
    console.log(`\nCurrent capabilities: ${caps.length}`)
    const action = await select({
      message: 'What would you like to do?',
      choices: [
        { name: 'Continue', value: 'continue' },
        { name: 'Edit capability flags', value: 'edit' },
        { name: 'Remove a capability', value: 'remove' },
        { name: 'Add a capability', value: 'add' },
      ],
    })

    if (action === 'continue') editing = false
    else if (action === 'edit') {
      const capChoice = await select({
        message: 'Select capability to edit:',
        choices: caps.map((c) => ({ name: c.name, value: c.id })),
      })
      const cap = caps.find((c) => c.id === capChoice)!
      const flags = await checkbox({
        message: 'Flags:',
        choices: [
          { name: 'Repetitive (automates earlier)', value: 'repetitive', checked: cap.repetitive },
          { name: 'Data-rich (enables ML)', value: 'dataRich', checked: cap.dataRich },
          { name: 'High judgment (keeps human longer)', value: 'highJudgment', checked: cap.highJudgment },
          { name: 'High risk (capped at SHARED)', value: 'highRisk', checked: cap.highRisk },
        ],
      })
      cap.repetitive = flags.includes('repetitive')
      cap.dataRich = flags.includes('dataRich')
      cap.highJudgment = flags.includes('highJudgment')
      cap.highRisk = flags.includes('highRisk')
    } else if (action === 'remove') {
      const toRemove = await select({
        message: 'Select capability to remove:',
        choices: caps.map((c) => ({ name: c.name, value: c.id })),
      })
      caps = caps.filter((c) => c.id !== toRemove)
    } else if (action === 'add') {
      const name = await input({
        message: 'Capability name:',
        validate: (v) => v.trim().length > 0 || 'Name required',
      })
      const zone = await select({
        message: 'Zone:',
        choices: [
          { name: 'Core', value: 'Core' },
          { name: 'Contextual', value: 'Contextual' },
          { name: 'Shared', value: 'Shared' },
        ],
      })
      caps.push({
        id: `cap-${Date.now()}`,
        name: name.trim(),
        zone: zone as any,
      })
    }
  }

  return caps
}

export async function promptAutonomyTarget(): Promise<string> {
  const level = await select({
    message: 'Select target autonomy level:',
    choices: AUTONOMY_LEVELS.map((l) => ({
      name: `${l} — ${LEVEL_LABELS[l]}`,
      value: l,
    })),
  })
  return level
}
