import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

export async function GET() {
  try {
    const medications = await db.medication.findMany({
      include: {
        pharmacy: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(medications);
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to fetch medications." },
      { status: 500 },
    );
  }
}
