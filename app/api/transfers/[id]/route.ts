import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

// =====================================================
// GET
// Return a single transfer by ID
// =====================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    return NextResponse.json(transfer, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to fetch transfer.",
      },
      {
        status: 500,
      },
    );
  }
}
