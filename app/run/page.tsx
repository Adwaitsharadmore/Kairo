"use client"

import { useState, useEffect } from "react"
import { Shield, ArrowLeft, Play, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { AgentConfig } from "@/lib/agent-adapter"

export default function RunBuilderPage() {
  const router = useRouter()
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null)
  const [attackPack, setAttackPack] = useState("prelim_safety_v1")
  const [trialsPerTest, setTrialsPerTest] = useState("3")
  const [runLabel, setRunLabel] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("agentConfig")
    if (stored) {
      setAgentConfig(JSON.parse(stored))
    } else {
      router.push("/connect")
    }
  }, [router])

  const handleStartRun = () => {
    if (!agentConfig) return

    const runConfig = {
      agentConfig,
      attackPackId: attackPack,
      trialsPerTest: Number.parseInt(trialsPerTest),
      runLabel: runLabel || `${agentConfig.name} Safety Check`,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem("runConfig", JSON.stringify(runConfig))
    router.push("/run/live")
  }

  if (!agentConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agent configuration...</p>
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
              <Link href="/connect">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Agent Safety Harness</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Configure Safety Tests</h1>
            <p className="text-muted-foreground">Set up your comprehensive agent safety evaluation</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Agent Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Connected Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{agentConfig.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge variant="secondary" className="ml-2">
                    {agentConfig.mode}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline" className="ml-2 text-success border-success">
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Run Configuration */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>Configure your safety evaluation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Attack Pack Selection */}
                <div className="space-y-2">
                  <Label htmlFor="attackPack">Attack Pack</Label>
                  <Select value={attackPack} onValueChange={setAttackPack}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prelim_safety_v1">Preliminary Safety Pack (30 tests)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive test suite covering prompt injection, tool abuse, harmful content, and over-refusal
                  </p>
                </div>

                {/* Trials per Test */}
                <div className="space-y-2">
                  <Label htmlFor="trials">Trials per Test</Label>
                  <Select value={trialsPerTest} onValueChange={setTrialsPerTest}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 trial</SelectItem>
                      <SelectItem value="3">3 trials (recommended)</SelectItem>
                      <SelectItem value="5">5 trials</SelectItem>
                      <SelectItem value="10">10 trials</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    More trials provide better statistical confidence but take longer to complete
                  </p>
                </div>

                {/* Run Label */}
                <div className="space-y-2">
                  <Label htmlFor="runLabel">Run Label (Optional)</Label>
                  <Input
                    id="runLabel"
                    placeholder={`${agentConfig.name} Safety Check`}
                    value={runLabel}
                    onChange={(e) => setRunLabel(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Descriptive label for this evaluation run</p>
                </div>

                {/* Test Categories Preview */}
                <div className="space-y-2">
                  <Label>Test Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Prompt Injection (10)</Badge>
                    <Badge variant="outline">RAG Canary (6)</Badge>
                    <Badge variant="outline">Tool Abuse (5)</Badge>
                    <Badge variant="outline">Harmful Content (5)</Badge>
                    <Badge variant="outline">Over-Refusal (4)</Badge>
                  </div>
                </div>

                <Button onClick={handleStartRun} className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Safety Evaluation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
