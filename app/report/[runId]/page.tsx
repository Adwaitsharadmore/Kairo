"use client"

import { useState, useEffect } from "react"
import { Shield, ArrowLeft, Download, AlertTriangle, TrendingUp, TrendingDown, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { RunProgress } from "@/lib/test-runner"
import type { SafetyMetrics } from "@/lib/scoring"
import {
  getSafetyScoreColor,
  getSafetyScoreLabel,
  formatPercentage,
  formatConfidenceInterval,
  assessRisk,
} from "@/lib/scoring"
import { generateHTMLReport, generateReproducibilityPackage } from "@/lib/report-generator"
import { createRunArtifact } from "@/lib/run-artifact"
import { getAttackPack } from "@/lib/attack-packs"

export default function ReportPage() {
  const params = useParams()
  const runId = params.runId as string
  const [runProgress, setRunProgress] = useState<RunProgress | null>(null)
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load results from localStorage (in a real app, this would be from an API)
    const resultsStr = localStorage.getItem("runResults")
    if (resultsStr) {
      const results = JSON.parse(resultsStr)
      setRunProgress(results.progress)
      setMetrics(results.metrics)
    }
    setLoading(false)
  }, [runId])

  const downloadHTMLReport = async () => {
    if (!metrics || !runProgress) return

    try {
      // Create run artifact
      const runConfigStr = localStorage.getItem("runConfig")
      if (!runConfigStr) return

      const runConfig = JSON.parse(runConfigStr)
      const attackPack = getAttackPack(runConfig.attackPackId)
      if (!attackPack) return

      const artifact = createRunArtifact(runProgress, metrics, runConfig.agentConfig, attackPack, {
        trialsPerTest: runConfig.trialsPerTest,
        runLabel: runConfig.runLabel,
      })

      // Generate HTML report
      const htmlReport = await generateHTMLReport(artifact)

      // Download as file
      const blob = new Blob([htmlReport], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `safety-report-${runProgress.runId}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating HTML report:", error)
      alert("Failed to generate HTML report")
    }
  }

  const downloadJSONReport = () => {
    if (!metrics || !runProgress) return

    const reportData = {
      runId: runProgress.runId,
      timestamp: new Date(runProgress.startTime).toISOString(),
      metrics,
      results: runProgress.results,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `safety-report-${runProgress.runId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadReproducibilityPackage = async () => {
    if (!metrics || !runProgress) return

    try {
      // Create run artifact
      const runConfigStr = localStorage.getItem("runConfig")
      if (!runConfigStr) return

      const runConfig = JSON.parse(runConfigStr)
      const attackPack = getAttackPack(runConfig.attackPackId)
      if (!attackPack) return

      const artifact = createRunArtifact(runProgress, metrics, runConfig.agentConfig, attackPack, {
        trialsPerTest: runConfig.trialsPerTest,
        runLabel: runConfig.runLabel,
      })

      // Generate reproducibility package
      const packageBlob = await generateReproducibilityPackage(artifact)

      // Download as file
      const url = URL.createObjectURL(packageBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reproducibility-${runProgress.runId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating reproducibility package:", error)
      alert("Failed to generate reproducibility package")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!runProgress || !metrics) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
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
              <CardTitle>Report Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">The requested safety report could not be found.</p>
              <Button asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const riskAssessment = assessRisk(metrics)
  const duration = (runProgress.endTime || Date.now()) - runProgress.startTime

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Agent Safety Harness</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={downloadHTMLReport}>
              <FileText className="h-4 w-4 mr-2" />
              HTML Report
            </Button>
            <Button variant="outline" onClick={downloadJSONReport}>
              <Download className="h-4 w-4 mr-2" />
              JSON Report
            </Button>
            <Button onClick={downloadReproducibilityPackage}>
              <Download className="h-4 w-4 mr-2" />
              Reproducibility Package
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Report Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Safety Evaluation Report</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Run ID: {runProgress.runId}</span>
              <span>•</span>
              <span>Completed: {new Date(runProgress.endTime!).toLocaleString()}</span>
              <span>•</span>
              <span>Duration: {Math.round(duration / 1000)}s</span>
            </div>
          </div>

          {/* Safety Score Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Overall Safety Score</CardTitle>
              <CardDescription>Composite score based on attack resistance and task completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getSafetyScoreColor(metrics.SafetyScore)}`}>
                    {metrics.SafetyScore}
                  </div>
                  <div className="text-lg text-muted-foreground">{getSafetyScoreLabel(metrics.SafetyScore)}</div>
                </div>
                <div className="flex-1 ml-8">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Attack Success Rate (ASR)</span>
                        <span className="text-sm font-mono">{formatPercentage(metrics.ASR)}</span>
                      </div>
                      <Progress value={metrics.ASR * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        95% CI: {formatConfidenceInterval(metrics.ASR_CI)}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Task Success under Attack (TSuA)</span>
                        <span className="text-sm font-mono">{formatPercentage(metrics.TSuA)}</span>
                      </div>
                      <Progress value={metrics.TSuA * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        95% CI: {formatConfidenceInterval(metrics.TSuA_CI)}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Over-Refusal Rate (ORR)</span>
                        <span className="text-sm font-mono">{formatPercentage(metrics.ORR)}</span>
                      </div>
                      <Progress value={metrics.ORR * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        95% CI: {formatConfidenceInterval(metrics.ORR_CI)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Performance across different attack categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.categoryBreakdown.map((category) => (
                    <div key={category.category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{category.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {category.passed}/{category.total}
                          </span>
                          {category.ASR > 0.3 ? (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-success" />
                          )}
                        </div>
                      </div>
                      <Progress value={(1 - category.ASR) * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        ASR: {formatPercentage(category.ASR)} (confidence: {category.confidence.toFixed(1)})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Security risk level and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge
                      variant={
                        riskAssessment.level === "critical"
                          ? "destructive"
                          : riskAssessment.level === "high"
                            ? "destructive"
                            : riskAssessment.level === "medium"
                              ? "secondary"
                              : "outline"
                      }
                      className="mb-2"
                    >
                      {riskAssessment.level.toUpperCase()} RISK
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Primary Concerns</h4>
                    <ul className="text-sm space-y-1">
                      {riskAssessment.primaryConcerns.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="text-sm space-y-1">
                      {riskAssessment.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Failed Tests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Failed Tests</CardTitle>
              <CardDescription>Detailed breakdown of security vulnerabilities found</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Evidence</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runProgress.results
                    .filter((result) => !result.passed)
                    .slice(0, 10) // Show top 10 failures
                    .map((result, index) => (
                      <TableRow key={`${result.attackId}-${result.trial}`}>
                        <TableCell className="font-mono text-sm">{result.attackId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Security Test</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-64 truncate" title={result.evidence}>
                          {result.evidence}
                        </TableCell>
                        <TableCell>{(result.confidence * 100).toFixed(0)}%</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Disclaimer:</strong> This evaluation is for testing purposes only and does not guarantee complete
              safety or security in production environments. Results should be interpreted by qualified security
              professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
