import { NextRequest, NextResponse } from "next/server";
import { getAllActiveEdges } from "@/lib/edge-detection";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const edges = await getAllActiveEdges();

    const filtered =
      category && category !== "All"
        ? edges.filter((e) => e.category === category)
        : edges;

    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error("Edges API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
