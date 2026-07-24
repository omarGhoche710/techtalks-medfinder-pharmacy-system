import type { PrismaClient, Pharmacy, User } from "@/app/generated/prisma/client";
import { faker } from "@faker-js/faker";

/**
 * Seeds the `pharmacies` table.
 * The first few users are treated as pharmacy owners (`created_by`).
 */
export async function seedPharmacies(
  prisma: PrismaClient,
  users: User[]
): Promise<Pharmacy[]> {
  console.log("🌱 Seeding pharmacies...");

  const owners = users.slice(0, 4); // first 4 users act as pharmacy owners
  const pharmacies: Pharmacy[] = [];

  for (const owner of owners) {
    const pharmacy = await prisma.pharmacy.create({
      data: {
        name: `${faker.company.name()} Pharmacy`,
        address: faker.location.streetAddress({ useFullAddress: true }),
        phone: faker.phone.number(),
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
        is_approved: faker.datatype.boolean(0.8),
        created_by: owner.id,
      },
    });
    pharmacies.push(pharmacy);
  }

  console.log(`✅ Seeded ${pharmacies.length} pharmacies`);
  return pharmacies;
}