import { NextRequest, NextResponse } from "next/server";

import type { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { mapMedicationToInventory } from "@/lib/inventory-mapper";
import { verifyPharmacyMembership } from "@/lib/pharmacy-auth";
import { checkRateLimit, rateLimiters } from "@/lib/rate-limit";
import { handleError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const pharmacyId = searchParams.get("pharmacyId");
    const medicationId = searchParams.get("medicationId");

    const where: Prisma.MedicationWhereInput = {};
    if (pharmacyId) {
      where.pharmacy_id = pharmacyId;
    }
    if (medicationId) {
      where.id = medicationId;
    }

    const medications = await db.medication.findMany({
      where,
      include: {
        pharmacy: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(medications.map(mapMedicationToInventory));
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to fetch inventory." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, rateLimiters.inventory);
    if (rateLimitResponse) return rateLimitResponse;
    const body = await request.json();

    const code = body.code?.toString().trim();
    const name = (body.medicationName || body.name)?.toString().trim();
    const description = body.description?.toString().trim() || null;
    const pharmacyId = body.pharmacyId?.toString().trim();
    const quantity = Number(body.quantity);
    const price = Number(body.price);
    const expiryDate = body.expiryDate?.toString().trim();

    if (!code || !name || !pharmacyId || Number.isNaN(quantity) || Number.isNaN(price) || !expiryDate) {
      return NextResponse.json(
        {
          error: "code, medicationName, pharmacyId, quantity, price, and expiryDate are required.",
        },
        { status: 400 },
      );
    }

    if (quantity < 0 || price < 0) {
      return NextResponse.json(
        { error: "quantity and price must be non-negative." },
        { status: 400 },
      );
    }

    const { error } = await verifyPharmacyMembership(pharmacyId);
    if (error) return error;

    const existingCode = await db.medication.findUnique({
      where: {
        code,
      },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: "Medication code already exists." },
        { status: 400 },
      );
    }

    const pharmacy = await db.pharmacy.findUnique({
      where: {
        id: pharmacyId,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found." },
        { status: 404 },
      );
    }

    const medication = await db.medication.create({
      data: {
        code,
        name,
        description,
        pharmacy_id: pharmacyId,
        date_expired: new Date(expiryDate),
        stock: quantity,
        price,
      },
      include: {
        pharmacy: true,
      },
    });

    return NextResponse.json(mapMedicationToInventory(medication), { status: 201 });
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to create inventory item." },
      { status: 500 },
    );
  }
}
