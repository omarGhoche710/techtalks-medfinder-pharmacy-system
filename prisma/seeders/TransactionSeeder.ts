import type {
  PrismaClient,
  Medication,
  PharmacyMembership,
  Transaction,
} from "@/app/generated/prisma/client";
import { faker } from "@faker-js/faker";

/**
 * Seeds the `transactions` table.
 * Each medication gets 1-3 transactions performed by a random member
 * of that medication's pharmacy.
 * NOTE: no unique constraint exists on Transaction, so re-running this
 * seeder will insert additional rows rather than upserting.
 */
export async function seedTransactions(
  prisma: PrismaClient,
  medications: Medication[],
  memberships: PharmacyMembership[]
): Promise<Transaction[]> {
  console.log("🌱 Seeding transactions...");

  const transactions: Transaction[] = [];

  const membersByPharmacy = new Map<string, PharmacyMembership[]>();
  for (const m of memberships) {
    const list = membersByPharmacy.get(m.pharmacy_id) ?? [];
    list.push(m);
    membersByPharmacy.set(m.pharmacy_id, list);
  }

  for (const medication of medications) {
    const pharmacyMembers = membersByPharmacy.get(medication.pharmacy_id) ?? [];
    if (pharmacyMembers.length === 0) continue;

    const transactionCount = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < transactionCount; i++) {
      const performer = faker.helpers.arrayElement(pharmacyMembers);
      const type = faker.helpers.arrayElement([
        "STOCK_IN",
        "DISPENSE",
        "DAMAGE",
      ] as const);

      const quantity =
        type === "STOCK_IN"
          ? faker.number.int({ min: 10, max: 200 })
          : -faker.number.int({ min: 1, max: 20 });

      const transaction = await prisma.transaction.create({
        data: {
          medication_id: medication.id,
          pharmacy_id: medication.pharmacy_id,
          performed_by: performer.user_id,
          type,
          quantity_changed: quantity,
        },
      });

      transactions.push(transaction);
    }
  }

  console.log(`✅ Seeded ${transactions.length} transactions`);
  return transactions;
}