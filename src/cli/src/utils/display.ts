import chalk from 'chalk'
import Table from 'cli-table3'
import type { AnalysisSession, AutonomyLevel, ExposureScore } from '../types/autonomy.js'
import { AUTONOMY_LEVELS, EXPOSURE_EMOJI, EXPOSURE_LABEL, LEVEL_LABELS } from '../types/autonomy.js'

export function displayHeader(title: string, subtitle?: string): void {
  console.log()
  console.log(chalk.bold.cyan(`╭─ ${title}`))
  if (subtitle) console.log(chalk.gray(`│  ${subtitle}`))
  console.log(chalk.cyan('╰─'))
  console.log()
}

export function displayHeatmap(session: AnalysisSession): void {
  const map = session.autonomyMap
  if (map.length === 0) {
    console.log(chalk.yellow('ℹ  No capabilities mapped yet.'))
    return
  }

  const target = session.autonomyTarget

  // Create table
  const table = new Table({
    head: [
      chalk.bold.white('Capability'),
      chalk.bold.white('Zone'),
      ...AUTONOMY_LEVELS.map((l) =>
        l === target ? chalk.bold.bgBlueBright.black(l) : chalk.bold.white(l)
      ),
    ],
    colWidths: [25, 12, 4, 4, 4, 4, 4],
    wordWrap: true,
  })

  for (const { capability: cap, scores } of map) {
    const emoji = cap.zone === 'Core' ? '🔵' : cap.zone === 'Contextual' ? '🟣' : '🔷'
    const cells = AUTONOMY_LEVELS.map((l) => {
      const score: ExposureScore = scores[l as AutonomyLevel]
      const em = EXPOSURE_EMOJI[score]
      return l === target ? chalk.bgBlueBright.black(em) : em
    })
    table.push([
      `${emoji} ${cap.name}`,
      cap.zone,
      ...cells,
    ])
  }

  console.log(table.toString())
  console.log()

  // Legend
  console.log(chalk.gray('Legend:'))
  for (const [k, v] of Object.entries(EXPOSURE_EMOJI)) {
    console.log(`  ${v} ${chalk.gray(EXPOSURE_LABEL[k as ExposureScore])}`)
  }
  console.log()
}

export function displayCapabilityTable(session: AnalysisSession): void {
  const caps = session.capabilities
  if (caps.length === 0) {
    console.log(chalk.yellow('ℹ  No capabilities yet.'))
    return
  }

  const table = new Table({
    head: [
      chalk.bold.white('ID'),
      chalk.bold.white('Capability'),
      chalk.bold.white('Zone'),
      chalk.bold.white('Flags'),
    ],
    colWidths: [8, 25, 12, 30],
    wordWrap: true,
  })

  for (const cap of caps) {
    const flags = []
    if (cap.repetitive)   flags.push('🔁 Rep')
    if (cap.dataRich)     flags.push('📊 Data')
    if (cap.highJudgment) flags.push('🧠 Judge')
    if (cap.highRisk)     flags.push('⚠️  Risk')
    table.push([
      chalk.blue(cap.id),
      cap.name,
      chalk.gray(cap.zone),
      chalk.yellow(flags.join(', ') || '—'),
    ])
  }

  console.log(table.toString())
  console.log()
}

export function displayStats(session: AnalysisSession): void {
  const target = session.autonomyTarget
  const map = session.autonomyMap
  if (map.length === 0) return

  const total = map.length
  let highAutomation = 0
  let highHuman = 0

  for (const { scores } of map) {
    const score: ExposureScore = scores[target as AutonomyLevel]
    const n = AUTONOMY_LEVELS.indexOf(target)
    const cap = map[0].scores[target]
    // Simplified: just count the presence
    if (cap === 'MOSTLY_AI' || cap === 'AI') highAutomation++
    if (cap === 'HUMAN' || cap === 'MOSTLY_HUMAN') highHuman++
  }

  console.log(chalk.bold('📊 Summary'))
  console.log(`  Total capabilities:    ${chalk.cyan(String(total))}`)
  console.log(`  High automation (${target}):  ${chalk.yellowBright(String(highAutomation))}`)
  console.log(`  Human-centric (${target}):   ${chalk.green(String(highHuman))}`)
  console.log(`  Target autonomy level:  ${chalk.bold.blue(target)} — ${LEVEL_LABELS[target]}`)
  console.log()
}

export function displayProgress(current: number, total: number, label: string): void {
  const percent = Math.round((current / total) * 100)
  const filled = Math.round((current / total) * 20)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  console.log(`${label} ${chalk.cyan(bar)} ${percent}%`)
}

export function displaySessionsList(sessions: AnalysisSession[]): void {
  if (sessions.length === 0) {
    console.log(chalk.yellow('ℹ  No saved sessions.'))
    return
  }

  const table = new Table({
    head: [
      chalk.bold.white('Session ID'),
      chalk.bold.white('Role'),
      chalk.bold.white('Target'),
      chalk.bold.white('Capabilities'),
      chalk.bold.white('Created'),
    ],
    colWidths: [10, 20, 5, 5, 20],
    wordWrap: true,
  })

  for (const s of sessions.slice(0, 20)) {
    const date = new Date(s.createdAt).toLocaleDateString()
    table.push([
      chalk.blue(s.id.slice(0, 8)),
      s.role,
      s.autonomyTarget,
      chalk.cyan(String(s.capabilities.length)),
      chalk.gray(date),
    ])
  }

  console.log(table.toString())
  console.log()
}
