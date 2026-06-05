import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { AnalysisSession } from '../types/autonomy.js'
import { v4 as uuidv4 } from './uuid.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SESSIONS_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.autonomy-mapper', 'sessions')

export function ensureSessionsDir(): void {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true })
  }
}

export function saveSession(session: AnalysisSession): string {
  ensureSessionsDir()
  const sessionPath = path.join(SESSIONS_DIR, `${session.id}.json`)
  fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2))
  return sessionPath
}

export function loadSession(id: string): AnalysisSession | null {
  try {
    const sessionPath = path.join(SESSIONS_DIR, `${id}.json`)
    if (!fs.existsSync(sessionPath)) return null
    const data = fs.readFileSync(sessionPath, 'utf-8')
    return JSON.parse(data) as AnalysisSession
  } catch {
    return null
  }
}

export function listSessions(): AnalysisSession[] {
  ensureSessionsDir()
  const files = fs.readdirSync(SESSIONS_DIR).filter((f) => f.endsWith('.json'))
  return files
    .map((f) => {
      try {
        const data = fs.readFileSync(path.join(SESSIONS_DIR, f), 'utf-8')
        return JSON.parse(data) as AnalysisSession
      } catch {
        return null
      }
    })
    .filter((s): s is AnalysisSession => s !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function deleteSession(id: string): boolean {
  try {
    const sessionPath = path.join(SESSIONS_DIR, `${id}.json`)
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath)
      return true
    }
    return false
  } catch {
    return false
  }
}

export function createNewSession(role: string, context?: string): AnalysisSession {
  const now = new Date().toISOString()
  return {
    id: uuidv4(),
    role,
    context: context ?? '',
    answers: {},
    capabilities: [],
    autonomyMap: [],
    autonomyTarget: 'L3',
    createdAt: now,
    updatedAt: now,
  }
}
