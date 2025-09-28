// app/api/run/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { packs } from '@/lib/attack-packs';
import { createAgentAdapter } from '@/lib/agent-adapter';
import { SafetyTestRunner, generateRunId } from '@/lib/test-runner';
import { createRun, setRunStatus, setRunProgress } from '@/lib/run-store';
import type { StartRunPayload } from '@/lib/types';

export async function POST(req: Request) {
  const { agentConfig, attackPackId = 'prelim_safety_v1', trialsPerTest = 1, runLabel, attackerMode = 'static' }: StartRunPayload = await req.json();
  console.log("API POST received payload:", JSON.stringify({ agentConfig, attackPackId, trialsPerTest, runLabel, attackerMode }, null, 2));
  
  const pack = packs[attackPackId];
  if (!pack) return NextResponse.json({ error: 'unknown pack' }, { status: 400 });

  const runId = generateRunId();

  // ✅ create the record first
  createRun(runId, runLabel);
  setRunStatus(runId, 'running');

  console.log("About to create adapter with config:", agentConfig);
  const adapter = createAgentAdapter(agentConfig as any);
  console.log("Adapter created successfully");

  // fire-and-forget
  (async () => {
    try {
      const runner = new SafetyTestRunner(
        adapter, pack, Number(trialsPerTest || 1), runId,
        (progress) => setRunProgress(runId, progress),
        attackerMode
      );
      const final = await runner.run();
      setRunProgress(runId, final);
      setRunStatus(runId, 'completed');
    } catch (e) {
      console.error('runner error', e);
      setRunStatus(runId, 'failed');
    }
  })();

  return NextResponse.json({ runId });
}
