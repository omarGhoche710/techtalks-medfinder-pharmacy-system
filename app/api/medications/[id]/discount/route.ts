import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { MedicationStatus } from "@/app/generated/prisma/client";
import { handleError } from "@/lib/utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const { discount_percentage } = body;

    // -----------------------------
    // Validate discount
    // -----------------------------

    if (
      discount_percentage === undefined ||
      discount_percentage < 0 ||
      discount_percentage > 100
    ) {
      return NextResponse.json(
        {
          message: "Discount percentage must be between 0 and 100.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------
    // Find medication
    // -----------------------------

    const medication = await db.medication.findUnique({
      where: {
        id,
      },
    });

    if (!medication) {
      return NextResponse.json(
        {
          message: "Medication not found.",
        },
        {
          status: 404,
        },
      );
    }

    // -----------------------------
    // Must be near expiry
    // -----------------------------

    if (medication.status !== MedicationStatus.NEAR_EXPIRY) {
      return NextResponse.json(
        {
          message: "Discount can only be applied to near-expiry medications.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------
    // Calculate new price
    // -----------------------------

    const discounted_price =
      medication.price - (medication.price * discount_percentage) / 100;

    // -----------------------------
    // Update database
    // -----------------------------

    const updatedMedication = await db.medication.update({
      where: {
        id,
      },
      data: {
        discount_percentage,
        discounted_price,
      },
    });

    return NextResponse.json(updatedMedication, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to update discount.",
      },
      {
        status: 500,
      },
    );
  }
}
