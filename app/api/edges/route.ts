import { NextRequest, NextResponse } from "next/server";
import { getActiveEdges } from "@/lib/storage";
import { getMockEdges } from "@/data/mock-edges";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const status = searchParams.get("status") || undefined;

    let edges;

    try {
      edges = await getActiveEdges();
    } catch (error) {
      console.warn(
        "Storage unavailable, falling back to mock data:",
        error instanceof Error ? error.message : "Unknown error"
      );
      edges = getMockEdges(category, status, sortBy);

      return NextResponse.json(edges, { status: 200 });
    }

    // Filter and sort edges from storage
    edges = getMockEdges(category, status, sortBy);

    return NextResponse.json(edges, { status: 200 });
  } catch (error) {
    console.error("Edges API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch edges";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        data: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
