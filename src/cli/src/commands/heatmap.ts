import chalk from 'chalk'
import { loadSession, listSessions } from '../services/session-store.js'
import { displayHeader, displayHeatmap, displayStats, displaySessionsList } from '../utils/display.js'
import { select } from '@inquirer/prompts'

export async function heatmapCommand(sessionId?: string): Promise<void> {
  let session = sessionId ? loadSession(sessionId) : null

  if (!session) {
    // List sessions and let user pick
    const sessions = listSessions()
    if (sessions.length === 0) {
      console.log(chalk.yellow('ℹ  No saved sessions. Run: autonomy analyze'))
      return
    }

    displayHeader('Available Sessions')
    displaySessionsList(sessions)

    const chosen = await select({
      message: 'Select a session:',
      choices: sessions.map((s) => ({
        name: `${s.role} — ${s.autonomyTarget} — ${new Date(s.createdAt).toLocaleDateString()}`,
        value: s.id,
      })),
    })
    session = loadSession(chosen)!
  }

  if (!session) {
    console.log(chalk.red('✗ Session not found'))
    return
  }

  if (session.autonomyMap.length === 0) {
    console.log(chalk.yellow('ℹ  Session has no mapped autonomy levels yet.'))
    return
  }

  displayHeader('Autonomy Heatmap', `Role: ${session.role} — Target: ${session.autonomyTarget}`)
  displayHeatmap(session)
  displayStats(session)
}
