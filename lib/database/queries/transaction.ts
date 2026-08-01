"use server";

import { db } from "@/lib/db";

// CREATE transaction (DISPENSE guard here)
export async function createTransaction(data: {
  pharmacyId: string;
  medicationId: string;
  type: "STOCK_IN" | "DISPENSE" | "DAMAGE";
  quantity_changed: number;
  currentUserId: string;
}) {
  return db.transaction.create({
    data: {
      pharmacy_id: data.pharmacyId,
      medication_id: data.medicationId,
      type: data.type,
      performed_by: data.currentUserId,
      quantity_changed: data.quantity_changed,
    },
  });
}

// GET transactions for pharmacy
export async function getPharmacyTransactions(pharmacyId: string) {
  return db.transaction.findMany({
    where: { pharmacy_id: pharmacyId },
    include: {
      medication: true,
    },
    orderBy: { created_at: "desc" },
  });
}