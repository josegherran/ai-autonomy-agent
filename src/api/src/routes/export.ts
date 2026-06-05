import { Router, Request, Response, NextFunction } from 'express'
import { loadSession } from '../services/session-store'
import { validateBody, exportSessionSchema } from '../middleware/validation'
import { APIError } from '../middleware/errorHandler'
import type { AnalysisSession, AutonomyLevel } from '../types/autonomy'
import { AUTONOMY_LEVELS, EXPOSURE_EMOJI, EXPOSURE_LABEL, LEVEL_LABELS } from '../types/autonomy'

const router = Router({ mergeParams: true })

function exportMarkdown(session: AnalysisSession): string {
  const lines: string[] = []
  const map = session.autonomyMap

  lines.push(`# AI Autonomy Mapping Report: ${session.role}`)
  lines.push('')
  lines.push(`**Target Autonomy Level:** ${session.autonomyTarget} — ${LEVEL_LABELS[session.autonomyTarget]}`)
  lines.push(`**Created:** ${new Date(session.createdAt).toLocaleString()}`)
  if (session.context) lines.push(`**Context:** ${session.context}`)
  lines.push('')

  // Heatmap table
  lines.push('## Heatmap')
  lines.push('')
  lines.push('| Capability | Zone | L1 | L2 | L3 | L4 | L5 |')
  lines.push('|---|---|---|---|---|---|---|')

  for (const mapping of map) {
    const zone = mapping.capability.zone
    const cells = AUTONOMY_LEVELS.map((level) => {
      const score = mapping.scores[level]
      return `${EXPOSURE_EMOJI[score]} ${score.replace(/_/g, ' ')}`
    })
    lines.push(`| ${mapping.capability.name} | ${zone} | ${cells.join(' | ')} |`)
  }

  lines.push('')
  lines.push('## Legend')
  lines.push('')
  const exposureTypes: Array<keyof typeof EXPOSURE_EMOJI> = ['HUMAN', 'MOSTLY_HUMAN', 'SHARED', 'MOSTLY_AI', 'AI']
  for (const exposure of exposureTypes) {
    lines.push(`- ${EXPOSURE_EMOJI[exposure]} ${EXPOSURE_LABEL[exposure]}`)
  }

  lines.push('')
  lines.push('## Capabilities')
  lines.push('')
  for (const mapping of map) {
    const cap = mapping.capability
    lines.push(`### ${cap.name}`)
    lines.push(`- **Zone:** ${cap.zone}`)
    lines.push(`- **Flags:** ${Object.entries(cap.flags).filter(([, v]) => v).map(([k]) => k).join(', ') || 'None'}`)
    if (cap.notes) lines.push(`- **Notes:** ${cap.notes}`)
    lines.push('')
  }

  return lines.join('\n')
}

function exportCSV(session: AnalysisSession): string {
  const lines: string[] = []
  const map = session.autonomyMap

  // Header
  lines.push(['Capability', 'Zone', ...AUTONOMY_LEVELS].join(','))

  // Rows
  for (const mapping of map) {
    const row = [
      `"${mapping.capability.name}"`,
      mapping.capability.zone,
      ...AUTONOMY_LEVELS.map((level) => `"${mapping.scores[level]}"`),
    ]
    lines.push(row.join(','))
  }

  return lines.join('\n')
}

// POST /sessions/:id/export — Export session
router.post('/', validateBody(exportSessionSchema), (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = loadSession(req.params.id)
    if (!session) {
      throw new APIError(404, 'Session not found')
    }

    const { format } = (req as any).validatedData

    let content: string
    let contentType: string

    if (format === 'csv') {
      content = exportCSV(session)
      contentType = 'text/csv'
    } else if (format === 'json') {
      content = JSON.stringify(session, null, 2)
      contentType = 'application/json'
    } else {
      content = exportMarkdown(session)
      contentType = 'text/markdown'
    }

    const filename = `autonomy-${session.role.toLowerCase().replace(/\s+/g, '-')}-${session.autonomyTarget}`

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.${format === 'csv' ? 'csv' : format === 'json' ? 'json' : 'md'}"`)
    res.send(content)
  } catch (err) {
    next(err)
  }
})

export default router
