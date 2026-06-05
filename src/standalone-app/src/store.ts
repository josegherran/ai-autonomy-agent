import { create } from 'zustand'
import { v4 as uuidv4 } from './utils/uuid'
import type { AnalysisSession, AutonomyLevel, AutonomyMapping, Capability } from './types/autonomy'
import { decomposeCapabilities, mapAutonomyLevels } from './engine/autonomy-engine'

export type AppPhase =
  | 'home'
  | 'role'
  | 'questions'
  | 'capabilities'
  | 'heatmap'
  | 'results'

interface AnalysisStore {
  phase: AppPhase
  session: AnalysisSession | null

  // Navigation
  setPhase: (p: AppPhase) => void
  reset: () => void

  // Phase 1
  setRole: (role: string, context?: string) => void

  // Phase 2
  setAnswer: (questionId: string, answer: string) => void
  runDecomposition: () => void

  // Phase 3
  updateCapability: (id: string, changes: Partial<Capability>) => void
  removeCapability: (id: string) => void
  addCapability: (cap: Omit<Capability, 'id'>) => void
  runMapping: () => void

  // Phase 4-5 / target
  setAutonomyTarget: (level: AutonomyLevel) => void
}

function emptySession(): AnalysisSession {
  return {
    id: uuidv4(),
    role: '',
    context: '',
    answers: {},
    capabilities: [],
    autonomyMap: [],
    autonomyTarget: 'L3',
    createdAt: new Date().toISOString(),
  }
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  phase: 'home',
  session: null,

  setPhase: (p) => set({ phase: p }),

  reset: () => set({ phase: 'home', session: null }),

  setRole: (role, context) => {
    const session = get().session ?? emptySession()
    set({ session: { ...session, role, context: context ?? '' }, phase: 'questions' })
  },

  setAnswer: (questionId, answer) => {
    const session = get().session ?? emptySession()
    set({ session: { ...session, answers: { ...session.answers, [questionId]: answer } } })
  },

  runDecomposition: () => {
    const session = get().session
    if (!session) return
    const capabilities = decomposeCapabilities(session.role, session.answers)
    set({ session: { ...session, capabilities, autonomyMap: [] }, phase: 'capabilities' })
  },

  updateCapability: (id, changes) => {
    const session = get().session
    if (!session) return
    const capabilities = session.capabilities.map((c) =>
      c.id === id ? { ...c, ...changes } : c
    )
    set({ session: { ...session, capabilities } })
  },

  removeCapability: (id) => {
    const session = get().session
    if (!session) return
    set({ session: { ...session, capabilities: session.capabilities.filter((c) => c.id !== id) } })
  },

  addCapability: (cap) => {
    const session = get().session
    if (!session) return
    const newCap: Capability = { id: `cap-${Date.now()}`, ...cap }
    set({ session: { ...session, capabilities: [...session.capabilities, newCap] } })
  },

  runMapping: () => {
    const session = get().session
    if (!session) return
    const autonomyMap: AutonomyMapping[] = mapAutonomyLevels(session.capabilities)
    set({ session: { ...session, autonomyMap }, phase: 'heatmap' })
  },

  setAutonomyTarget: (level) => {
    const session = get().session
    if (!session) return
    set({ session: { ...session, autonomyTarget: level } })
  },
}))
