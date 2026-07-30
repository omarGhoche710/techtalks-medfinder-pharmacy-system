// ============================================
// app/api/cron/check-expired-medications/route.ts
// ============================================

import { NextRequest, NextResponse } from "next/server";
import {
  checkAndMoveExpiredMedications,
  checkAndUpdateNearExpiryMedications,
} from "@/lib/database/triggers/expiredMedicationTrigger";

/**
 * Cron endpoint to check for expired medications
 *
 * Set up in Vercel:
 * 1. Go to Vercel Dashboard → Project Settings → Cron Jobs
 * 2. Add: /api/cron/check-expired-medications
 * 3. Schedule: 0 0 * * * (Daily at midnight)
 * 4. Add secret: CRON_SECRET in .env
 *
 * Or use external service like EasyCron
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🔄 Starting expired medication check...");

    // 1️⃣ Update medications approaching expiry (< 30 days)
    const nearExpiryResult = await checkAndUpdateNearExpiryMedications();
    console.log(`📊 Near-expiry updated: ${nearExpiryResult.updated}`);

    // 2️⃣ Move expired medications to ExpiredMedication table
    const expiredResult = await checkAndMoveExpiredMedications();
    console.log(`📊 Expired moved: ${expiredResult.moved}`);

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        results: {
          nearExpiryUpdated: nearExpiryResult.updated,
          expiredMoved: expiredResult.moved,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Optional: Manual POST trigger (for testing or admin panel)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pharmacyId, secret } = body;

    // Verify secret
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🔄 Manual expired medication check started...");

    const nearExpiryResult = await checkAndUpdateNearExpiryMedications(pharmacyId);
    const expiredResult = await checkAndMoveExpiredMedications(pharmacyId);

    return NextResponse.json(
      {
        success: true,
        results: {
          nearExpiryUpdated: nearExpiryResult.updated,
          expiredMoved: expiredResult.moved,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}