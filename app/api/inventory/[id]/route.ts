import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";
// stock_delta and discount fields are accepted in addition to the existing fields

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
    const stockDelta = body.stock_delta !== undefined ? Number(body.stock_delta) : undefined;
    const price = body.price !== undefined ? Number(body.price) : undefined;
    const expiryDate = body.expiryDate?.toString().trim();
    const discountPercentage = body.discount_percentage !== undefined ? Number(body.discount_percentage) : undefined;

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

    // stock_delta: relative adjustment (positive = stock in, negative = dispense)
    if (stockDelta !== undefined && !Number.isNaN(stockDelta)) {
      data.stock = { increment: stockDelta };
    }

    // discount fields
    if (discountPercentage !== undefined && !Number.isNaN(discountPercentage)) {
      data.discount_percentage = discountPercentage;
      // recompute discounted price from current price
      const currentPrice = medication.price;
      data.discounted_price = discountPercentage === 0
        ? null
        : Math.round(currentPrice * (1 - discountPercentage / 100) * 100) / 100;
    }

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
