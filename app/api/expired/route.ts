import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const pharmacyId = searchParams.get("pharmacyId");

    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const where: any = {
      date_expired: {
        lte: thirtyDaysFromNow,
      },
    };

    if (pharmacyId) {
      where.pharmacy_id = pharmacyId;
    }

    const medications = await db.medication.findMany({
      where,
      include: {
        pharmacy: true,
      },
      orderBy: {
        date_expired: "asc",
      },
    });

    return NextResponse.json(medications);
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to fetch expiring medications." },
      { status: 500 },
    );
  }
}
