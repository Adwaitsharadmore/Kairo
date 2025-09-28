// lib/run-store.ts
export type RunStatus = "pending" | "running" | "completed" | "failed";

export interface RunRecord {
  runId: string;
  label?: string;
  status: RunStatus;
  progress?: any;    // your RunProgress
  createdAt: string;
  updatedAt: string;
}

// IMPORTANT: use globalThis to persist across module reloads & routes
const g = globalThis as any;
if (!g.__RUN_STORE__) {
  g.__RUN_STORE__ = new Map<string, RunRecord>();
}
const RUNS: Map<string, RunRecord> = g.__RUN_STORE__;

export function createRun(runId: string, label?: string) {
  const now = new Date().toISOString();
  const rec: RunRecord = { runId, label, status: "pending", createdAt: now, updatedAt: now };
  RUNS.set(runId, rec);
  return rec;
}

export function setRunStatus(runId: string, status: RunStatus) {
  const r = RUNS.get(runId); if (!r) return;
  r.status = status; r.updatedAt = new Date().toISOString();
}

export function setRunProgress(runId: string, progress: any) {
  const r = RUNS.get(runId); if (!r) return;
  r.progress = progress; r.updatedAt = new Date().toISOString();
}

export function getRun(runId: string) {
  return RUNS.get(runId);
}
