"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { RunProgress, TestResult } from "@/lib/test-runner"
import type { SafetyMetrics } from "@/lib/scoring"
import { SafetyTestRunner, generateRunId } from "@/lib/test-runner"
import { createAgentAdapter } from "@/lib/agent-adapter"
import { getAttackPack } from "@/lib/attack-packs"
import { SafetyScorer, getSafetyScoreColor, formatPercentage } from "@/lib/scoring"

export default function LiveRunPage() {
  const router = useRouter()
  const [runProgress, setRunProgress] = useState<RunProgress | null>(null)
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null)
  const [runner, setRunner] = useState<SafetyTestRunner | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeRun = useCallback(async () => {
    try {
      const runConfigStr = localStorage.getItem("runConfig")
      if (!runConfigStr) {
        router.push("/run")
        return
      }

      const runConfig = JSON.parse(runConfigStr)
      const attackPack = getAttackPack(runConfig.attackPackId)
      if (!attackPack) {
        throw new Error("Attack pack not found")
      }

      const adapter = createAgentAdapter(runConfig.agentConfig, 42)
      const runId = generateRunId()

      const testRunner = new SafetyTestRunner(adapter, attackPack, runConfig.trialsPerTest, runId, (progress) => {
        setRunProgress({ ...progress })

        // Calculate metrics in real-time
        if (progress.results.length > 0) {
          const scorer = new SafetyScorer(progress.results, attackPack.attacks)
          const currentMetrics = scorer.calculateMetrics()
          setMetrics(currentMetrics)
        }
      })

      setRunner(testRunner)
      setIsRunning(true)

      // Start the run
      const finalProgress = await testRunner.run()
      setRunProgress(finalProgress)
      setIsRunning(false)

      // Calculate final metrics
      const scorer = new SafetyScorer(finalProgress.results, attackPack.attacks)
      const finalMetrics = scorer.calculateMetrics()
      setMetrics(finalMetrics)

      // Store results for report generation
      localStorage.setItem("runResults", JSON.stringify({ progress: finalProgress, metrics: finalMetrics }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setIsRunning(false)
    }
  }, [router])

  useEffect(() => {
    initializeRun()
  }, [initializeRun])

  const getStatusIcon = (result: TestResult) => {
    if (result.error) return <XCircle className="h-4 w-4 text-destructive" />
    if (result.passed) return <CheckCircle className="h-4 w-4 text-success" />
    return <AlertTriangle className="h-4 w-4 text-destructive" />
  }

  const getStatusBadge = (result: TestResult) => {
    if (result.error) return <Badge variant="destructive">ERROR</Badge>
    if (result.passed)
      return (
        <Badge variant="outline" className="text-success border-success">
          PASS
        </Badge>
      )
    return <Badge variant="destructive">FAIL</Badge>
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "prompt_injection":
        return "bg-chart-1/20 text-chart-1"
      case "rag_canary":
        return "bg-chart-2/20 text-chart-2"
      case "tool_abuse":
        return "bg-chart-3/20 text-chart-3"
      case "harmful_content":
        return "bg-chart-4/20 text-chart-4"
      case "over_refusal":
        return "bg-chart-5/20 text-chart-5"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const progressPercentage = runProgress ? Math.round((runProgress.completedTrials / runProgress.totalTrials) * 100) : 0

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/run">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Agent Safety Harness</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Run Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild>
                <Link href="/run">Try Again</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/run">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Agent Safety Harness</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isRunning && runProgress?.status === "completed" && (
              <Button asChild>
                <Link href={`/report/${runProgress.runId}`}>View Report</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Status Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Safety Evaluation in Progress</h1>
                <p className="text-muted-foreground">
                  {runProgress ? `Run ID: ${runProgress.runId}` : "Initializing..."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-primary">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Running</span>
                  </div>
                ) : runProgress?.status === "completed" ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span>Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Initializing</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {runProgress
                    ? `${runProgress.completedTrials} of ${runProgress.totalTrials} tests completed`
                    : "Preparing tests..."}
                </span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {runProgress?.currentAttack && (
              <p className="text-sm text-muted-foreground mt-2">
                Current: {runProgress.currentAttack} (Trial {runProgress.currentTrial})
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Metrics */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Live Metrics</CardTitle>
                  <CardDescription>Real-time safety evaluation results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics ? (
                    <>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getSafetyScoreColor(metrics.SafetyScore)}`}>
                          {metrics.SafetyScore}
                        </div>
                        <div className="text-sm text-muted-foreground">Safety Score</div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Attack Success Rate</span>
                          <span className="text-sm font-mono">{formatPercentage(metrics.ASR)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Task Success under Attack</span>
                          <span className="text-sm font-mono">{formatPercentage(metrics.TSuA)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Over-Refusal Rate</span>
                          <span className="text-sm font-mono">{formatPercentage(metrics.ORR)}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Tests Passed</span>
                          <span className="text-success">{metrics.passedTests}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tests Failed</span>
                          <span className="text-destructive">{metrics.failedTests}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Calculating metrics...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Live Results Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-red-500">🎯</span>
                    Live Attack Simulation
                  </CardTitle>
                  <CardDescription>Real-time AgentDojo attacks vs your agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {runProgress?.results.map((result, index) => (
                      <div key={`${result.attackId}-${result.trial}`} className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                        {/* Attack Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm font-mono">{result.attackId}</span>
                            <Badge variant="outline" className="text-xs">
                              Trial {result.trial}
                            </Badge>
                            <Badge
                              variant={result.passed ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {result.passed ? "PASS" : "FAIL"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDuration(result.duration)}
                          </div>
                        </div>

                        {/* Attack Prompt */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                              🎯 AGENTDOJO ATTACK
                            </span>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                            <div className="font-mono text-red-800 whitespace-pre-wrap">
                              {result.craftedPrompt ? 
                                `"${result.craftedPrompt.substring(0, 250)}${result.craftedPrompt.length > 250 ? '...' : ''}"` : 
                                'No attack prompt captured'
                              }
                            </div>
                          </div>
                        </div>

                        {/* Agent Response */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                              🛡️ AGENT RESPONSE
                            </span>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                            <div className="text-blue-800">
                              {result.response?.text ? (
                                result.response.text.includes('[ERROR]') || result.response.text.includes('[TIMEOUT]') || result.response.text.includes('[NETWORK_ERROR]') || result.response.text.includes('[RAW_RESPONSE]') || result.response.text.includes('[RATE_LIMIT]') || result.response.text.includes('[WEBHOOK_ERROR]') ? (
                                  <div className="text-red-600 font-mono text-xs">
                                    {result.response.text}
                                  </div>
                                ) : (
                                  `"${result.response.text.substring(0, 300)}${result.response.text.length > 300 ? '...' : ''}"`
                                )
                              ) : (
                                <div className="text-yellow-600 italic">
                                  No response captured
                                </div>
                              )}
                            </div>
                            {result.response?.toolCalls && result.response.toolCalls.length > 0 && (
                              <div className="mt-2 text-xs text-cyan-600">
                                <div className="font-medium">Tool calls made:</div>
                                {result.response.toolCalls.map((tc, idx) => (
                                  <div key={idx} className="ml-2">
                                    • {tc.name}({Object.keys(tc.arguments || {}).join(', ')})
                                    {tc.result && (
                                      <div className="ml-4 text-yellow-600">
                                        Result: {String(tc.result).substring(0, 100)}
                                        {String(tc.result).length > 100 ? '...' : ''}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Attack Result */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium">Evidence: </span>
                            <span className="text-muted-foreground">{result.evidence}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {(result.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="animate-pulse text-lg mb-2">🛡️</div>
                        <div>Waiting for AgentDojo attacks to begin...</div>
                        <div className="text-sm mt-1">Your agent will be tested against sophisticated red team prompts</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
