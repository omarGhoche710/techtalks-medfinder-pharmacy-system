import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { TransactionType } from "@/app/generated/prisma/client";
import { handleError } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

function parseTransactionType(value: string | null): TransactionType | null {
  if (!value) return null;
  const normalized = value.toString().trim().toUpperCase();

  switch (normalized) {
    case "STOCK_IN":
    case "STOCK-IN":
    case "stock_in":
    case "stock-in":
      return TransactionType.STOCK_IN;
    case "DISPENSE":
      return TransactionType.DISPENSE;
    case "DAMAGE":
      return TransactionType.DAMAGE;
    default:
      return null;
  }
}

function mapTransaction(transaction: any) {
  return {
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
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = parseTransactionType(searchParams.get("type"));
    const medicationId = searchParams.get("medicationId");
    const pharmacyId = searchParams.get("pharmacyId");

    const where: any = {};
    if (type) where.type = type;
    if (medicationId) where.medication_id = medicationId;
    if (pharmacyId) where.pharmacy_id = pharmacyId;

    const transactions = await db.transaction.findMany({
      where,
      include: {
        medication: true,
        pharmacy: true,
        user: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(transactions.map(mapTransaction));
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to fetch transactions." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Get logged in user from Clerk session
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized — you must be logged in." },
        { status: 401 }
      );
    }

    // Step 2: Find user in database using clerkId from session
    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Step 3: Parse request body — performedBy no longer needed
    const body = await request.json();
    const type = parseTransactionType(body.type);
    const medicationId = body.medicationId || body.medication_id;
    const quantity = Number(body.quantity);

    if (!type || !medicationId || Number.isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          error: "type, medicationId, and a positive quantity are required.",
        },
        { status: 400 }
      );
    }

    // Step 4: Find medication
    const medication = await db.medication.findUnique({
      where: { id: medicationId },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found." },
        { status: 404 }
      );
    }

    // Step 5: Verify user is an active member of this pharmacy
    const membership = await db.pharmacyMembership.findFirst({
      where: {
        user_id: user.id,
        pharmacy_id: medication.pharmacy_id,
        is_active: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          error: "Forbidden — you are not an active member of this pharmacy.",
        },
        { status: 403 }
      );
    }

    // Only OWNER and PHARMACIST can dispense medication
if (type === TransactionType.DISPENSE && membership.role === "EMPLOYEE") {
  return NextResponse.json(
    {
      error: "Forbidden — employees are not authorized to dispense medication. Only pharmacists and owners can perform this action.",
    },
    { status: 403 }
  );
}

    // Step 6: Calculate new stock
    let updatedStock = medication.stock;
    if (type === TransactionType.STOCK_IN) {
      updatedStock += quantity;
    } else {
      updatedStock -= quantity;
      if (updatedStock < 0) {
        return NextResponse.json(
          {
            error: `Not enough stock. Current quantity is ${medication.stock}, requested ${quantity}.`,
          },
          { status: 400 }
        );
      }
    }

    // Step 7: Update stock and create transaction record atomically
    const transaction = await db.$transaction(async (tx) => {
      await tx.medication.update({
        where: { id: medication.id },
        data: { stock: updatedStock },
      });

      return tx.transaction.create({
        data: {
          medication_id: medication.id,
          pharmacy_id: medication.pharmacy_id,
          performed_by: user.id, // from auth session, not request body
          type,
          quantity_changed: quantity,
        },
        include: {
          medication: true,
          pharmacy: true,
          user: true,
        },
      });
    });

    return NextResponse.json(
      {
        transaction: mapTransaction(transaction),
        updatedMedication: {
          id: medication.id,
          name: medication.name,
          previousStock: medication.stock,
          newStock: updatedStock,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to create transaction." },
      { status: 500 },
    );
  }
}