import type { PrismaClient, Pharmacy, Medication } from "@/app/generated/prisma/client";
import { faker } from "@faker-js/faker";

const MEDICATION_NAMES = [
  "Paracetamol 500mg",
  "Amoxicillin 250mg",
  "Ibuprofen 400mg",
  "Omeprazole 20mg",
  "Metformin 500mg",
  "Atorvastatin 10mg",
  "Cetirizine 10mg",
  "Azithromycin 500mg",
  "Losartan 50mg",
  "Vitamin D3 1000IU",
];

/**
 * Seeds the `medications` table.
 * Every pharmacy gets the same catalog of medications with randomized
 * stock, pricing, discounts, and expiry-driven status.
 * Uses `upsert` on `code` so the seeder is safely re-runnable.
 */
export async function seedMedications(
  prisma: PrismaClient,
  pharmacies: Pharmacy[]
): Promise<Medication[]> {
  console.log("🌱 Seeding medications...");

  const medications: Medication[] = [];

  for (const pharmacy of pharmacies) {
    for (const name of MEDICATION_NAMES) {
      const price = faker.number.float({ min: 2, max: 60, fractionDigits: 2 });
      const hasDiscount = faker.datatype.boolean(0.3);
      const discountPercentage = hasDiscount
        ? faker.number.int({ min: 5, max: 30 })
        : null;
      const discountedPrice =
        hasDiscount && discountPercentage !== null
          ? Number((price * (1 - discountPercentage / 100)).toFixed(2))
          : null;

      const expiryDate = faker.date.future({ years: 2 });
      const isNearExpiry =
        expiryDate.getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30; // < 30 days

      const code = `${pharmacy.id.slice(0, 8)}-${name.split(" ")[0].toUpperCase()}`;

      const medication = await prisma.medication.upsert({
        where: { code },
        update: {},
        create: {
          pharmacy_id: pharmacy.id,
          code,
          name,
          description: faker.commerce.productDescription(),
          date_expired: expiryDate,
          stock: faker.number.int({ min: 0, max: 500 }),
          price,
          discount_percentage: discountPercentage,
          discounted_price: discountedPrice,
          status: isNearExpiry ? "NEAR_EXPIRY" : "ACTIVE",
          is_transferable: faker.datatype.boolean(0.4),
        },
      });

      medications.push(medication);
    }
  }

  console.log(`✅ Seeded ${medications.length} medications`);
  return medications;
}