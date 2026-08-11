import type { Prisma } from "@/app/generated/prisma/client";

export type MedicationWithPharmacy = Prisma.MedicationGetPayload<{
  include: { pharmacy: true };
}>;

export type InventoryItem = {
  id: string;
  code: string;
  medicationId: string;
  medicationName: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyLat: number;
  pharmacyLng: number;
  quantity: number;
  price: number;
  expiryDate: string;
  status: string;
  discountPercentage: number | null;
  discountedPrice: number | null;
};

export function mapMedicationToInventory(
  medication: MedicationWithPharmacy,
): InventoryItem {
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
