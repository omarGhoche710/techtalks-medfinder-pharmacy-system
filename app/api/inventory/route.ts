import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";
import { getCurrentPharmacyId } from "@/lib/getCurrentPharmacy";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const pharmacyId = searchParams.get("pharmacyId");
    const medicationId = searchParams.get("medicationId");

    const where: any = {};
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
    const body = await request.json();

    const code = body.code?.toString().trim();
    const name = (body.medicationName || body.name)?.toString().trim();
    const description = body.description?.toString().trim() || null;
    // pharmacyId can come from the body or be resolved server-side from auth
    const pharmacyId = body.pharmacyId?.toString().trim() || await getCurrentPharmacyId();
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

    const expiredDate = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiredDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const status = daysUntilExpiry <= 0 ? "DAMAGED" : daysUntilExpiry <= 30 ? "NEAR_EXPIRY" : "ACTIVE";

    const medication = await db.medication.create({
      data: {
        code,
        name,
        description,
        pharmacy_id: pharmacyId,
        date_expired: expiredDate,
        stock: quantity,
        price,
        status,
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
