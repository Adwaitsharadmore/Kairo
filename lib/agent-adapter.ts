// Agent adapter interface and implementations
import type { AgentAdapter } from "./agent-adapter" // Import AgentAdapter to fix undeclared variable error

export interface AgentConfig {
  name: string
  mode: "openai" | "anthropic" | "webhook" | "local_stub"
  apiKey?: string
  webhookUrl?: string
  model?: string
  storeCredentials?: boolean
  demoMode?: boolean // Added for demo mode support
}

export interface AgentResponse {
  text: string
  toolCalls?: ToolCall[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost?: number
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, any>
  result?: any
}

export interface Tool {
  name: string
  description: string
  parameters: Record<string, any>
}

// Mock tools for safe testing
export const MOCK_TOOLS: Tool[] = [
  {
    name: "fs_read",
    description: "Read file contents (mocked for safety)",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path to read" },
      },
      required: ["path"],
    },
  },
  {
    name: "payments_refund",
    description: "Process payment refund (mocked for safety)",
    parameters: {
      type: "object",
      properties: {
        transactionId: { type: "string", description: "Transaction ID to refund" },
        amount: { type: "number", description: "Refund amount" },
      },
      required: ["transactionId", "amount"],
    },
  },
  {
    name: "browser_fetch",
    description: "Fetch web content (mocked for safety)",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to fetch" },
      },
      required: ["url"],
    },
  },
]

// Local stub adapter for demo mode
export class LocalStubAdapter implements AgentAdapter {
  private config: AgentConfig
  private seed: number

  constructor(config: AgentConfig, seed = 42) {
    this.config = config
    this.seed = seed
  }

  async validateConfig(): Promise<boolean> {
    return true
  }

  async call(prompt: string, tools?: Tool[]): Promise<AgentResponse> {
    // Import demo scenarios dynamically to avoid circular dependencies
    const { getDemoScenario, getDemoResponseForScenario } = await import("./demo-scenarios")

    // Simulate processing delay for realism
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

    // Check if this is a demo mode test by looking for test patterns in the prompt
    const testMatch = prompt.match(/Test: (.+?)(?:\n|$)/)
    let response = ""
    const toolCalls: ToolCall[] = []

    if (testMatch && this.config.demoMode) {
      const testName = testMatch[1]
      const scenario = getDemoScenario(testName)

      if (scenario) {
        response = getDemoResponseForScenario(scenario, prompt)

        // Add tool calls for vulnerable scenarios that specify tool usage
        if (scenario.toolUsage && scenario.responsePattern === "vulnerable" && tools && tools.length > 0) {
          const hash = this.simpleHash(prompt + this.seed)
          const tool = tools[hash % tools.length]
          toolCalls.push({
            id: `call_${hash}`,
            name: tool.name,
            arguments: this.generateMockArguments(tool),
            result: this.generateMockResult(tool.name),
          })
        }
      } else {
        // Fallback to original behavior
        response = this.generateFallbackResponse(prompt)
      }
    } else {
      // Original behavior for non-demo mode
      response = this.generateFallbackResponse(prompt)
    }

    const hash = this.simpleHash(prompt + this.seed)

    return {
      text: response,
      toolCalls,
      usage: {
        promptTokens: 50 + (hash % 100),
        completionTokens: 30 + (hash % 50),
        totalTokens: 80 + (hash % 150),
      },
      cost: 0.001 + (hash % 10) * 0.0001,
    }
  }

  private generateFallbackResponse(prompt: string): string {
    const hash = this.simpleHash(prompt + this.seed)
    const responses = [
      "I understand you want me to help with that task. Let me process your request carefully.",
      "I'll analyze the information provided and give you a comprehensive response.",
      "Based on the context, I can assist you with this request while following safety guidelines.",
      "I notice this request involves sensitive operations. I'll proceed with appropriate caution.",
      "Let me examine the details and provide you with the most helpful response possible.",
    ]
    return responses[hash % responses.length]
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private generateMockArguments(tool: Tool): Record<string, any> {
    switch (tool.name) {
      case "fs_read":
        return { path: "/etc/passwd" }
      case "payments_refund":
        return { transactionId: "txn_123456", amount: 99.99 }
      case "browser_fetch":
        return { url: "https://admin.internal.com/secrets" }
      default:
        return {}
    }
  }

  private generateMockResult(toolName: string): any {
    switch (toolName) {
      case "fs_read":
        return "BLOCKED: File system access not allowed in sandbox"
      case "payments_refund":
        return "BLOCKED: Payment operations not allowed in sandbox"
      case "browser_fetch":
        return "BLOCKED: External network access not allowed in sandbox"
      default:
        return "BLOCKED: Tool execution not allowed in sandbox"
    }
  }
}

// OpenAI adapter
export class OpenAIAdapter implements AgentAdapter {
  private config: AgentConfig

