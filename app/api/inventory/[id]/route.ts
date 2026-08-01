import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";
import { verifyPharmacyMembership } from "@/lib/pharmacy-auth";

function mapMedicationToInventory(medication: any) {
  return {
    id: medication.id,
    code: medication.code,
    medicationId: medication.id,
    medicationName: medication.name,
    pharmacyId: medication.pharmacy_id,
    pharmacyName: medication.pharmacy.name,
    pharmacyAddress: medication.pharmacy.address,
    pharmacyLat: medication.pharmacy.lat,
    pharmacyLng: medication.pharmacy.lng,
    quantity: medication.stock,
    price: medication.price,
    expiryDate: medication.date_expired.toISOString(),
    status: medication.status,
    discountPercentage: medication.discount_percentage,
    discountedPrice: medication.discounted_price,
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const code = body.code?.toString().trim();
    const name = (body.medicationName || body.name)?.toString().trim();
    const description = body.description === undefined ? undefined : body.description?.toString().trim() || null;
    const quantity = body.quantity !== undefined ? Number(body.quantity) : undefined;
    const price = body.price !== undefined ? Number(body.price) : undefined;
    const expiryDate = body.expiryDate?.toString().trim();

    if (code && code.length === 0) {
      return NextResponse.json(
        { error: "code cannot be empty." },
        { status: 400 },
      );
    }

    if (quantity !== undefined && (Number.isNaN(quantity) || quantity < 0)) {
      return NextResponse.json(
        { error: "quantity must be a non-negative number." },
        { status: 400 },
      );
    }

    if (price !== undefined && (Number.isNaN(price) || price < 0)) {
      return NextResponse.json(
        { error: "price must be a non-negative number." },
        { status: 400 },
      );
    }

    // Block direct stock changes — must use /api/transactions instead
if (quantity !== undefined) {
  return NextResponse.json(
    {
      error: "Stock cannot be updated directly. Use POST /api/transactions with type STOCK_IN, DISPENSE, or DAMAGE to adjust stock. This ensures every stock movement is recorded.",
    },
    { status: 400 }
  );
}

// Find medication first to get pharmacyId
    const medication = await db.medication.findUnique({
      where: { id },
      include: { pharmacy: true },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found." },
        { status: 404 },
      );
    }

    if (code) {
      const existingCode = await db.medication.findUnique({ where: { code } });
      if (existingCode && existingCode.id !== id) {
        return NextResponse.json(
          { error: "Medication code already exists." },
          { status: 400 },
        );
      }
    }

    const data: any = {};
    if (code) data.code = code;
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (quantity !== undefined) data.stock = quantity;
    if (price !== undefined) data.price = price;
    if (expiryDate) data.date_expired = new Date(expiryDate);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 },
      );
    }

    const updatedMedication = await db.medication.update({
      where: { id },
      data,
      include: { pharmacy: true },
    });

    return NextResponse.json(mapMedicationToInventory(updatedMedication));
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to update inventory item." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const medication = await db.medication.findUnique({
      where: { id },
      include: { pharmacy: true },
    });

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found." },
        { status: 404 },
      );
    }

    // Verify the user is an active member of this pharmacy
    const { error } = await verifyPharmacyMembership(medication.pharmacy_id);
    if (error) return error;

    const deletedMedication = await db.medication.delete({
      where: { id },
      include: { pharmacy: true },
    });

    return NextResponse.json(mapMedicationToInventory(deletedMedication));
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to delete inventory item." },
      { status: 500 },
    );
  }
}
