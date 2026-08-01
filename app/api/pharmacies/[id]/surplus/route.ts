import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

// =====================================================
// GET
// Detect Near-Expiry Surplus
//
// Business Rules:
// - Pharmacy must exist
// - Medication must be NEAR_EXPIRY
// - Medication must be transferable
// - Medication must have stock > 0
// =====================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // --------------------------------------
    // Pharmacy Exists?
    // --------------------------------------

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

    // --------------------------------------
    // Find Surplus Medications
    // --------------------------------------

    const surplus = await db.medication.findMany({
      where: {
        pharmacy_id: id,
        status: "NEAR_EXPIRY",
        is_transferable: true,
        stock: {
          gt: 0,
        },
      },
      orderBy: {
        date_expired: "asc",
      },
    });

    return NextResponse.json(surplus, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to detect surplus medications.",
      },
      {
        status: 500,
      },
    );
  }
}
