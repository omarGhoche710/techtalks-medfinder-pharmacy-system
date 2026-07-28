import { db } from "@/lib/db";
import { MedicationStatus } from "@/app/generated/prisma/client";
import { isNearExpiry } from "@/lib/expiry";

export async function updateNearExpiryMedications() {
  const medications = await db.medication.findMany();

  let updated = 0;

  for (const medication of medications) {
    // Skip medications with special statuses
    if (
      medication.status === MedicationStatus.DAMAGED ||
      medication.status === MedicationStatus.TRANSFERRED
    ) {
      continue;
    }

    const nearExpiry = isNearExpiry(medication.date_expired);

    if (nearExpiry && medication.status !== MedicationStatus.NEAR_EXPIRY) {
      await db.medication.update({
        where: {
          id: medication.id,
        },
        data: {
          status: MedicationStatus.NEAR_EXPIRY,
        },
      });

      updated++;
    }

    if (!nearExpiry && medication.status === MedicationStatus.NEAR_EXPIRY) {
      await db.medication.update({
        where: {
          id: medication.id,
        },
        data: {
          status: MedicationStatus.ACTIVE,
        },
      });

      updated++;
    }
  }

  return {
    total: medications.length,
    updated,
  };
}
