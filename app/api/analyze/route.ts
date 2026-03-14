import { NextRequest, NextResponse } from "next/server";
import { runEdgeDetection } from "@/lib/edge-detection";

export const runtime = "nodejs";

function validateAuthHeader(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.warn("CRON_SECRET environment variable not set");
    return false;
  }

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace("Bearer ", "");
  return token === expectedSecret;
}

export async function POST(request: NextRequest) {
  try {
    if (!validateAuthHeader(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid or missing CRON_SECRET",
        },
        { status: 401 }
      );
    }

    const edges = await runEdgeDetection();

    return NextResponse.json(
      {
        success: true,
        message: "Edge detection completed",
        edgesFound: edges.length,
        data: edges,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analyze API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Edge detection failed";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
