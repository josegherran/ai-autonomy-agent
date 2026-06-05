import chalk from 'chalk'
import { listSessions } from '../services/session-store.js'
import { displayHeader, displaySessionsList } from '../utils/display.js'

export async function listCommand(): Promise<void> {
  const sessions = listSessions()

  displayHeader('Saved Analysis Sessions')

  if (sessions.length === 0) {
    console.log(chalk.yellow('ℹ  No saved sessions. Run: autonomy analyze'))
    console.log()
    return
  }

  displaySessionsList(sessions)

  console.log(chalk.gray(`Total: ${sessions.length} session${sessions.length === 1 ? '' : 's'}`))
  console.log()
}
