import { type NextRequest, NextResponse } from "next/server"
import { generateReproducibilityPackage } from "@/lib/report-generator"
import type { RunArtifact } from "@/lib/run-artifact"

export async function POST(request: NextRequest, { params }: { params: { runId: string } }) {
  try {
    const runId = params.runId
    const artifact: RunArtifact = await request.json()

    const zipBlob = await generateReproducibilityPackage(artifact)

    return new NextResponse(zipBlob, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="reproducibility-${runId}.json"`,
      },
    })
  } catch (error) {
    console.error("Error generating reproducibility package:", error)
    return NextResponse.json({ error: "Failed to generate reproducibility package" }, { status: 500 })
  }
}
