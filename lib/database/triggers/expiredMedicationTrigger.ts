// ============================================
// lib/database/triggers/expiredMedicationTrigger.ts
// ============================================

import { db } from "@/lib/db";

/**
 * Checks for medications that have expired and:
 * 1. Creates ExpiredMedication record
 * 2. Deletes from Medication table (with transaction)
 * 3. Logs to AuditLog
 *
 * Should be called:
 * - Daily via cron job
 * - When viewing medications
 * - After transaction updates
 */
export async function checkAndMoveExpiredMedications(
  pharmacyId?: string
): Promise<{ moved: number; error?: string }> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all medications that have expired
    const expiredMeds = await db.medication.findMany({
      where: {
        date_expired: {
          lt: today, // Less than today
        },
        status: {
          not: "TRANSFERRED", // Don't process already transferred
        },
        ...(pharmacyId && { pharmacy_id: pharmacyId }),
      },
      include: {
        pharmacy: true,
      },
    });

    if (expiredMeds.length === 0) {
      return { moved: 0 };
    }

    // Move each expired medication in a transaction
    await db.$transaction(async (tx) => {
      for (const med of expiredMeds) {
        // 1️⃣ Create ExpiredMedication record
        await tx.expiredMedication.create({
          data: {
            code: med.code,
            name: med.name,
            pharmacy_id: med.pharmacy_id,
            date_expired: med.date_expired,
            disposed_at: null, // Will be set when pharmacist disposes it
          },
        });

        // 2️⃣ Delete from Medication table
        await tx.medication.delete({
          where: { id: med.id },
        });

        // 3️⃣ Create AuditLog for tracking
        await tx.auditLog.create({
          data: {
            user_id: "system", // System action
            action: "AUTO_EXPIRE",
            entity_type: "Medication",
            entity_id: med.id,
            pharmacy_id: med.pharmacy_id,
            details: JSON.stringify({
              code: med.code,
              name: med.name,
              expired_date: med.date_expired,
              moved_at: new Date().toISOString(),
            }),
          },
        });
      }
    });

    console.log(
      `✅ Moved ${expiredMeds.length} expired medications to ExpiredMedication`
    );

    return { moved: expiredMeds.length };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error moving expired medications:", errorMessage);
    return { moved: 0, error: errorMessage };
  }
}

/**
 * Similar to above but for medications approaching expiry (< 30 days)
 * Updates status to NEAR_EXPIRY for discount handling
 */
export async function checkAndUpdateNearExpiryMedications(
  pharmacyId?: string
): Promise<{ updated: number; error?: string }> {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find medications expiring within 30 days
    const nearExpiryMeds = await db.medication.findMany({
      where: {
        date_expired: {
          lte: thirtyDaysFromNow,
          gte: today,
        },
        status: "ACTIVE",
        ...(pharmacyId && { pharmacy_id: pharmacyId }),
      },
    });

    if (nearExpiryMeds.length === 0) {
      return { updated: 0 };
    }

    // Update status to NEAR_EXPIRY and apply auto-discount
    await db.$transaction(async (tx) => {
      for (const med of nearExpiryMeds) {
        const daysUntilExpiry = Math.ceil(
          (med.date_expired.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Auto-apply discount based on days remaining
        let discountPercentage = 10;
        if (daysUntilExpiry <= 7) discountPercentage = 30;
        else if (daysUntilExpiry <= 14) discountPercentage = 20;
        else if (daysUntilExpiry <= 21) discountPercentage = 15;

        const discountedPrice = Number(
          (med.price * (1 - discountPercentage / 100)).toFixed(2)
        );

        await tx.medication.update({
          where: { id: med.id },
          data: {
            status: "NEAR_EXPIRY",
            discount_percentage: discountPercentage,
            discounted_price: discountedPrice,
            is_transferable: true,
            transfer_reason: `Expires in ${daysUntilExpiry} days - ${discountPercentage}% auto-discount applied`,
          },
        });

        // Log the status change
        await tx.auditLog.create({
          data: {
            user_id: "system",
            action: "AUTO_NEAR_EXPIRY",
            entity_type: "Medication",
            entity_id: med.id,
            pharmacy_id: med.pharmacy_id,
            details: JSON.stringify({
              code: med.code,
              name: med.name,
              expires_in_days: daysUntilExpiry,
              auto_discount: discountPercentage,
            }),
          },
        });
      }
    });

    console.log(
      `✅ Updated ${nearExpiryMeds.length} medications to NEAR_EXPIRY status`
    );

    return { updated: nearExpiryMeds.length };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error updating near-expiry medications:", errorMessage);
    return { updated: 0, error: errorMessage };
  }
}

/**
 * Mark expired medication as disposed (when pharmacist physically disposes it)
 */
export async function markMedicationAsDisposed(
  expiredMedicationId: string,
  disposedAt: Date = new Date()
): Promise<void> {
  await db.expiredMedication.update({
    where: { id: expiredMedicationId },
    data: { disposed_at: disposedAt },
  });

  console.log(`✅ Marked expired medication as disposed`);
}