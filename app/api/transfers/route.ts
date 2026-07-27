import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

// =====================================================
// GET
// Return all transfer requests
// =====================================================

export async function GET() {
  try {
    const transfers = await db.transfer.findMany({
      include: {
        medication: true,
        fromPharmacy: true,
        toPharmacy: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(transfers, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to fetch transfers",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// POST
// Create Transfer Request
// =====================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      from_pharmacy_id,
      to_pharmacy_id,
      medication_id,
      quantity,
      reason,
      discount_percentage,
      discounted_price,
    } = body;

    // --------------------------------------
    // Required Fields
    // --------------------------------------

    if (!from_pharmacy_id || !to_pharmacy_id || !medication_id || !quantity) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Cannot transfer to same pharmacy
    // --------------------------------------

    if (from_pharmacy_id === to_pharmacy_id) {
      return NextResponse.json(
        {
          message: "Source and destination pharmacy cannot be the same.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Medication Exists?
    // --------------------------------------

    const medication = await db.medication.findUnique({
      where: {
        id: medication_id,
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

    // --------------------------------------
    // Medication belongs to source pharmacy?
    // --------------------------------------

    if (medication.pharmacy_id !== from_pharmacy_id) {
      return NextResponse.json(
        {
          message: "Medication does not belong to this pharmacy.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Enough Stock?
    // --------------------------------------

    if (quantity > medication.stock) {
      return NextResponse.json(
        {
          message: "Quantity exceeds available stock.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Medication Transferable?
    // --------------------------------------

    if (!medication.is_transferable) {
      return NextResponse.json(
        {
          message: "Medication is not transferable.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Create Transfer
    // --------------------------------------

    const transfer = await db.transfer.create({
      data: {
        from_pharmacy_id,
        to_pharmacy_id,
        medication_id,
        quantity,
        reason,
        discount_percentage,
        discounted_price,
        status: "PENDING",
      },
      include: {
        medication: true,
        fromPharmacy: true,
        toPharmacy: true,
      },
    });

    return NextResponse.json(transfer, {
      status: 201,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to create transfer.",
      },
      {
        status: 500,
      },
    );
  }
}
