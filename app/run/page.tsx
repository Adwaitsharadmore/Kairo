'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRunJob } from './useRunJob'

type AgentMode = 'local_stub' | 'openai' | 'anthropic' | 'webhook'
type AttackerMode = 'static' | 'agentdojo'

type AttackPackSummary = {
  id: string
  name?: string
  description?: string
  tests?: number
}

export default function RunPage() {
  const {
    start,
    runId,
    status,
    results,
    completedTrials,
    totalTrials,
    reportUrl,
    artifactUrl,
    error,
  } = useRunJob()

  // Configurable UI state (no hardcoded defaults except safe placeholders)
  const [agentMode, setAgentMode] = useState<AgentMode>('local_stub')
  const [agentName, setAgentName] = useState('MyAgent')
  const [model, setModel] = useState('')              // let users set per provider
  const [apiKey, setApiKey] = useState('')            // only for openai/anthropic
  const [webhookUrl, setWebhookUrl] = useState('')    // only for webhook
  const [label, setLabel] = useState('Untitled run')
  const [trialsPerTest, setTrialsPerTest] = useState<number>(1)
  const [attackerMode, setAttackerMode] = useState<AttackerMode>('static')

  // Attack packs (fetched)
  const [packs, setPacks] = useState<AttackPackSummary[]>([])
  const [attackPackId, setAttackPackId] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/attack-packs')
        const data = await res.json()
        if (!cancelled) {
          const list: AttackPackSummary[] = Array.isArray(data) ? data : data.packs || []
          setPacks(list)
          if (!attackPackId && list.length > 0) {
            setAttackPackId(list[0].id)
          }
        }
      } catch (e) {
        console.error('Failed to load attack packs', e)
      }
    })()
    return () => { cancelled = true }
  }, []) // load once

  const agentConfig = useMemo(() => {
    const base: any = {
      mode: agentMode,
      name: agentName,
      model: model || undefined,
    }
    if (agentMode === 'local_stub') {
      base.demoMode = true
    }
    if (agentMode === 'openai' || agentMode === 'anthropic') {
      base.apiKey = apiKey || undefined
    }
    if (agentMode === 'webhook') {
      base.webhookUrl = webhookUrl || undefined
    }
    return base
  }, [agentMode, agentName, model, apiKey, webhookUrl])

  const canStart =
    !!attackPackId &&
    trialsPerTest > 0 &&
    agentName.trim().length > 0 &&
    (agentMode !== 'webhook' || webhookUrl.trim().length > 0) &&
    ((agentMode !== 'openai' && agentMode !== 'anthropic') || apiKey.trim().length > 0)

  const onStart = async () => {
    const payload = {
      agentConfig,
      attackPackId,
      trialsPerTest,
      runLabel: label,
      attackerMode,
    }
    await start(payload)
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Agent Safety Harness — Run</h1>

      <section className="rounded-xl border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Attack pack */}
          <div>
            <label className="block text-sm mb-1">Attack pack</label>
            <select
              value={attackPackId}
              onChange={(e) => setAttackPackId(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.id} {p.tests ? `(${p.tests} tests)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Trials */}
          <div>
            <label className="block text-sm mb-1">Trials per test</label>
            <input
              type="number"
              min={1}
              step={1}
              value={trialsPerTest}
              onChange={(e) => setTrialsPerTest(parseInt(e.target.value || '1', 10))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          {/* Attacker mode */}
          <div>
            <label className="block text-sm mb-1">Attacker</label>
            <select
              value={attackerMode}
              onChange={(e) => setAttackerMode(e.target.value as AttackerMode)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="static">Static (templates)</option>
              <option value="agentdojo">AgentDojo attacker</option>
            </select>
          </div>

          {/* Agent mode */}
          <div>
            <label className="block text-sm mb-1">Agent mode</label>
            <select
              value={agentMode}
              onChange={(e) => setAgentMode(e.target.value as AgentMode)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="local_stub">local_stub (demo)</option>
              <option value="openai">openai</option>
              <option value="anthropic">anthropic</option>
              <option value="webhook">webhook</option>
            </select>
          </div>

          {/* Agent name */}
          <div>
            <label className="block text-sm mb-1">Agent name</label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g., BillingBot"
            />
          </div>

          {/* Model (optional, shown for all) */}
          <div>
            <label className="block text-sm mb-1">Model (optional)</label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={agentMode === 'openai'
                ? 'e.g., gpt-4o-mini'
                : agentMode === 'anthropic'
                ? 'e.g., claude-3-haiku-20240307'
                : agentMode === 'webhook'
                ? '(your server will decide)'
                : '(ignored in demo)'}
            />
          </div>

          {/* API Key field (conditional) */}
          {(agentMode === 'openai' || agentMode === 'anthropic') && (
            <div>
              <label className="block text-sm mb-1">{agentMode} API key</label>
              <input
                className="border rounded px-2 py-1 w-full"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Paste your ${agentMode} key`}
                type="password"
              />
            </div>
          )}

          {/* Webhook URL (conditional) */}
          {agentMode === 'webhook' && (
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Webhook URL</label>
              <input
                className="border rounded px-2 py-1 w-full"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="http://localhost:9001/chat"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your webhook should accept POST {"{ prompt, tools, max_tokens }"} and return {"{ text, toolCalls, usage }"}.
              </p>
            </div>
          )}

          {/* Run label */}
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Run label</label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., gemini-test"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStart}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={status === 'running' || !canStart}
            title={!canStart ? 'Fill the required fields' : 'Start run'}
          >
            {status === 'running' ? 'Running…' : 'Start run'}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        {runId && (
          <div className="text-sm text-gray-600 mt-2">
            <div>Run ID: <code>{runId}</code></div>
            <div>Status: <b>{status}</b></div>
            <div>Progress: {completedTrials}/{totalTrials}</div>
          </div>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Live Attack Simulation</h2>
        <div className="space-y-4">
          {results.map((r, i) => (
            <div key={`${r.attackId}-${r.trial}-${i}`} className="border rounded-lg p-4 bg-gray-50">
              {/* Attack Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{r.attackId}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">Trial {r.trial}</span>
                  <span className={`text-xs px-2 py-1 rounded ${r.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {r.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{r.duration}ms</span>
              </div>

              {/* Attack Prompt */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">🎯 AGENTDOJO ATTACK</span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                  <div className="font-mono text-red-800 whitespace-pre-wrap">
                    {r.craftedPrompt ? `"${r.craftedPrompt.substring(0, 200)}${r.craftedPrompt.length > 200 ? '...' : ''}"` : 'No attack prompt captured'}
                  </div>
                </div>
              </div>

              {/* Agent Response */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">🛡️ AGENT RESPONSE</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                  <div className="text-blue-800">
                    {r.response?.text ? `"${r.response.text.substring(0, 300)}${r.response.text.length > 300 ? '...' : ''}"` : 'No response captured'}
                  </div>
                </div>
              </div>

              {/* Attack Result */}
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Evidence: </span>
                  <span className="text-gray-700">{r.evidence}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Confidence: {(r.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-pulse">Waiting for attacks to begin...</div>
            </div>
          )}
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
