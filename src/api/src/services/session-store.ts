import { v4 as uuidv4 } from 'uuid'
import type { AnalysisSession, AutonomyLevel } from '../types/autonomy'

// In-memory session storage
const sessions: Map<string, AnalysisSession> = new Map()

export function createNewSession(role: string, context?: string): AnalysisSession {
  const session: AnalysisSession = {
    id: uuidv4(),
    role,
    context,
    answers: {},
    capabilities: [],
    autonomyMap: [],
    autonomyTarget: 'L3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return session
}

export function saveSession(session: AnalysisSession): void {
  session.updatedAt = new Date().toISOString()
  sessions.set(session.id, { ...session })
}

export function loadSession(sessionId: string): AnalysisSession | null {
  const session = sessions.get(sessionId)
  return session ? { ...session } : null
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId)
}

export function listSessions(): AnalysisSession[] {
  return Array.from(sessions.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function sessionExists(sessionId: string): boolean {
  return sessions.has(sessionId)
}
