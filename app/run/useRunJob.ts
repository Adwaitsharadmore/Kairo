'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type RunStatus = 'pending'|'running'|'completed'|'failed'
type RunResult = {
  attackId: string
  trial: number
  passed: boolean
  evidence: string
  duration: number
}

type RunProgress = {
  runId: string
  status: RunStatus
  progress?: {
    results: RunResult[]
    completedTrials: number
    totalTrials: number
    currentAttack?: string
    currentTrial?: number
  }
}

export function useRunJob() {
  const [runId, setRunId] = useState<string | null>(null)
  const [status, setStatus] = useState<RunStatus>('pending')
  const [results, setResults] = useState<RunResult[]>([])
  const [totalTrials, setTotalTrials] = useState<number>(0)
  const [completedTrials, setCompletedTrials] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const poller = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(async (payload: any) => {
    setError(null)
    setResults([])
    setCompletedTrials(0)
    setTotalTrials(0)
    setStatus('running')

    const resp = await fetch('/api/run', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload),
    })
    if (!resp.ok) {
      setStatus('failed')
      setError('Failed to start run')
      return
    }
    const { runId } = await resp.json()
    setRunId(runId)

    // start polling
    if (poller.current) clearInterval(poller.current)
    poller.current = setInterval(async () => {
      const s = await fetch(`/api/status/${runId}`)
      if (!s.ok) return
      const data: { status: RunStatus, progress?: any } = (await s.json())
      setStatus(data.status)
      const p = data.progress
      if (p) {
        setResults(p.results || [])
        setCompletedTrials(p.completedTrials || 0)
        setTotalTrials(p.totalTrials || 0)
      }
      if (data.status === 'completed' || data.status === 'failed') {
        if (poller.current) clearInterval(poller.current)
      }
    }, 1000)
  }, [])

  useEffect(() => {
    return () => { if (poller.current) clearInterval(poller.current) }
  }, [])

  return {
    runId, status, results, completedTrials, totalTrials, error,
    start,
    reportUrl: runId ? `/api/report/${runId}` : null,
    artifactUrl: runId ? `/api/artifact/${runId}` : null,
  }
}
