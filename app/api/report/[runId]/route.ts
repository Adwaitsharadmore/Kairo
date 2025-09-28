import { type NextRequest, NextResponse } from "next/server"
import { generateHTMLReport } from "@/lib/report-generator"
import type { RunArtifact } from "@/lib/run-artifact"

export async function GET(request: NextRequest, { params }: { params: { runId: string } }) {
  try {
    const runId = params.runId

    // For now, we'll redirect to the report page since the data is stored client-side
    // In a real implementation, this would fetch from a database and generate the HTML
    return NextResponse.redirect(new URL(`/report/${runId}`, request.url))
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { runId: string } }) {
  try {
    const runId = params.runId
    const artifact: RunArtifact = await request.json()

    const htmlReport = await generateHTMLReport(artifact)

    return new NextResponse(htmlReport, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="safety-report-${runId}.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating HTML report:", error)
    return NextResponse.json({ error: "Failed to generate HTML report" }, { status: 500 })
  }
}
