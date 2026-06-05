import { useAnalysisStore } from '../store'

export default function HomePage() {
  const setPhase = useAnalysisStore((s) => s.setPhase)
  const reset    = useAnalysisStore((s) => s.reset)

  function start() {
    reset()
    setPhase('role')
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-8">
      <div className="mb-6">
        <span className="text-5xl">🤖</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        AI Autonomy Mapper
      </h1>
      <p className="text-gray-500 text-base mb-8 leading-relaxed">
        Decompose any job role into its core capabilities and map AI autonomy levels
        across the 5-level progression — from static assistant to multi-agent environment.
      </p>

      <button
        onClick={start}
        className="bg-brand text-white px-8 py-3 rounded-xl font-semibold text-base hover:bg-brand-dark transition-colors shadow-md hover:shadow-lg"
      >
        Start Analysis →
      </button>

      <div className="mt-12 grid grid-cols-3 gap-4 text-left">
        {[
          { icon: '🎯', title: '10 Clarifying Questions', desc: 'Structured questions across 4 groups to understand the role deeply.' },
          { icon: '📊', title: 'Capability Heatmap', desc: 'Visual emoji heatmap showing AI exposure across L1–L5 autonomy levels.' },
          { icon: '📄', title: 'Markdown Export', desc: 'Download a full report ready to paste into your strategy docs.' },
        ].map((f) => (
          <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl mb-2">{f.icon}</div>
            <p className="text-sm font-semibold text-gray-800 mb-1">{f.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-10">
        Runs entirely in your browser — no data leaves your device.
        Based on the{' '}
        <a
          href="https://github.com/josegherran/ai-autonomy-agent"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-brand"
        >
          AI Autonomy Agent framework
        </a>.
      </p>
    </div>
  )
}
