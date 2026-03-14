import { NextRequest, NextResponse } from "next/server";
import { fetchMarkets } from "@/lib/polymarket";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const markets = await fetchMarkets({ category });

    return NextResponse.json(
      {
        success: true,
        data: markets,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Markets API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch markets";

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
