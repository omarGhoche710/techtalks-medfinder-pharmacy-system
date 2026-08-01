import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentPharmacyId } from "@/lib/getCurrentPharmacy";

export async function GET() {
  try {
    const pharmacyId = await getCurrentPharmacyId();

    if (!pharmacyId) {
      return NextResponse.json({ error: "No pharmacy found" }, { status: 404 });
    }

    const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });

    const today = new Date();

    const [allMeds, nearExpiry, expired] = await Promise.all([
      db.medication.findMany({
        where: { pharmacy_id: pharmacyId },
        select: { id: true, name: true, stock: true },
      }),
      db.medication.count({
        where: { pharmacy_id: pharmacyId, status: "NEAR_EXPIRY" },
      }),
      db.medication.count({
        where: { pharmacy_id: pharmacyId, date_expired: { lt: today } },
      }),
    ]);

    const outOfStockItems = allMeds
      .filter((m) => m.stock === 0)
      .map((m) => ({ id: m.id, name: m.name }));

    return NextResponse.json({
      pharmacyName: pharmacy?.name ?? "",
      totalMedications: allMeds.length,
      nearExpiryCount: nearExpiry,
      expiredCount: expired,
      outOfStockItems,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
}
