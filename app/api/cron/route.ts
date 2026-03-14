import { NextRequest, NextResponse } from "next/server";
import { runEdgeDetection } from "@/lib/edge-detection";

export const runtime = "nodejs";

function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error("CRON_SECRET environment variable not set");
    return false;
  }

  if (!authHeader) {
    console.warn("Authorization header missing");
    return false;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const isValid = token === expectedSecret;

  if (!isValid) {
    console.warn("Invalid CRON_SECRET provided");
  }

  return isValid;
}

function checkStaleEdges(edges: any[]): { count: number; list: any[] } {
  const now = new Date();
  const staleEdges = edges.filter((edge) => edge.expiresAt <= now);
  return {
    count: staleEdges.length,
    list: staleEdges,
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!validateCronSecret(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid CRON_SECRET",
        },
        { status: 401 }
      );
    }

    const startTime = Date.now();

    const newEdges = await runEdgeDetection();

    const staleCheck = checkStaleEdges(newEdges);

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        message: "Cron job completed successfully",
        summary: {
          newEdgesFound: newEdges.length,
          staleEdgesRemoved: staleCheck.count,
          executionTimeMs: duration,
          timestamp: new Date().toISOString(),
        },
        edges: newEdges,
      },
      {
        status: 200,
        headers: {
          "X-Execution-Time": duration.toString(),
        },
      }
    );
  } catch (error) {
    console.error("Cron job error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Cron job failed";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: "Cron job execution failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
