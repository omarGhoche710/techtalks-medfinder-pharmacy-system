import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";
import { haversineKm } from "@/lib/geo";
import { NextRequest, NextResponse } from "next/server";

// Threshold below which a medication is considered low stock
const LOW_STOCK_THRESHOLD = 20;

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const medicationName = params.get("name");
    const pharmacyId = params.get("pharmacyId");
    const lat = Number(params.get("lat"));
    const lng = Number(params.get("lng"));
    const hasLocation =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      (lat !== 0 || lng !== 0);

    // Find all medications that are low stock or out of stock
    const lowStockMeds = await db.medication.findMany({
      where: {
        stock: { lt: LOW_STOCK_THRESHOLD },
        ...(medicationName && {
          name: { contains: medicationName, mode: "insensitive" },
        }),
        ...(pharmacyId && { pharmacy_id: pharmacyId }),
      },
      include: {
        pharmacy: true,
      },
      orderBy: { stock: "asc" },
    });

    // Find all manual demand requests
    const manualRequests = await db.transfer.findMany({
      where: {
        status: "PENDING",
        ...(pharmacyId && { to_pharmacy_id: pharmacyId }),
      },
      include: {
        medication: true,
        toPharmacy: true,
        fromPharmacy: true,
      },
    });

    // Shape auto-detected demand signals
    const autoSignals = lowStockMeds.map((med) => {
      const distanceKm = hasLocation
        ? haversineKm(lat, lng, med.pharmacy.lat, med.pharmacy.lng)
        : null;

      return {
        signalType: "auto",
        urgency: med.stock === 0 ? "critical" : "low",
        pharmacy: {
          id: med.pharmacy.id,
          name: med.pharmacy.name,
          address: med.pharmacy.address,
          lat: med.pharmacy.lat,
          lng: med.pharmacy.lng,
          distanceKm,
        },
        medication: {
          id: med.id,
          name: med.name,
          code: med.code,
          currentStock: med.stock,
          status: med.status,
        },
      };
    });

    // Look up destination-pharmacy stock (transfer.medication is at the source)
    const destinationMedications =
      manualRequests.length > 0
        ? await db.medication.findMany({
            where: {
              OR: manualRequests.map((transfer) => ({
                pharmacy_id: transfer.to_pharmacy_id,
                name: transfer.medication.name,
              })),
            },
          })
        : [];

    const destinationStockByKey = new Map(
      destinationMedications.map((med) => [
        `${med.pharmacy_id}:${med.name}`,
        med,
      ]),
    );

    // Shape manual demand signals from pending transfers
    const manualSignals = manualRequests.map((transfer) => {
      const destinationMedication = destinationStockByKey.get(
        `${transfer.to_pharmacy_id}:${transfer.medication.name}`,
      );

      return {
        signalType: "manual",
        urgency: "requested",
        pharmacy: {
          id: transfer.toPharmacy.id,
          name: transfer.toPharmacy.name,
          address: transfer.toPharmacy.address,
          lat: transfer.toPharmacy.lat,
          lng: transfer.toPharmacy.lng,
          distanceKm: hasLocation
            ? haversineKm(
                lat,
                lng,
                transfer.toPharmacy.lat,
                transfer.toPharmacy.lng,
              )
            : null,
        },
        medication: {
          id: destinationMedication?.id ?? transfer.medication.id,
          name: transfer.medication.name,
          code: transfer.medication.code,
          currentStock: destinationMedication?.stock ?? 0,
          status: destinationMedication?.status ?? transfer.medication.status,
        },
        transfer: {
          id: transfer.id,
          quantity: transfer.quantity,
          reason: transfer.reason,
          requestedFrom: {
            id: transfer.fromPharmacy.id,
            name: transfer.fromPharmacy.name,
          },
        },
      };
    });

    // Combine both signal types
    const allSignals = [...autoSignals, ...manualSignals];

    return NextResponse.json({
      signals: allSignals,
      meta: {
        total: allSignals.length,
        autoDetected: autoSignals.length,
        manualRequests: manualSignals.length,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
      },
    });
  } catch (error) {
    handleError(error);
    return NextResponse.json(
      { error: "Failed to fetch demand signals." },
      { status: 500 }
    );
  }
}