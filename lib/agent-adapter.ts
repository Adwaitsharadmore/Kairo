// Agent adapter interface and implementations
// lib/agent-adapter.ts (top of file)
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
export interface AgentAdapter {
  validateConfig(): Promise<boolean>;
  call(prompt: string, tools?: Tool[]): Promise<AgentResponse>;
}
 // Import AgentAdapter to fix undeclared variable error


export interface AgentConfig {
  name: string
  mode: "openai" | "anthropic" | "webhook" | "local_stub" | "gemini"
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

// --- Gemini adapter ---
export class GeminiAdapter implements AgentAdapter {
  private config: AgentConfig
  private client: GoogleGenerativeAI

  constructor(config: AgentConfig) {
    this.config = config
    if (!config.apiKey) throw new Error("GeminiAdapter: missing apiKey")
    this.client = new GoogleGenerativeAI(config.apiKey)
  }

  async validateConfig(): Promise<boolean> {
    try {
      // simple noop call: create model
      this.client.getGenerativeModel({
        model: this.config.model || "gemini-2.5-flash",
      })
      return true
    } catch {
      return false
    }
  }

  async call(prompt: string, tools?: Tool[]): Promise<AgentResponse> {
    const functionDeclarations = this.toFunctionDeclarations(tools)

    const model = this.client.getGenerativeModel({
      model: this.config.model || "gemini-2.5-flash",
      // You can inject a system instruction here if you want:
      // systemInstruction: "You are a careful, policy-following assistant..."
      tools: functionDeclarations ? [{ functionDeclarations }] : undefined,
    })

    const resp = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.2,
      },
    })

    const text = resp.response?.text() ?? ""
    const toolCalls = this.extractToolCalls(resp.response)

    const usage = resp.response?.usageMetadata as any ?? {}
    return {
      text,
      toolCalls,
      usage: {
        promptTokens: usage.promptTokenCount || 0,
        completionTokens: usage.candidatesTokenCount || usage.outputTokenCount || 0,
        totalTokens: usage.totalTokenCount || 0,
      },
      cost: 0,
    }
  }

  private toFunctionDeclarations(tools?: Tool[]) {
    if (!tools?.length) return undefined
    return tools.map((t) => ({
      name: String(t.name || "").slice(0, 64) || "tool",
      description: String(t.description || ""),
      parameters: {
        type: SchemaType.OBJECT,
        properties: t.parameters?.properties || {},
        required: t.parameters?.required || [],
      },
    }))
  }

  private extractToolCalls(googleResp: any): ToolCall[] {
    const calls: ToolCall[] = []
    try {
      const parts = googleResp?.candidates?.[0]?.content?.parts || []
      for (const p of parts) {
        if (p.functionCall?.name) {
          calls.push({
            id: `fc_${Math.random().toString(36).slice(2)}`,
            name: p.functionCall.name,
            arguments: p.functionCall.args || {},
            result: `BLOCKED: ${p.functionCall.name} execution blocked`,
          })
        }
      }
    } catch {}
    return calls
  }
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
    console.log(`WebhookAdapter.call: Making request to ${this.config.webhookUrl}`)
    console.log(`WebhookAdapter.call: Prompt length: ${prompt.length}`)
    console.log(`WebhookAdapter.call: Tools: ${tools?.length || 0}`)
    
    // Retry logic for rate limiting and temporary failures
    const maxRetries = 3
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`WebhookAdapter.call: Attempt ${attempt}/${maxRetries}`)
        
        const response = await fetch(this.config.webhookUrl!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            tools,
            max_tokens: 1024,
          }),
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(30000), // 30 second timeout
        })

        console.log(`WebhookAdapter.call: Response status: ${response.status}`)
        console.log(`WebhookAdapter.call: Response headers:`, Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`WebhookAdapter.call: Error response body:`, errorText)
          
          // Check if it's a rate limit error (429) or temporary server error (5xx)
          if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
            if (attempt < maxRetries) {
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // Exponential backoff, max 10s
              console.log(`WebhookAdapter.call: Rate limit/server error, retrying in ${delay}ms...`)
              await new Promise(resolve => setTimeout(resolve, delay))
              lastError = new Error(`Webhook error: ${response.status} ${response.statusText} - ${errorText}`)
              continue
            }
          }
          
          throw new Error(`Webhook error: ${response.status} ${response.statusText} - ${errorText}`)
        }

        let data
        try {
          data = await response.json()
          console.log(`WebhookAdapter.call: Response data:`, {
            hasText: !!data.text,
            textLength: data.text?.length || 0,
            toolCallsCount: data.toolCalls?.length || 0,
            hasUsage: !!data.usage
          })
        } catch (jsonError) {
          console.error(`WebhookAdapter.call: JSON parse error:`, jsonError)
          // If JSON parsing fails, try to get the raw text
          const rawText = await response.text()
          console.log(`WebhookAdapter.call: Raw response text:`, rawText.substring(0, 200))
          
          // Return the raw text as the response
          return {
            text: `[RAW_RESPONSE] ${rawText}`,
            toolCalls: [],
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            cost: 0,
          }
        }

        // Success! Return the response
        return {
          text: data.text || "",
          toolCalls: data.toolCalls || [],
          usage: data.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          cost: data.cost || 0,
        }
        
      } catch (error) {
        console.error(`WebhookAdapter.call: Attempt ${attempt} failed:`, error)
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // If this is the last attempt, break out of the retry loop
        if (attempt === maxRetries) {
          break
        }
        
        // For network errors, wait before retrying
        if (error instanceof Error && (
          error.message.includes('fetch failed') || 
          error.message.includes('network') ||
          error.name === 'AbortError'
        )) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Exponential backoff, max 5s
          console.log(`WebhookAdapter.call: Network error, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    // If we get here, all retries failed
    console.error(`WebhookAdapter.call: All ${maxRetries} attempts failed`)
    
    // Return appropriate error response based on the last error
    if (lastError instanceof Error) {
      if (lastError.message.includes('429') || lastError.message.includes('Too Many Requests')) {
        return {
          text: `[RATE_LIMIT] API quota exceeded. Please wait before retrying. ${lastError.message}`,
          toolCalls: [],
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          cost: 0,
        }
      }
      
      if (lastError.name === 'AbortError' || lastError.message.includes('timeout')) {
        return {
          text: `[TIMEOUT] Webhook request timed out after 30 seconds`,
          toolCalls: [],
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          cost: 0,
        }
      }
      
      if (lastError.message.includes('fetch failed') || lastError.message.includes('network')) {
        return {
          text: `[NETWORK_ERROR] Failed to connect to webhook: ${lastError.message}`,
          toolCalls: [],
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          cost: 0,
        }
      }
      
      // For other errors, include the error message in the response
      return {
        text: `[WEBHOOK_ERROR] ${lastError.message}`,
        toolCalls: [],
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        cost: 0,
      }
    }
    
    // Fallback for unknown errors
    return {
      text: `[UNKNOWN_ERROR] Webhook call failed with unknown error`,
      toolCalls: [],
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      cost: 0,
    }
  }
}

// Factory function to create appropriate adapter
export function createAgentAdapter(config: AgentConfig, seed?: number): AgentAdapter {
  console.log("createAgentAdapter called with config:", JSON.stringify(config, null, 2))
  console.log("config.mode:", config.mode)
  
  switch (config.mode) {
    case "openai":
      console.log("Creating OpenAIAdapter")
      return new OpenAIAdapter(config)
    case "anthropic":
      console.log("Creating AnthropicAdapter")
      return new AnthropicAdapter(config)
    case "webhook":
      console.log("Creating WebhookAdapter")
      return new WebhookAdapter(config)
    case "gemini":
      console.log("Creating GeminiAdapter")
      return new GeminiAdapter(config)
    default:
      console.error(`Unsupported agent mode: ${config.mode}`)
      throw new Error(`Unsupported agent mode: ${config.mode}`)
  }
}
