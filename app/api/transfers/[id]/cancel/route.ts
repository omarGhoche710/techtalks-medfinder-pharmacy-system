import { NextRequest, NextResponse } from "next/server";
import { sendTransferNotification } from "@/lib/notifications";
import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

// =====================================================
// POST
// Cancel Transfer
//
// Business Rule:
// - Transfer must exist
// - Only PENDING transfers can be cancelled
// - Medication ownership remains unchanged
// - Update transfer status to CANCELLED
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
        fromPharmacy: true,
        toPharmacy: true,
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
    // Only pending transfers can be cancelled
    // --------------------------------------

    if (transfer.status !== "PENDING") {
      return NextResponse.json(
        {
          message: "Only pending transfers can be cancelled.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Update transfer status
    // --------------------------------------

    const updatedTransfer = await db.transfer.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
      },
      include: {
        medication: true,
        fromPharmacy: true,
        toPharmacy: true,
      },
    });
    await sendTransferNotification(id, "CANCELLED");

    return NextResponse.json(updatedTransfer, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to cancel transfer.",
      },
      {
        status: 500,
      },
    );
  }
}
