import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { updateNearExpiryMedications } from "@/lib/nearExpiry";
import { MedicationStatus } from "@/app/generated/prisma/client";
import { handleError } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Refresh medication statuses before returning results
    await updateNearExpiryMedications();

    // Check pharmacy exists
    const pharmacy = await db.pharmacy.findUnique({
      where: {
        id,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        {
          message: "Pharmacy not found.",
        },
        {
          status: 404,
        },
      );
    }

    const medications = await db.medication.findMany({
      where: {
        pharmacy_id: id,
        status: MedicationStatus.NEAR_EXPIRY,
      },
      orderBy: {
        date_expired: "asc",
      },
    });

    return NextResponse.json(medications, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to fetch near-expiry medications.",
      },
      {
        status: 500,
      },
    );
  }
}
