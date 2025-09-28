// lib/types.ts
export type AttackerMode = 'static' | 'agentdojo'

export interface StartRunPayload {
  agentConfig: {
    mode: 'local_stub' | 'openai' | 'anthropic' | 'webhook' | 'gemini'
    name: string
    model?: string
    apiKey?: string
    webhookUrl?: string
    demoMode?: boolean
  }
  attackPackId: string
  trialsPerTest: number
  runLabel?: string
  attackerMode?: AttackerMode // NEW (default 'static')
}
