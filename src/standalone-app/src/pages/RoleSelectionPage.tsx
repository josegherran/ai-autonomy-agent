import { useState } from 'react'
import { useAnalysisStore } from '../store'

const EXAMPLE_ROLES = [
  'Product Manager',
  'Software Engineer',
  'Data Analyst',
  'HR Business Partner',
  'Marketing Manager',
  'Sales Account Executive',
  'Finance Analyst',
  'UX Designer',
]

export default function RoleSelectionPage() {
  const setRole = useAnalysisStore((s) => s.setRole)
  const [role, setRoleInput] = useState('')
  const [context, setContext] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!role.trim()) return
    setRole(role.trim(), context.trim() || undefined)
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Define the Role</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Enter the job title you want to analyse. The AI will decompose its capabilities and map autonomy levels.
      </p>

      {/* Quick select */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick select</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleInput(r)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                role === r
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand hover:text-brand'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRoleInput(e.target.value)}
            placeholder="e.g. Senior Product Manager"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Context <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Industry, company size, team structure, key focus areas…"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!role.trim()}
          className="w-full bg-brand text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </form>
    </div>
  )
}
