import { NextRequest, NextResponse } from "next/server";
import { getSSRSession } from "@/lib/get-server-session";
import { database } from "@/db"; // Adjust the path to your database connection file
import { userFiles } from "@/db/schema"; // Adjust the path to your schema file

export async function POST(request: NextRequest) {
  const session = await getSSRSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.method !== "POST") {
    return NextResponse.json(
      { error: `Method ${request.method} Not Allowed` },
      { status: 405 },
    );
  }

  try {
    const { userId, fileName, fileUrl } = await request.json();

    await database
      .insert(userFiles)
      .values({
        userId,
        fileName,
        fileUrl,
      })
      .execute();

    return NextResponse.json(
      { message: "File metadata saved successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
