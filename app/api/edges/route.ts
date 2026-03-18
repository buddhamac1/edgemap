import { NextRequest, NextResponse } from "next/server";
import { getAllActiveEdges } from "@/lib/edge-detection";
import { getMockEdges } from "@/data/mock-edges";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    // Get real edges from persistent storage
    const edges = await getAllActiveEdges();

    // Fall back to mock data only if nothing has been scanned yet
    if (edges.length === 0) {
      return NextResponse.json(getMockEdges(category, undefined, undefined), {
        status: 200,
      });
    }

    // Filter by category if requested
    const filtered =
      category && category !== "All"
        ? edges.filter((e) => e.category === category)
        : edges;

    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error("Edges API error:", error);
    return NextResponse.json(getMockEdges(), { status: 200 });
  }
}
