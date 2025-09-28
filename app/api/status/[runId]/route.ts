export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
// IMPORTANT: use the SAME import path everywhere to avoid duplicate modules
import { getRun } from '@/lib/run-store';

export async function GET(
  _req: Request,
  context: { params: { runId: string } }
) {
  try {
    const { runId } = context.params;
    const rec = getRun(runId);
    if (!rec) {
      return NextResponse.json({ error: 'not found', runId }, { status: 404 });
    }
    return NextResponse.json(rec, { status: 200 });
  } catch (err) {
    console.error('status route error', err);
    return NextResponse.json({ error: 'status route failed' }, { status: 500 });
  }
}
