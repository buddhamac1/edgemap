import { NextResponse } from "next/server";
import { flushStaleEdgeIds } from "@/lib/storage";

export const runtime = "nodejs";

// One-time utility: removes old timestamp-suffixed edge IDs from the
// active list that accumulated before the stable-ID fix was deployed.
// Call once via: POST /api/admin/flush
export async function POST() {
  try {
    const removed = await flushStaleEdgeIds();
    return NextResponse.json({
      success: true,
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