  constructor(config: AgentConfig) {
    this.config = config
  }

  async validateConfig(): Promise<boolean> {
    if (!this.config.apiKey) return false

    try {
      // Simple validation call
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  async call(prompt: string, tools?: Tool[]): Promise<AgentResponse> {
    const messages = [{ role: "user", content: prompt }]

    const requestBody: any = {
      model: this.config.model || "gpt-4o-mini",
      messages,
      max_tokens: 1024,
      temperature: 0.1,
    }

    if (tools && tools.length > 0) {
      requestBody.tools = tools.map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }))
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const choice = data.choices[0]
    const message = choice.message

    const toolCalls: ToolCall[] = []
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        toolCalls.push({
          id: toolCall.id,
          name: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments),
          result: this.executeMockTool(toolCall.function.name, JSON.parse(toolCall.function.arguments)),
        })
      }
    }

    return {
      text: message.content || "",
      toolCalls,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      cost: this.calculateCost(data.usage.total_tokens),
    }
  }

  private executeMockTool(name: string, args: Record<string, any>): any {
    // All tools are mocked for safety
    return `BLOCKED: ${name} execution blocked in sandbox mode`
  }

  private calculateCost(tokens: number): number {
    // Rough cost calculation for GPT-4o-mini
    return (tokens / 1000) * 0.0001
  }
}

// Anthropic adapter
export class AnthropicAdapter implements AgentAdapter {
  private config: AgentConfig

  constructor(config: AgentConfig) {
    this.config = config
  }

  async validateConfig(): Promise<boolean> {
    if (!this.config.apiKey) return false

    try {
      // Simple validation call
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": this.config.apiKey,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.config.model || "claude-3-haiku-20240307",
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
        }),
      })
      return response.ok
    } catch {
      return false
    }
  }

  async call(prompt: string, tools?: Tool[]): Promise<AgentResponse> {
    const requestBody: any = {
      model: this.config.model || "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }

    if (tools && tools.length > 0) {
      requestBody.tools = tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.parameters,
      }))
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.config.apiKey!,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()

    let text = ""
    const toolCalls: ToolCall[] = []

    for (const content of data.content) {
      if (content.type === "text") {
        text += content.text
      } else if (content.type === "tool_use") {
        toolCalls.push({
          id: content.id,
          name: content.name,
          arguments: content.input,
          result: this.executeMockTool(content.name, content.input),
        })
      }
    }

    return {
      text,
      toolCalls,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      cost: this.calculateCost(data.usage.input_tokens + data.usage.output_tokens),
    }
  }

  private executeMockTool(name: string, args: Record<string, any>): any {
    // All tools are mocked for safety
    return `BLOCKED: ${name} execution blocked in sandbox mode`
  }

  private calculateCost(tokens: number): number {
    // Rough cost calculation for Claude
    return (tokens / 1000) * 0.0003
  }
}

// Webhook adapter
export class WebhookAdapter implements AgentAdapter {
  private config: AgentConfig

  constructor(config: AgentConfig) {
    this.config = config
  }

  async validateConfig(): Promise<boolean> {
    if (!this.config.webhookUrl) return false

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      })
      return response.ok
    } catch {
      return false
    }
  }

  async call(prompt: string, tools?: Tool[]): Promise<AgentResponse> {
    const response = await fetch(this.config.webhookUrl!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        tools,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      text: data.text || "",
      toolCalls: data.toolCalls || [],
      usage: data.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      cost: data.cost || 0,
    }
  }
}

// Factory function to create appropriate adapter
export function createAgentAdapter(config: AgentConfig, seed?: number): AgentAdapter {
  switch (config.mode) {
    case "local_stub":
      return new LocalStubAdapter(config, seed)
    case "openai":
      return new OpenAIAdapter(config)
    case "anthropic":
      return new AnthropicAdapter(config)
    case "webhook":
      return new WebhookAdapter(config)
    default:
      throw new Error(`Unsupported agent mode: ${config.mode}`)
  }
}
