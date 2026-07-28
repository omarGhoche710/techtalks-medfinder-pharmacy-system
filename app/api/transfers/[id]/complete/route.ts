import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

// =====================================================
// POST
// Complete Transfer
//
// Business Rule:
// - Transfer must exist
// - Only CONFIRMED transfers can be completed
// - Mark transfer as COMPLETED
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
    // Only confirmed transfers can be completed
    // --------------------------------------

    if (transfer.status !== "CONFIRMED") {
      return NextResponse.json(
        {
          message: "Only confirmed transfers can be completed.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Update transfer status
    // --------------------------------------

    const completedTransfer = await db.transfer.update({
      where: {
        id,
      },
      data: {
        status: "COMPLETED",
      },
      include: {
        medication: true,
        fromPharmacy: true,
        toPharmacy: true,
      },
    });

    return NextResponse.json(completedTransfer, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to complete transfer.",
      },
      {
        status: 500,
      },
    );
  }
}
