import { NextRequest, NextResponse } from "next/server";
import { getSSRSession } from "@/lib/get-server-session";
import { database } from "@/db";
import { userFiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await getSSRSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user!.id;

  try {
    const files = await database
      .select()
      .from(userFiles)
      .where(eq(userFiles.userId, userId))
      .execute();
    console.log("Fetched files:", files);
    return NextResponse.json(files);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
