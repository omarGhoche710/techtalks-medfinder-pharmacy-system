import type { PrismaClient, Pharmacy, User } from "@/app/generated/prisma/client";
import { faker } from "@faker-js/faker";

/**
 * Seeds the `pharmacies` table.
 * Generates pharmacies inside Lebanon.
 */
export async function seedPharmacies(
  prisma: PrismaClient,
  users: User[]
): Promise<Pharmacy[]> {
  console.log("🌱 Seeding pharmacies...");

  const owners = users.slice(0, 4); 
  const pharmacies: Pharmacy[] = [];

  for (const owner of owners) {
    const pharmacy = await prisma.pharmacy.create({
      data: {
        name: `${faker.company.name()} Pharmacy`,
        address: faker.location.streetAddress({ useFullAddress: true }),
        phone: faker.phone.number(),

        // Lebanon coordinates
        lat: faker.number.float({
          min: 33.05,
          max: 34.70,
          fractionDigits: 6,
        }),

        lng: faker.number.float({
          min: 35.10,
          max: 36.65,
          fractionDigits: 6,
        }),

        is_approved: faker.datatype.boolean(0.8),
        created_by: owner.id,
      },
    });

    pharmacies.push(pharmacy);
  }

  console.log(`✅ Seeded ${pharmacies.length} pharmacies`);
  return pharmacies;
}