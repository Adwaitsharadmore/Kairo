'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRunJob } from './useRunJob'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // No longer needed
import { Badge } from "@/components/ui/badge"
import { Play, Shield, AlertTriangle, CheckCircle, XCircle, FileText, Download } from "lucide-react"

type AgentMode = 'webhook' // Only webhook mode supported
type AttackerMode = 'static' | 'agentdojo'

// type AttackPackSummary = { // No longer needed
//   id: string
//   name?: string
//   description?: string
//   tests?: number
// }

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
  const agentMode: AgentMode = 'webhook' // Fixed to webhook
  const [agentName, setAgentName] = useState('MyAgent')
  // Removed model and apiKey since we only use webhook mode
  const [webhookUrl, setWebhookUrl] = useState('')    // only for webhook
  const [label, setLabel] = useState('Untitled run')
  const [trialsPerTest, setTrialsPerTest] = useState<number>(1)
  const attackerMode: AttackerMode = 'agentdojo' // Fixed to AgentDojo Attacker

  // Fixed attack pack and attacker mode
  const attackPackId = 'dynamic_redteam_v1' // Advanced Security Testing Pack

  const agentConfig = useMemo(() => {
    return {
      mode: 'webhook',
      name: agentName,
      webhookUrl: webhookUrl || undefined
    }
  }, [agentName, webhookUrl])

  const canStart =
    trialsPerTest > 0 &&
    agentName.trim().length > 0 &&
    webhookUrl.trim().length > 0

  const onStart = async () => {
    const payload = {
      agentConfig,
      attackPackId,
      trialsPerTest,
      runLabel: label,
      attackerMode,
    }
    
    // Store run configuration in localStorage for report generation
    localStorage.setItem("runConfig", JSON.stringify(payload))
    
    await start(payload)
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated background with stars */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Star field background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-32 right-32 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-48 right-16 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-64 right-40 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-80 right-24 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        
        <div className="absolute bottom-32 left-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-48 left-32 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '2.2s'}}></div>
        <div className="absolute bottom-64 left-16 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute bottom-80 left-40 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-gray-300 bg-clip-text text-transparent">
            Kairo
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
            <a href="/demo" className="text-gray-300 hover:text-white transition-colors">Demo</a>
            <a href="/connect" className="text-gray-400 hover:text-white transition-colors">Connect</a>
          </nav>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl p-6 space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-blue-400 via-gray-300 to-blue-300 bg-clip-text text-transparent mb-4 leading-tighter">
            Agent Safety Harness
          </h1>
        
        </div>

        <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/60">
          <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" }} />
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="h-6 w-6 text-cyan-300" />
              Test Configuration
            </CardTitle>
            <CardDescription className="text-slate-300">
              Configure your webhook agent (using Advanced Security Testing Pack with AgentDojo Attacker)
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attack pack - Fixed to Advanced Security Testing Pack */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Attack pack</Label>
                <div className="bg-slate-800/50 border border-white/10 text-white px-3 py-2 rounded-md">
                  <span className="text-white">Advanced Security Testing Pack</span>
                </div>
              </div>

              {/* Trials */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Trials per test</Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={trialsPerTest}
                  onChange={(e) => setTrialsPerTest(parseInt(e.target.value || '1', 10))}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>

              {/* Attacker - Fixed to AgentDojo Attacker */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Attacker</Label>
                <div className="bg-slate-800/50 border border-white/10 text-white px-3 py-2 rounded-md">
                  <span className="text-white">AgentDojo Attacker</span>
                </div>
              </div>

              {/* Agent mode - Fixed to webhook */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Agent mode</Label>
                <div className="bg-slate-800/50 border border-white/10 text-white px-3 py-2 rounded-md">
                  <span className="text-white">Webhook</span>
                </div>
              </div>

              {/* Agent name */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Agent name</Label>
                <Input
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-400"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., BillingBot"
                />
              </div>

              {/* Webhook URL */}
              <div className="md:col-span-2 space-y-2">
                <Label className="text-white font-medium">Webhook URL</Label>
                <Input
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-400"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-server.com/chat"
                />
                <p className="text-xs text-slate-400">
                  Your webhook should accept POST {"{ prompt, tools, max_tokens }"} and return {"{ text, toolCalls, usage }"}.
                </p>
              </div>

              {/* Run label */}
              <div className="md:col-span-2 space-y-2">
                <Label className="text-white font-medium">Run label</Label>
                <Input
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-400"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., gemini-test"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                onClick={onStart}
                disabled={status === 'running' || !canStart}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 via-white/10 to-gray-300/20 backdrop-blur-md text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-400/30 hover:via-white/20 hover:to-gray-200/30 transition-all duration-300 border border-blue-400/30 hover:border-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" />
                {status === 'running' ? 'Running…' : 'Start Test'}
              </Button>
              {error && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {runId && (
              <div className="bg-slate-800/30 rounded-lg p-4 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Run ID:</span>
                    <code className="ml-2 text-cyan-300">{runId}</code>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <Badge variant="outline" className="ml-2 text-white border-white/20">
                      {status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-400">Progress:</span>
                    <span className="ml-2 text-white">{completedTrials}/{totalTrials}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/60">
          <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" }} />
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-cyan-300" />
              Live Attack Simulation
            </CardTitle>
            <CardDescription className="text-slate-300">
              Real-time monitoring of attack attempts and agent responses
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-6">
            {results.map((r, i) => (
              <Card key={`${r.attackId}-${r.trial}-${i}`} className="bg-slate-800/30 border-white/10">
                <CardContent className="p-6">
                  {/* Attack Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-white">{r.attackId}</span>
                      <Badge variant="outline" className="text-cyan-300 border-cyan-300/30">
                        Trial {r.trial}
                      </Badge>
                      <Badge variant={r.passed ? "default" : "destructive"} className={r.passed ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}>
                        {r.passed ? <><CheckCircle className="h-3 w-3 mr-1" />PASS</> : <><XCircle className="h-3 w-3 mr-1" />FAIL</>}
                      </Badge>
                    </div>
                    <span className="text-sm text-slate-400">{r.duration}ms</span>
                  </div>

                  {/* Attack Prompt */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                        🎯 AGENTDOJO ATTACK
                      </Badge>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="font-mono text-red-200 text-sm whitespace-pre-wrap">
                        {r.craftedPrompt ? `"${r.craftedPrompt.substring(0, 200)}${r.craftedPrompt.length > 200 ? '...' : ''}"` : 'No attack prompt captured'}
                      </div>
                    </div>
                  </div>

                  {/* Agent Response */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        🛡️ AGENT RESPONSE
                      </Badge>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="text-blue-200 text-sm">
                        {r.response?.text ? (
                          r.response.text.includes('[ERROR]') || r.response.text.includes('[TIMEOUT]') || r.response.text.includes('[NETWORK_ERROR]') || r.response.text.includes('[RAW_RESPONSE]') || r.response.text.includes('[RATE_LIMIT]') || r.response.text.includes('[WEBHOOK_ERROR]') ? (
                            <div className="text-red-300 font-mono text-xs">
                              {r.response.text}
                            </div>
                          ) : (
                            `"${r.response.text.substring(0, 300)}${r.response.text.length > 300 ? '...' : ''}"`
                          )
                        ) : (
                          <div className="text-yellow-300 italic">
                            No response captured
                          </div>
                        )}
                      </div>
                      {r.response?.toolCalls && r.response.toolCalls.length > 0 && (
                        <div className="mt-2 text-xs text-cyan-300">
                          <div className="font-medium">Tool calls made:</div>
                          {r.response.toolCalls.map((tc, idx) => (
                            <div key={idx} className="ml-2">
                              • {tc.name}({Object.keys(tc.arguments || {}).join(', ')})
                              {tc.result && (
                                <div className="ml-4 text-yellow-300">
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
                      <span className="font-medium text-white">Evidence: </span>
                      <span className="text-slate-300">{r.evidence}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      Confidence: <span className="text-cyan-300 font-medium">{(r.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {results.length === 0 && (
              <div className="text-center py-12">
                <div className="animate-pulse text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="ml-3">Waiting for attacks to begin...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 transition-all duration-300 hover:border-cyan-400/30 hover:bg-slate-900/60">
          <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(56,189,248,.15), rgba(139,92,246,.08) 40%, transparent 60%)" }} />
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="h-6 w-6 text-cyan-300" />
              Outputs
            </CardTitle>
            <CardDescription className="text-slate-300">
              Download reports and artifacts when testing is complete
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex gap-4">
              {reportUrl && status === 'completed' ? (
                <Button
                  asChild
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 via-white/10 to-gray-300/20 backdrop-blur-md text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-400/30 hover:via-white/20 hover:to-gray-200/30 transition-all duration-300 border border-blue-400/30 hover:border-blue-300/50"
                >
                  <a href={reportUrl} target="_blank">
                    <FileText className="h-4 w-4" />
                    View Report (HTML)
                  </a>
                </Button>
              ) : (
                <Button
                  disabled
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 via-white/10 to-gray-300/20 backdrop-blur-md text-white px-6 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed border border-blue-400/30"
                >
                  <FileText className="h-4 w-4" />
                  View Report (HTML)
                </Button>
              )}
              
              {artifactUrl && status === 'completed' ? (
                <Button
                  asChild
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 via-white/10 to-blue-300/20 backdrop-blur-md text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-400/30 hover:via-white/20 hover:to-blue-200/30 transition-all duration-300 border border-cyan-400/30 hover:border-cyan-300/50"
                >
                  <a href={artifactUrl} target="_blank">
                    <Download className="h-4 w-4" />
                    Download Artifact (ZIP)
                  </a>
                </Button>
              ) : (
                <Button
                  disabled
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 via-white/10 to-blue-300/20 backdrop-blur-md text-white px-6 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed border border-cyan-400/30"
                >
                  <Download className="h-4 w-4" />
                  Download Artifact (ZIP)
                </Button>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-4">
              Links activate when the run is completed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
