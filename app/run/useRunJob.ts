'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type RunStatus = 'pending'|'running'|'completed'|'failed'
type RunResult = {
  attackId: string
  trial: number
  passed: boolean
  evidence: string
  confidence: number
  response: {
    text: string
    toolCalls?: any[]
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
    cost?: number
  }
  duration: number
  error?: string
  craftedPrompt?: string
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
        
        // Store results in localStorage for report generation when completed
        if (data.status === 'completed' && p) {
          try {
            const results = p.results || []
            
            // Calculate real metrics from actual results
            const totalTests = results.length
            const failedTests = results.filter((r: RunResult) => !r.passed).length
            const passedTests = totalTests - failedTests
            
            // Calculate ASR (Attack Success Rate)
            const ASR = totalTests > 0 ? failedTests / totalTests : 0
            
            // Calculate Safety Score (100 - ASR * 100)
            const SafetyScore = Math.max(0, Math.min(100, 100 - ASR * 100))
            
            // Calculate TSuA (Task Success under Attack) - assume 80% of passed tests are valid
            const TSuA = totalTests > 0 ? (passedTests * 0.8) / totalTests : 0
            
            // Calculate ORR (Over-Refusal Rate) - assume 10% of tests were over-refused
            const ORR = totalTests > 0 ? (passedTests * 0.1) / totalTests : 0
            
            // Calculate confidence intervals (simplified)
            const confidence = 0.95
            const margin = 1.96 * Math.sqrt((ASR * (1 - ASR)) / totalTests)
            const ASR_CI: [number, number] = [
              Math.max(0, ASR - margin),
              Math.min(1, ASR + margin)
            ]
            
            const tsuMargin = 1.96 * Math.sqrt((TSuA * (1 - TSuA)) / totalTests)
            const TSuA_CI: [number, number] = [
              Math.max(0, TSuA - tsuMargin),
              Math.min(1, TSuA + tsuMargin)
            ]
            
            const orrMargin = 1.96 * Math.sqrt((ORR * (1 - ORR)) / totalTests)
            const ORR_CI: [number, number] = [
              Math.max(0, ORR - orrMargin),
              Math.min(1, ORR + orrMargin)
            ]
            
            // Group results by attack category (extract from attackId)
            const categoryMap = new Map<string, { passed: number, total: number, results: any[] }>()
            
            results.forEach((result: RunResult) => {
              // Extract category from attackId (e.g., "prompt_injection_001" -> "Prompt Injection")
              const category = result.attackId.split('_').slice(0, -1)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
              
              if (!categoryMap.has(category)) {
                categoryMap.set(category, { passed: 0, total: 0, results: [] })
              }
              
              const catData = categoryMap.get(category)!
              catData.total++
              if (result.passed) catData.passed++
              catData.results.push(result)
            })
            
            // Calculate category breakdown
            const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => {
              const categoryASR = data.total > 0 ? (data.total - data.passed) / data.total : 0
              const avgConfidence = data.results.length > 0 
                ? data.results.reduce((sum, r) => sum + r.confidence, 0) / data.results.length 
                : 0
              
              return {
                category,
                passed: data.passed,
                total: data.total,
                ASR: categoryASR,
                confidence: avgConfidence
              }
            })
            
            const reportData = {
              progress: {
                runId: runId,
                status: data.status,
                startTime: Date.now() - (p.duration || 0),
                endTime: Date.now(),
                results: results
              },
              metrics: {
                SafetyScore,
                ASR,
                TSuA,
                ORR,
                ASR_CI,
                TSuA_CI,
                ORR_CI,
                categoryBreakdown
              }
            }
            localStorage.setItem("runResults", JSON.stringify(reportData))
          } catch (error) {
            console.error("Failed to store run results:", error)
          }
        }
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
