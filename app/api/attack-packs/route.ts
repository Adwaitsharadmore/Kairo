// app/api/attack-packs/route.ts
import { NextResponse } from 'next/server'
import { getAllAttackPacks } from '@/lib/attack-packs' // implement to read your packs

export async function GET() {
  const packs = await getAllAttackPacks() // return [{ id, name, description, tests }, ...]
  return NextResponse.json(packs)
}
