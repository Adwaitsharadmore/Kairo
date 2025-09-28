// Core test runner implementation
import type { AttackSpec, AttackPack } from "./attack-packs"
import type { AgentAdapter, AgentResponse, Tool } from "./agent-adapter"
import { createChecker } from "./checkers"
import { MOCK_TOOLS } from "./agent-adapter"

// lib/agent-adapter.ts (top of file)


export interface TestResult {
  attackId: string
  trial: number
  passed: boolean
  evidence: string
  confidence: number
  response: AgentResponse
  duration: number
  error?: string
}

export interface RunProgress {
  runId: string
  status: "running" | "completed" | "failed"
  currentAttack?: string
  currentTrial?: number
  totalAttacks: number
  totalTrials: number
  completedTrials: number
  results: TestResult[]
  startTime: number
  endTime?: number
}

export interface RunConfig {
  agentConfig: any
  attackPackId: string
  trialsPerTest: number
  runLabel: string
  timestamp: string
}

export class SafetyTestRunner {
  private adapter: AgentAdapter
  private attackPack: AttackPack
  private trialsPerTest: number
  private runId: string
  private progress: RunProgress
  private onProgress?: (progress: RunProgress) => void

  constructor(
    adapter: AgentAdapter,
    attackPack: AttackPack,
    trialsPerTest: number,
    runId: string,
    onProgress?: (progress: RunProgress) => void,
  ) {
    this.adapter = adapter
    this.attackPack = attackPack
    this.trialsPerTest = trialsPerTest
    this.runId = runId
    this.onProgress = onProgress

    this.progress = {
      runId,
      status: "running",
      totalAttacks: attackPack.attacks.length,
      totalTrials: attackPack.attacks.length * trialsPerTest,
      completedTrials: 0,
      results: [],
      startTime: Date.now(),
    }
  }

  async run(): Promise<RunProgress> {
    try {
      this.progress.status = "running"
      this.notifyProgress()

      for (const attack of this.attackPack.attacks) {
        this.progress.currentAttack = attack.id

        for (let trial = 0; trial < this.trialsPerTest; trial++) {
          this.progress.currentTrial = trial + 1
          this.notifyProgress()

          const result = await this.runSingleTest(attack, trial)
          this.progress.results.push(result)
          this.progress.completedTrials++

          this.notifyProgress()
        }
      }

      this.progress.status = "completed"
      this.progress.endTime = Date.now()
      this.progress.currentAttack = undefined
      this.progress.currentTrial = undefined

      this.notifyProgress()
      return this.progress
    } catch (error) {
      this.progress.status = "failed"
      this.progress.endTime = Date.now()
      console.error("Test run failed:", error)
      this.notifyProgress()
      throw error
    }
  }

  private async runSingleTest(attack: AttackSpec, trial: number): Promise<TestResult> {
    console.log(`runSingleTest called for attack ${attack.id}, trial ${trial}`)
    const startTime = Date.now()

    try {
      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Test timeout")), attack.budget.timeoutSec * 1000)
      })

      // Run the test with timeout
      console.log("Starting test execution...")
      const testPromise = this.executeTest(attack, trial)
      const response = await Promise.race([testPromise, timeoutPromise])
      console.log("Test execution completed successfully")

      // Check the result
      console.log("Creating checker for attack:", attack.checker)
      const checker = createChecker(attack.checker)
      console.log("Running checker...")
      const checkResult = await checker.check({
        attack,
        response,
        trial,
      })
      console.log("Checker result:", checkResult)

      return {
        attackId: attack.id,
        trial,
        passed: checkResult.passed,
        evidence: checkResult.evidence,
        confidence: checkResult.confidence,
        response,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      console.error(`Error in runSingleTest for attack ${attack.id}, trial ${trial}:`, error)
      return {
        attackId: attack.id,
        trial,
        passed: false,
        evidence: "test_error",
        confidence: 0.0,
        response: {
          text: "",
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        },
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async executeTest(attack: AttackSpec, trial: number): Promise<AgentResponse> {
    console.log(`executeTest called for attack ${attack.id}, trial ${trial}`)
    
    // Use seeded randomization for deterministic results
    const seed = attack.seed + trial

    // Provide mock tools for the agent to potentially abuse
    const tools = MOCK_TOOLS
    console.log("Using mock tools:", tools.map(t => t.name))

    // Call the agent with the attack prompt
    console.log("Calling adapter with goal:", attack.objective.goal)
    const response = await this.adapter.call(attack.objective.goal, tools)
    console.log("Adapter response received:", { text: response.text?.substring(0, 100), toolCalls: response.toolCalls?.length })

    // Validate response doesn't exceed budget
    if (response.usage && response.usage.totalTokens > attack.budget.maxTokens) {
      throw new Error(`Token budget exceeded: ${response.usage.totalTokens} > ${attack.budget.maxTokens}`)
    }

    if (response.toolCalls && response.toolCalls.length > attack.budget.maxToolCalls) {
      throw new Error(`Tool call budget exceeded: ${response.toolCalls.length} > ${attack.budget.maxToolCalls}`)
    }

    return response
  }

  private notifyProgress() {
    if (this.onProgress) {
      this.onProgress({ ...this.progress })
    }
  }

  getProgress(): RunProgress {
    return { ...this.progress }
  }
}

// Utility function to generate run ID
export function generateRunId(): string {
  const date = new Date().toISOString().split("T")[0]
  const time = Date.now().toString(36)
  return `${date}-${time}`
}
