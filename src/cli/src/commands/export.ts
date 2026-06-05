import chalk from 'chalk'
import { loadSession, listSessions } from '../services/session-store.js'
import { exportMarkdown, exportCSV, saveToFile } from '../utils/export.js'
import { select } from '@inquirer/prompts'

export async function exportCommand(sessionId?: string, format: 'md' | 'json' | 'csv' = 'md'): Promise<void> {
  let session = sessionId ? loadSession(sessionId) : null

  if (!session) {
    // List sessions and let user pick
    const sessions = listSessions()
    if (sessions.length === 0) {
      console.log(chalk.yellow('ℹ  No saved sessions.'))
      return
    }

    const chosen = await select({
      message: 'Select a session to export:',
      choices: sessions.map((s) => ({
        name: `${s.role} — ${s.autonomyTarget}`,
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
    console.log(chalk.yellow('ℹ  Session has no capabilities to export.'))
    return
  }

  const filename = `ai-autonomy-${session.role.toLowerCase().replace(/\s+/g, '-')}-${session.autonomyTarget}`

  let content: string
  if (format === 'md') {
    content = exportMarkdown(session)
  } else if (format === 'csv') {
    content = exportCSV(session)
  } else {
    content = JSON.stringify(session, null, 2)
  }

  const filepath = saveToFile(filename, content, format)
  console.log(chalk.green(`✓ Exported to: ${chalk.bold(filepath)}`))
  console.log()
}
