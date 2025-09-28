// app/api/debug/runs/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function GET() {
  const ids = Array.from((globalThis as any).__RUN_STORE__?.keys?.() ?? []);
  return NextResponse.json({ runIds: ids });
}
