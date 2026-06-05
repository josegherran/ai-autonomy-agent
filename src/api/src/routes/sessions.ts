import { Router, Request, Response, NextFunction } from 'express'
import { createNewSession, saveSession, loadSession, deleteSession, listSessions, sessionExists } from '../services/session-store'
import { decomposeCapabilities, mapAutonomyLevels } from '../services/autonomy-engine'
import { validateBody, createSessionSchema, analyzeSessionSchema, updateSessionSchema } from '../middleware/validation'
import { APIError } from '../middleware/errorHandler'
import type { AnalysisSession, AutonomyLevel } from '../types/autonomy'

const router = Router()

// GET /sessions — List all sessions
router.get('/', (req: Request, res: Response) => {
  const sessions = listSessions()
  res.json({
    data: sessions,
    total: sessions.length,
  })
})

// POST /sessions — Create new session
router.post('/', validateBody(createSessionSchema), (req: Request, res: Response) => {
  const { role, context } = (req as any).validatedData
  const session = createNewSession(role, context)
  saveSession(session)
  res.status(201).json({
    data: session,
    message: 'Session created',
  })
})

// GET /sessions/:id — Retrieve session
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = loadSession(req.params.id)
    if (!session) {
      throw new APIError(404, 'Session not found')
    }
    res.json({ data: session })
  } catch (err) {
    next(err)
  }
})

// DELETE /sessions/:id — Delete session
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = deleteSession(req.params.id)
    if (!deleted) {
      throw new APIError(404, 'Session not found')
    }
    res.json({ message: 'Session deleted', id: req.params.id })
  } catch (err) {
    next(err)
  }
})

// POST /sessions/:id/analyze — Full 6-phase analysis
router.post('/:id/analyze', validateBody(analyzeSessionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = loadSession(req.params.id)
    if (!session) {
      throw new APIError(404, 'Session not found')
    }

    const { answers } = (req as any).validatedData

    // Phase 2: Store answers
    session.answers = {
      ...session.answers,
      ...answers,
    }
    saveSession(session)

    // Phase 3: Decompose capabilities
    const capabilities = decomposeCapabilities(session.role, session.answers)
    session.capabilities = capabilities
    saveSession(session)

    // Phase 5 & 6: Autonomy target & mapping
    session.autonomyTarget = session.autonomyTarget || ('L3' as AutonomyLevel)
    const autonomyMap = mapAutonomyLevels(capabilities)
    session.autonomyMap = autonomyMap
    saveSession(session)

    res.json({
      data: session,
      message: 'Analysis complete',
    })
  } catch (err) {
    next(err)
  }
})

// PUT /sessions/:id — Update session (target level, capabilities, etc.)
router.put('/:id', validateBody(updateSessionSchema), (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = loadSession(req.params.id)
    if (!session) {
      throw new APIError(404, 'Session not found')
    }

    const { autonomyTarget, capabilities } = (req as any).validatedData

    if (autonomyTarget) {
      session.autonomyTarget = autonomyTarget as AutonomyLevel
    }

    if (capabilities) {
      session.capabilities = capabilities
      const autonomyMap = mapAutonomyLevels(capabilities)
      session.autonomyMap = autonomyMap
    }

    saveSession(session)

    res.json({
      data: session,
      message: 'Session updated',
    })
  } catch (err) {
    next(err)
  }
})

export default router
