import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const transaction = await db.transaction.findUnique({
      where: {
        id,
      },
      include: {
        medication: true,
        pharmacy: true,
        user: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: transaction.id,
      type: transaction.type,
      medicationId: transaction.medication?.id ?? null,
      medicationName: transaction.medication?.name ?? null,
      pharmacyId: transaction.pharmacy?.id ?? null,
      pharmacyName: transaction.pharmacy?.name ?? null,
      quantity: transaction.quantity_changed,
      notes: "",
      performedBy: transaction.user?.id ?? null,
      performedByName: transaction.user?.username ?? null,
      date: transaction.created_at.toISOString(),
    });
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to fetch transaction." },
      { status: 500 },
    );
  }
}

