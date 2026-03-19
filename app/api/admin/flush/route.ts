import { NextRequest, NextResponse } from "next/server";
import { flushStaleEdgeIds } from "@/lib/storage";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

// POST /api/admin/flush        — removes stale timestamp-suffixed IDs
// POST /api/admin/flush?wipe=1 — hard resets edges:active to []
export async function POST(request: NextRequest) {
  try {
    const wipe = request.nextUrl.searchParams.get("wipe") === "1";

    if (wipe) {
      await kv.set("edges:active", []);
      return NextResponse.json({
        success: true,
        action: "wipe",
        message: "edges:active reset to [] — all stale data cleared",
      });
    }

    const removed = await flushStaleEdgeIds();
    return NextResponse.json({
      success: true,
      action: "flush",
      removed,
      message: removed > 0
        ? `Removed ${removed} stale edge IDs from active list`
        : "No stale IDs found — KV is already clean",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Flush failed" },
      { status: 500 }
    );
  }
  }
