import { NextResponse } from "next/server";
import { runEdgeDetection, getAllActiveEdges } from "@/lib/edge-detection";

export const runtime = "nodejs";

// Manual scan endpoint — called by the Scan Now button
// No auth required since it's triggered from within the app UI
export async function POST() {
  try {
    const startTime = Date.now();

    // Run the edge detection pipeline (fetches Polymarket + Claude analysis)
    await runEdgeDetection({ forceRefresh: true });

    // Return all active edges (newly detected + previously stored)
    const edges = await getAllActiveEdges();
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      edges,
      count: edges.length,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Scan failed",
      },
      { status: 500 }
    );
  }
}
