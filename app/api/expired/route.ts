import { NextRequest, NextResponse } from "next/server";

import type { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { mapMedicationToInventory } from "@/lib/inventory-mapper";
import { handleError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const pharmacyId = searchParams.get("pharmacyId");

    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const where: Prisma.MedicationWhereInput = {
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

    return NextResponse.json(medications.map(mapMedicationToInventory));
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to fetch expiring medications." },
      { status: 500 },
    );
  }
}
