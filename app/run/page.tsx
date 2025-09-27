'use client'

import { useState } from 'react'
import { useRunJob } from './useRunJob'

export default function RunPage() {
  const { start, runId, status, results, completedTrials, totalTrials, reportUrl, artifactUrl, error } = useRunJob()

  // default payload for a demo run
  const [agentMode, setAgentMode] = useState<'local_stub'|'openai'|'anthropic'|'webhook'>('local_stub')
  const [label, setLabel] = useState('My demo run')

  const onStart = async () => {
    const payload = {
      agentConfig: { mode: agentMode, name: 'DemoAgent', demoMode: agentMode === 'local_stub' },
      attackPackId: 'prelim_safety_v1',
      trialsPerTest: 1,
      runLabel: label,
    }
    await start(payload)
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Agent Safety Harness — Run</h1>

      <section className="rounded-xl border p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm">Agent mode</label>
            <select
              value={agentMode}
              onChange={(e)=>setAgentMode(e.target.value as any)}
              className="border rounded px-2 py-1"
            >
              <option value="local_stub">local_stub (demo)</option>
              <option value="openai">openai</option>
              <option value="anthropic">anthropic</option>
              <option value="webhook">webhook</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Run label</label>
            <input className="border rounded px-2 py-1" value={label} onChange={(e)=>setLabel(e.target.value)} />
          </div>
          <button
            onClick={onStart}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={status==='running'}
          >
            {status==='running' ? 'Running…' : 'Start run'}
          </button>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {runId && (
          <div className="text-sm text-gray-600">
            <div>Run ID: <code>{runId}</code></div>
            <div>Status: <b>{status}</b></div>
            <div>Progress: {completedTrials}/{totalTrials}</div>
          </div>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Live results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Attack</th>
                <th className="py-2 pr-4">Trial</th>
                <th className="py-2 pr-4">Passed</th>
                <th className="py-2 pr-4">Evidence</th>
                <th className="py-2 pr-4">Duration (ms)</th>
              </tr>
            </thead>
            <tbody>
            {results.map((r, i) => (
              <tr key={`${r.attackId}-${r.trial}-${i}`} className="border-b last:border-0">
                <td className="py-2 pr-4">{r.attackId}</td>
                <td className="py-2 pr-4">{r.trial}</td>
                <td className="py-2 pr-4">
                  <span className={r.passed ? 'text-green-700' : 'text-red-700'}>
                    {r.passed ? 'PASS' : 'FAIL'}
                  </span>
                </td>
                <td className="py-2 pr-4">{r.evidence}</td>
                <td className="py-2 pr-4">{r.duration}</td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-gray-500">No results yet.</td></tr>
            )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Outputs</h2>
        <div className="flex gap-3">
          <a
            href={reportUrl ?? '#'}
            className={`px-3 py-2 rounded border ${reportUrl && status==='completed' ? 'bg-white' : 'pointer-events-none opacity-50'}`}
            target="_blank"
          >
            View Report (HTML)
          </a>
          <a
            href={artifactUrl ?? '#'}
            className={`px-3 py-2 rounded border ${artifactUrl && status==='completed' ? 'bg-white' : 'pointer-events-none opacity-50'}`}
            target="_blank"
          >
            Download Artifact (ZIP)
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-2">Links activate when the run is completed.</p>
      </section>
    </div>
  )
}
