import { NextRequest, NextResponse } from "next/server";
import { getHistory, deleteHistorySession, clearHistory } from "@/lib/history";

export const runtime = "nodejs";

export async function GET() {
  try {
    const history = await getHistory();
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (id) {
      await deleteHistorySession(id);
      return NextResponse.json({ success: true, message: "Session deleted" });
    } else {
      await clearHistory();
      return NextResponse.json({ success: true, message: "History cleared" });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete history" }, { status: 500 });
  }
}
