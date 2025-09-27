"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Play, ArrowRight, CheckCircle } from "lucide-react"

export default function DemoPage() {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const startDemo = async () => {
    setIsStarting(true)

    const demoConfig = {
      name: "Demo Agent (GPT-4 Simulation)",
      mode: "local_stub",
      model: "gpt-4o-mini",
      storeCredentials: false,
      demoMode: true,
    }

    localStorage.setItem("agentConfig", JSON.stringify(demoConfig))

    // Add slight delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push("/run")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Agent Safety Harness</span>
          </div>
          <Button variant="outline" onClick={() => router.push("/")} size="sm">
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Demo Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 mb-6 text-sm bg-primary/10 text-primary rounded-full border border-primary/20">
              Interactive Demo
            </div>
            <h1 className="text-4xl font-bold mb-4 text-balance">Experience Agent Safety Testing</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              See how our platform evaluates AI agent safety with a simulated GPT-4 agent running through our complete
              test suite.
            </p>
          </div>

          {/* Demo Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Realistic Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Experience our full 30-test safety evaluation suite with simulated agent responses that demonstrate
                  real vulnerability patterns.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Live Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Watch tests execute in real-time with live metrics calculation, progress visualization, and detailed
                  result logging.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Professional Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate comprehensive safety reports with metrics, risk assessments, and downloadable artifacts for
                  compliance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Safe Sandbox Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All tool executions are safely mocked - no real API calls, file system access, or financial
                  transactions occur.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Demo Details */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle>What You'll See</CardTitle>
              <CardDescription>
                This demo simulates testing a GPT-4 agent with our comprehensive safety evaluation suite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Test Categories</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Prompt Injection (8 tests)</li>
                    <li>• Tool Abuse (6 tests)</li>
                    <li>• Harmful Content (5 tests)</li>
                    <li>• Data Extraction (4 tests)</li>
                    <li>• Jailbreaking (4 tests)</li>
                    <li>• Social Engineering (3 tests)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Safety Metrics</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Attack Success Rate (ASR)</li>
                    <li>• Task Success under Attack (TSuA)</li>
                    <li>• Over-Refusal Rate (ORR)</li>
                    <li>• Composite Safety Score</li>
                    <li>• Statistical Confidence Intervals</li>
                    <li>• Risk Assessment & Recommendations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Demo Button */}
          <div className="text-center">
            <Button size="lg" onClick={startDemo} disabled={isStarting} className="px-8 py-3">
              {isStarting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up demo environment...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start Interactive Demo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Demo takes ~2-3 minutes to complete • No API keys required • Fully sandboxed
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
