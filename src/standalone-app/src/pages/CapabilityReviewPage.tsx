import { useState } from 'react'
import { useAnalysisStore } from '../store'
import type { Capability, CapabilityZone } from '../types/autonomy'

const ZONE_COLORS: Record<CapabilityZone, string> = {
  Core: 'bg-blue-100 text-blue-800',
  Contextual: 'bg-purple-100 text-purple-800',
  Shared: 'bg-teal-100 text-teal-800',
}

const FLAG_FIELDS: { key: keyof Capability; label: string; tooltip: string }[] = [
  { key: 'repetitive',   label: 'Repetitive',    tooltip: '+1 score — accelerates automation' },
  { key: 'dataRich',     label: 'Data-rich',      tooltip: '+0.5 score — enables ML' },
  { key: 'highJudgment', label: 'High Judgment',  tooltip: '-1 score — keeps human longer' },
  { key: 'highRisk',     label: 'High Risk',      tooltip: 'caps at SHARED' },
]

export default function CapabilityReviewPage() {
  const session     = useAnalysisStore((s) => s.session)
  const updateCap   = useAnalysisStore((s) => s.updateCapability)
  const removeCap   = useAnalysisStore((s) => s.removeCapability)
  const addCap      = useAnalysisStore((s) => s.addCapability)
  const runMapping  = useAnalysisStore((s) => s.runMapping)
  const setPhase    = useAnalysisStore((s) => s.setPhase)

  const [newName, setNewName] = useState('')
  const [newZone, setNewZone] = useState<CapabilityZone>('Core')

  const caps = session?.capabilities ?? []

  function toggleFlag(id: string, flag: keyof Capability) {
    const cap = caps.find((c) => c.id === id)
    if (!cap) return
    updateCap(id, { [flag]: !cap[flag] })
  }

  function addNew() {
    if (!newName.trim()) return
    addCap({ name: newName.trim(), zone: newZone })
    setNewName('')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Review Capabilities</h2>
      <p className="text-gray-500 text-sm mb-6">
        {caps.length} capabilities detected for <span className="font-semibold text-gray-700">{session?.role}</span>.
        Adjust flags to fine-tune scoring.
      </p>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-3 mb-5 flex flex-wrap gap-3 text-xs text-gray-600">
        {FLAG_FIELDS.map((f) => (
          <span key={f.key} title={f.tooltip} className="cursor-help">
            <span className="font-semibold text-brand">{f.label}</span> — {f.tooltip}
          </span>
        ))}
      </div>

      {caps.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No capabilities detected.</p>
          <p className="text-sm">Try adding them manually below, or go back and fill in more answers.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 w-1/3">Capability</th>
                <th className="text-left px-4 py-3">Zone</th>
                {FLAG_FIELDS.map((f) => (
                  <th key={f.key} className="px-3 py-3 text-center" title={f.tooltip}>{f.label}</th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {caps.map((cap) => (
                <tr key={cap.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{cap.name}</td>
                  <td className="px-4 py-3">
                    <select
                      value={cap.zone}
                      onChange={(e) => updateCap(cap.id, { zone: e.target.value as CapabilityZone })}
                      className={`text-xs px-2 py-1 rounded-full font-semibold border-0 focus:ring-1 focus:ring-brand ${ZONE_COLORS[cap.zone]}`}
                    >
                      <option value="Core">Core</option>
                      <option value="Contextual">Contextual</option>
                      <option value="Shared">Shared</option>
                    </select>
                  </td>
                  {FLAG_FIELDS.map((f) => (
                    <td key={f.key} className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(cap[f.key])}
                        onChange={() => toggleFlag(cap.id, f.key)}
                        className="w-4 h-4 accent-brand cursor-pointer"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => removeCap(cap.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                      title="Remove"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add capability */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNew()}
          placeholder="Add a capability…"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <select
          value={newZone}
          onChange={(e) => setNewZone(e.target.value as CapabilityZone)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="Core">Core</option>
          <option value="Contextual">Contextual</option>
          <option value="Shared">Shared</option>
        </select>
        <button
          onClick={addNew}
          disabled={!newName.trim()}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setPhase('questions')}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={runMapping}
          disabled={caps.length === 0}
          className="flex-1 bg-brand text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Map Autonomy Levels →
        </button>
      </div>
    </div>
  )
}
