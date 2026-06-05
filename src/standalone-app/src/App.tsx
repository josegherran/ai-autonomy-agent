import { useAnalysisStore, type AppPhase } from './store'
import HomePage from './pages/HomePage'
import RoleSelectionPage from './pages/RoleSelectionPage'
import ClarifyingQuestionsPage from './pages/ClarifyingQuestionsPage'
import CapabilityReviewPage from './pages/CapabilityReviewPage'
import HeatmapPage from './pages/HeatmapPage'
import ResultsPage from './pages/ResultsPage'

const STEPS: { phase: AppPhase; label: string }[] = [
  { phase: 'role',         label: '1. Role' },
  { phase: 'questions',    label: '2. Questions' },
  { phase: 'capabilities', label: '3. Capabilities' },
  { phase: 'heatmap',      label: '4. Heatmap' },
  { phase: 'results',      label: '5. Results' },
]

const PHASE_ORDER: AppPhase[] = ['home', 'role', 'questions', 'capabilities', 'heatmap', 'results']

function phaseIndex(p: AppPhase): number {
  return PHASE_ORDER.indexOf(p)
}

export default function App() {
  const phase = useAnalysisStore((s) => s.phase)
  const reset = useAnalysisStore((s) => s.reset)

  const showStepper = phase !== 'home'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 font-bold text-gray-800 hover:text-brand transition-colors"
        >
          <span className="text-xl">🤖</span>
          <span className="hidden sm:inline">AI Autonomy Mapper</span>
        </button>

        {showStepper && (
          <nav className="flex items-center gap-1 ml-4 overflow-x-auto">
            {STEPS.map(({ phase: p, label }, i) => {
              const active = phase === p
              const done   = phaseIndex(phase) > phaseIndex(p)
              return (
                <div key={p} className="flex items-center gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-brand text-white font-semibold'
                        : done
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-400'
                    }`}
                  >
                    {done ? '✓ ' : ''}{label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className={`text-gray-300 text-xs ${done ? 'text-green-300' : ''}`}>›</span>
                  )}
                </div>
              )
            })}
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-8 sm:px-6 max-w-6xl mx-auto w-full">
        {phase === 'home'         && <HomePage />}
        {phase === 'role'         && <RoleSelectionPage />}
        {phase === 'questions'    && <ClarifyingQuestionsPage />}
        {phase === 'capabilities' && <CapabilityReviewPage />}
        {phase === 'heatmap'      && <HeatmapPage />}
        {phase === 'results'      && <ResultsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-400">
        AI Autonomy Mapper · MIT License ·{' '}
        <a href="https://github.com/josegherran/ai-autonomy-agent" target="_blank" rel="noreferrer" className="underline hover:text-brand">
          GitHub
        </a>
      </footer>
    </div>
  )
}
