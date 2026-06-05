import { useState } from 'react'
import { useAnalysisStore } from '../store'
import { CLARIFYING_QUESTIONS, getQuestionsByGroup } from '../data/clarifying-questions'

const GROUPS = ['capability_definition', 'ai_suitability', 'risk_governance', 'autonomy_target'] as const

export default function ClarifyingQuestionsPage() {
  const session = useAnalysisStore((s) => s.session)
  const setAnswer = useAnalysisStore((s) => s.setAnswer)
  const runDecomposition = useAnalysisStore((s) => s.runDecomposition)
  const setPhase = useAnalysisStore((s) => s.setPhase)

  const [activeGroup, setActiveGroup] = useState(0)

  const byGroup = getQuestionsByGroup()

  const allAnswered = CLARIFYING_QUESTIONS.every((q) => {
    const a = session?.answers[q.id] ?? ''
    // q9, q10 optional — but q1-q8 should have content
    if (['q9', 'q10'].includes(q.id)) return true
    return a.trim().length > 2
  })

  function next() {
    if (activeGroup < GROUPS.length - 1) setActiveGroup(activeGroup + 1)
    else runDecomposition()
  }

  const currentGroupKey = GROUPS[activeGroup]
  const questions = byGroup[currentGroupKey] ?? []

  const groupAnswered = questions.every((q) => {
    if (['q9', 'q10'].includes(q.id)) return true
    return (session?.answers[q.id] ?? '').trim().length > 2
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        {GROUPS.map((g, i) => (
          <div key={g} className="flex items-center gap-1">
            <button
              onClick={() => setActiveGroup(i)}
              className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                i === activeGroup
                  ? 'bg-brand text-white'
                  : i < activeGroup
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i < activeGroup ? '✓' : i + 1}
            </button>
            {i < GROUPS.length - 1 && <div className={`h-0.5 w-8 ${i < activeGroup ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        {questions[0]?.groupLabel ?? ''}
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Role: <span className="font-semibold text-gray-700">{session?.role}</span>
      </p>

      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {q.text}
              {!['q9', 'q10'].includes(q.id) && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={session?.answers[q.id] ?? ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              rows={3}
              placeholder={getPlaceholder(q.id)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={() => activeGroup === 0 ? setPhase('role') : setActiveGroup(activeGroup - 1)}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={next}
          disabled={!groupAnswered}
          className="flex-1 bg-brand text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {activeGroup < GROUPS.length - 1 ? 'Next Group →' : 'Decompose Capabilities →'}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        {CLARIFYING_QUESTIONS.filter((q) => (session?.answers[q.id] ?? '').trim().length > 2).length} / {CLARIFYING_QUESTIONS.length} questions answered
        {allAnswered && ' ✓'}
      </p>
    </div>
  )
}

function getPlaceholder(id: string): string {
  const map: Record<string, string> = {
    q1: 'e.g. sprint planning, backlog grooming, stakeholder updates, writing PRDs…',
    q2: 'e.g. go-to-market strategy, org design decisions, competitive analysis…',
    q3: 'e.g. design reviews, engineering syncs, sales enablement, customer calls…',
    q4: 'e.g. status reporting, data exports, meeting scheduling, ticket updates…',
    q5: 'e.g. product vision, roadmap prioritisation, hiring decisions…',
    q6: 'e.g. usage analytics rich; qualitative feedback sparse…',
    q7: 'e.g. regulatory sign-offs, P&L ownership, performance reviews…',
    q8: 'e.g. GDPR for user data, SOX for financial reporting, none…',
    q9: 'e.g. L3 — AI executes well-defined tasks, human oversees',
    q10: 'e.g. keep humans in-the-loop for budget commitments and user-facing copy',
  }
  return map[id] ?? ''
}
