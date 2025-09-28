// lib/run-engine.ts (where you currently build `instructions`)
import { AgentAdapter } from "./agent-adapter"
import { AttackerAgent, AttackerConfig } from "./attacker-agent"
import { AttackSpec } from "./attack-packs"
async function runSingleAttack(targetAdapter: AgentAdapter, attack: AttackSpec, attackerCfg?: AttackerConfig) {
  const attacker = new AttackerAgent(attackerCfg || { mode: "webhook", webhookUrl: process.env.ATTACKER_WEBHOOK })
  const craftedPrompt = await attacker.craftAttack(attack.objective)

  // send to target agent (your user agent) just like before
  const response = await targetAdapter.call(craftedPrompt, attack.tools)
  return { craftedPrompt, response }
}
