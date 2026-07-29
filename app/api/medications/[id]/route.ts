import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const medication = await db.medication.findUnique({
      where: {
        id,
      },
      include: {
        pharmacy: true,
      },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(medication);
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to fetch medication." },
      { status: 500 },
    );
  }
}
