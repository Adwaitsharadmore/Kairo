"use client"

import type React from "react"

import { useState } from "react"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ConnectPage() {
  const router = useRouter()
  const [agentName, setAgentName] = useState("")
  const [mode, setMode] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [storeCredentials, setStoreCredentials] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store agent config and redirect to run builder
    const agentConfig = {
      name: agentName,
      mode: demoMode ? "local_stub" : mode,
      ...(mode === "openai" && { apiKey }),
      ...(mode === "anthropic" && { apiKey }),
      ...(mode === "webhook" && { webhookUrl }),
      storeCredentials,
    }

    localStorage.setItem("agentConfig", JSON.stringify(agentConfig))
    router.push("/run")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Connect Your Agent</h1>
            <p className="text-muted-foreground">Configure your AI agent for comprehensive safety testing</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>Provide your agent details to begin safety evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Demo Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Demo Mode</Label>
                    <p className="text-sm text-muted-foreground">Use simulated agent for testing without API keys</p>
                  </div>
                  <Switch checked={demoMode} onCheckedChange={setDemoMode} />
                </div>

                {/* Agent Name */}
                <div className="space-y-2">
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    placeholder="My AI Agent"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    required
                  />
                </div>

                {!demoMode && (
                  <>
                    {/* Mode Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="mode">Agent Type</Label>
                      <Select value={mode} onValueChange={setMode} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="webhook">Webhook</SelectItem>
                          <SelectItem value="local_stub">Local Stub</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Credentials */}
                    {(mode === "openai" || mode === "anthropic") && (
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          placeholder="sk-..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {mode === "webhook" && (
                      <div className="space-y-2">
                        <Label htmlFor="webhookUrl">Webhook URL</Label>
                        <Input
                          id="webhookUrl"
                          type="url"
                          placeholder="https://api.example.com/agent"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {/* Store Credentials */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="storeCredentials"
                        checked={storeCredentials}
                        onCheckedChange={setStoreCredentials}
                      />
                      <Label htmlFor="storeCredentials" className="text-sm">
                        Store credentials securely (encrypted at rest)
                      </Label>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full" size="lg">
                  Continue to Safety Tests
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
