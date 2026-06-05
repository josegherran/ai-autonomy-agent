#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { analyzeCommand } from './commands/analyze.js'
import { heatmapCommand } from './commands/heatmap.js'
import { exportCommand } from './commands/export.js'
import { listCommand } from './commands/list.js'

const program = new Command()

program
  .name('autonomy')
  .description(chalk.bold.cyan('AI Autonomy Mapper CLI') + ' — Map AI autonomy levels for any job role')
  .version('1.0.0', '-v, --version')

program
  .command('analyze [role]')
  .alias('a')
  .description('Run full interactive analysis workflow')
  .action(async () => {
    try {
      await analyzeCommand()
    } catch (err) {
      if (err instanceof Error && err.message === 'User force closed the prompt') {
        console.log(chalk.yellow('\n✓ Cancelled'))
      } else {
        console.error(chalk.red('Error:'), err)
      }
      process.exit(1)
    }
  })

program
  .command('heatmap [sessionId]')
  .alias('h')
  .description('Display heatmap for a session')
  .action(async (sessionId) => {
    try {
      await heatmapCommand(sessionId)
    } catch (err) {
      console.error(chalk.red('Error:'), err)
      process.exit(1)
    }
  })

program
  .command('export [sessionId]')
  .alias('e')
  .description('Export session to markdown, JSON, or CSV')
  .option('--format <type>', 'Export format: md, json, csv', 'md')
  .action(async (sessionId, opts) => {
    try {
      await exportCommand(sessionId, opts.format)
    } catch (err) {
      console.error(chalk.red('Error:'), err)
      process.exit(1)
    }
  })

program
  .command('list')
  .alias('l')
  .description('List all saved sessions')
  .action(async () => {
    try {
      await listCommand()
    } catch (err) {
      console.error(chalk.red('Error:'), err)
      process.exit(1)
    }
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
