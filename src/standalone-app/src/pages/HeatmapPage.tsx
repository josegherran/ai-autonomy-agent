import { useAnalysisStore } from '../store'
import type { AutonomyLevel, ExposureScore } from '../types/autonomy'
import {
  AUTONOMY_LEVELS,
  EXPOSURE_BG,
  EXPOSURE_EMOJI,
  EXPOSURE_LABEL,
  LEVEL_LABELS,
} from '../types/autonomy'

const ZONE_DOT: Record<string, string> = {
  Core: 'bg-blue-500',
  Contextual: 'bg-purple-500',
  Shared: 'bg-teal-500',
}

export default function HeatmapPage() {
  const session = useAnalysisStore((s) => s.session)
  const setPhase = useAnalysisStore((s) => s.setPhase)
  const setTarget = useAnalysisStore((s) => s.setAutonomyTarget)

  const map = session?.autonomyMap ?? []
  const target = session?.autonomyTarget ?? 'L3'

  if (map.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>No mapping data. Please go back and complete the analysis.</p>
        <button onClick={() => setPhase('capabilities')} className="mt-4 text-brand underline text-sm">
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Autonomy Heatmap</h2>
      <p className="text-gray-500 text-sm mb-6">
        Role: <span className="font-semibold text-gray-700">{session?.role}</span> — {map.length} capabilities mapped
      </p>

      {/* Target level selector */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-blue-800 mb-2">Select your organisation's target autonomy level:</p>
        <div className="flex flex-wrap gap-2">
          {AUTONOMY_LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setTarget(l)}
              title={LEVEL_LABELS[l]}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                l === target
                  ? 'bg-brand text-white border-brand shadow-md'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand hover:text-brand'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="text-xs text-blue-700 mt-2">{LEVEL_LABELS[target]}</p>
      </div>

      {/* Heatmap table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide w-1/4">Capability</th>
              <th className="px-3 py-3 text-xs text-gray-500 uppercase tracking-wide text-center">Zone</th>
              {AUTONOMY_LEVELS.map((l) => (
                <th
                  key={l}
                  className={`px-3 py-3 text-xs uppercase tracking-wide text-center ${
                    l === target ? 'bg-brand/10 text-brand font-bold' : 'text-gray-500 font-normal'
                  }`}
                >
                  {l}
                  {l === target && <span className="block text-xs normal-case font-normal text-brand/70">← target</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {map.map(({ capability: cap, scores }) => (
              <tr key={cap.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${ZONE_DOT[cap.zone] ?? 'bg-gray-400'}`} />
                    {cap.name}
                  </div>
                  {cap.notes && <p className="text-xs text-gray-400 mt-0.5">{cap.notes}</p>}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-xs font-semibold text-gray-500">{cap.zone}</span>
                </td>
                {AUTONOMY_LEVELS.map((l) => {
                  const score: ExposureScore = scores[l as AutonomyLevel]
                  return (
                    <td
                      key={l}
                      className={`px-3 py-3 text-center ${l === target ? 'bg-brand/5' : ''}`}
                      title={EXPOSURE_LABEL[score]}
                    >
                      <span className={`inline-block text-lg leading-none rounded px-1 ${EXPOSURE_BG[score]}`}>
                        {EXPOSURE_EMOJI[score]}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-8">
        {(Object.entries(EXPOSURE_EMOJI) as [ExposureScore, string][]).map(([k, emoji]) => (
          <div key={k} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${EXPOSURE_BG[k]}`}>
            <span>{emoji}</span>
            <span>{EXPOSURE_LABEL[k]}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setPhase('capabilities')}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={() => setPhase('results')}
          className="flex-1 bg-brand text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-dark transition-colors"
        >
          View Full Report →
        </button>
      </div>
    </div>
  )
}
