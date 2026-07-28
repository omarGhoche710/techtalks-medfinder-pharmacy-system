import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

// =====================================================
// POST
// Confirm Transfer
//
// Business Rule:
// - Transfer must exist
// - Transfer must still be PENDING
// - Reassign medication to destination pharmacy
// - Mark medication as TRANSFERRED
// - Update transfer status to CONFIRMED
// - Save confirmation time
// =====================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // --------------------------------------
    // Find transfer
    // --------------------------------------

    const transfer = await db.transfer.findUnique({
      where: {
        id,
      },
      include: {
        medication: true,
      },
    });

    if (!transfer) {
      return NextResponse.json(
        {
          message: "Transfer not found.",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------
    // Only pending transfers can be confirmed
    // --------------------------------------

    if (transfer.status !== "PENDING") {
      return NextResponse.json(
        {
          message: "Only pending transfers can be confirmed.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Execute both updates atomically
    // --------------------------------------

    await db.$transaction(async (tx) => {
      // Move medication ownership
      await tx.medication.update({
        where: {
          id: transfer.medication_id,
        },
        data: {
          pharmacy_id: transfer.to_pharmacy_id,
          status: "TRANSFERRED",
        },
      });

      // Update transfer
      await tx.transfer.update({
        where: {
          id,
        },
        data: {
          status: "CONFIRMED",
          confirmed_at: new Date(),
        },
      });
    });

    // --------------------------------------
    // Return updated transfer
    // --------------------------------------

    const updatedTransfer = await db.transfer.findUnique({
      where: {
        id,
      },
      include: {
        medication: true,
        fromPharmacy: true,
        toPharmacy: true,
      },
    });

    return NextResponse.json(updatedTransfer, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to confirm transfer.",
      },
      {
        status: 500,
      },
    );
  }
}
