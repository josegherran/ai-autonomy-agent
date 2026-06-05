import chalk from 'chalk'
import { decomposeCapabilities, mapAutonomyLevels } from '../services/autonomy-engine.js'
import { promptRole, promptClarifyingQuestions, promptCapabilityReview, promptAutonomyTarget } from '../prompts/index.js'
import { createNewSession, saveSession } from '../services/session-store.js'
import { displayHeader, displayHeatmap, displayStats } from '../utils/display.js'

export async function analyzeCommand(): Promise<void> {
  displayHeader('AI Autonomy Mapper — Full Analysis', 'Interactive terminal-based workflow')

  // Phase 1: Role
  console.log(chalk.blue.bold('📋 Phase 1: Define Role'))
  const { role, context } = await promptRole()

  let session = createNewSession(role, context)
  saveSession(session)
  console.log(chalk.green(`✓ Role set: ${chalk.bold(role)}`))
  if (context) console.log(chalk.gray(`  Context: ${context}`))
  console.log()

  // Phase 2: Clarifying Questions
  console.log(chalk.blue.bold('❓ Phase 2: Answer Clarifying Questions'))
  const answers = await promptClarifyingQuestions(session)
  session.answers = answers
  saveSession(session)
  console.log(chalk.green('✓ Questions answered'))
  console.log()

  // Phase 3: Capability Decomposition & Review
  console.log(chalk.blue.bold('🔍 Phase 3: Capability Decomposition'))
  let capabilities = decomposeCapabilities(role, answers)
  console.log(chalk.green(`✓ ${capabilities.length} capabilities decomposed`))
  console.log()

  console.log(chalk.blue.bold('✏️  Phase 4: Capability Review'))
  capabilities = await promptCapabilityReview(capabilities)
  session.capabilities = capabilities
  saveSession(session)
  console.log(chalk.green(`✓ ${capabilities.length} capabilities finalized`))
  console.log()

  // Phase 5: Autonomy Target
  console.log(chalk.blue.bold('🎯 Phase 5: Set Autonomy Target'))
  const target = await promptAutonomyTarget()
  session.autonomyTarget = target as any
  saveSession(session)
  console.log(chalk.green(`✓ Target set to ${chalk.bold(target)}`))
  console.log()

  // Phase 6: Mapping & Display
  console.log(chalk.blue.bold('📊 Phase 6: Autonomy Mapping & Report'))
  const autonomyMap = mapAutonomyLevels(capabilities)
  session.autonomyMap = autonomyMap
  session.updatedAt = new Date().toISOString()
  saveSession(session)
  console.log(chalk.green('✓ Autonomy levels mapped'))
  console.log()

  // Display results
  displayHeader('Heatmap', `Target: ${target}`)
  displayHeatmap(session)
  displayStats(session)

  console.log(chalk.cyan.bold(`✨ Analysis complete!`))
  console.log(chalk.gray(`Session ID: ${session.id}`))
  console.log(chalk.gray(`Use: ${chalk.bold('autonomy export')} ${session.id.slice(0, 8)} --format md`))
  console.log()
}
