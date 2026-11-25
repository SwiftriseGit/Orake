import { NextRequest, NextResponse } from "next/server";
import { getUserStats } from "@/lib/data/admin-users";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }
    const stats = await getUserStats(id);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
