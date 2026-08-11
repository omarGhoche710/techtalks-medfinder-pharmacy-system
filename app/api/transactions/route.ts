import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { TransactionType } from "@/app/generated/prisma/client";
import type { Prisma } from "@/app/generated/prisma/client";
import { handleError } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimiters } from "@/lib/rate-limit";
import { validate, validationError } from "@/lib/validators";

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

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: { medication: true; pharmacy: true; user: true };
}>;

function mapTransaction(transaction: TransactionWithRelations) {
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

    const where: Prisma.TransactionWhereInput = {};
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
    // Rate limit check
    const rateLimitResponse = await checkRateLimit(
      request,
      rateLimiters.transactions,
    );
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const medicationId = body.medicationId || body.medication_id;
    const quantity = Number(body.quantity);

    const { valid, error } = validate(
      {
        type: body.type,
        medicationId,
        quantity,
      },
      {
        type: {
          required: true,
          enum: [
            "STOCK_IN",
            "STOCK-IN",
            "stock_in",
            "stock-in",
            "DISPENSE",
            "dispense",
            "DAMAGE",
            "damage",
          ],
        },
        medicationId: { required: true, type: "string" },
        quantity: { required: true, type: "number", min: 1 },
      },
    );

    if (!valid) return validationError(error!);

    const type = parseTransactionType(body.type);

    if (!type) {
      return NextResponse.json(
        { error: "Invalid transaction type." },
        { status: 400 },
      );
    }

    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized — you must be logged in." },
        { status: 401 },
      );
    }

    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 },
      );
    }

    // Find medication
    const medication = await db.medication.findUnique({
      where: { id: medicationId },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found." },
        { status: 404 },
      );
    }

    // Step 7: Verify user is an active member of this pharmacy
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
        { status: 403 },
      );
    }

    // Step 8: Only OWNER and PHARMACIST can dispense medication
    if (
      type === TransactionType.DISPENSE &&
      membership.role === "EMPLOYEE"
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden — employees are not authorized to dispense medication. Only pharmacists and owners can perform this action.",
        },
        { status: 403 },
      );
    }

    // Step 9: Calculate new stock
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
          { status: 400 },
        );
      }
    }

    // Step 10: Update stock and create transaction record atomically
    const transaction = await db.$transaction(async (tx) => {
      await tx.medication.update({
        where: { id: medication.id },
        data: { stock: updatedStock },
      });

      return tx.transaction.create({
        data: {
          medication_id: medication.id,
          pharmacy_id: medication.pharmacy_id,
          performed_by: user.id,
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
      { status: 201 },
    );
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to create transaction." },
      { status: 500 },
    );
  }
}