import type {
  PrismaClient,
  Pharmacy,
  User,
  PharmacyMembership,
} from "@/app/generated/prisma/client";
import { faker } from "@faker-js/faker";

/**
 * Seeds the `pharmacy_memberships` table.
 * - Creates an OWNER membership for the pharmacy creator.
 * - Assigns 2-3 random staff members (PHARMACIST / EMPLOYEE) per pharmacy.
 * Uses `upsert` on the composite unique key [user_id, pharmacy_id].
 */
export async function seedPharmacyMemberships(
  prisma: PrismaClient,
  users: User[],
  pharmacies: Pharmacy[]
): Promise<PharmacyMembership[]> {
  console.log("🌱 Seeding pharmacy memberships...");

  const memberships: PharmacyMembership[] = [];
  const staffPool = users.slice(4); // remaining users used as staff

  for (const pharmacy of pharmacies) {
    // Owner membership
    const ownerMembership = await prisma.pharmacyMembership.upsert({
      where: {
        user_id_pharmacy_id: {
          user_id: pharmacy.created_by,
          pharmacy_id: pharmacy.id,
        },
      },
      update: {},
      create: {
        user_id: pharmacy.created_by,
        pharmacy_id: pharmacy.id,
        role: "OWNER",
        is_active: true,
      },
    });
    memberships.push(ownerMembership);

    // 2-3 random staff members per pharmacy
    const staffCount = faker.number.int({ min: 2, max: 3 });
    const staffMembers = faker.helpers.arrayElements(staffPool, staffCount);

    for (const staff of staffMembers) {
      const role = faker.helpers.arrayElement(["PHARMACIST", "EMPLOYEE"] as const);

      const membership = await prisma.pharmacyMembership.upsert({
        where: {
          user_id_pharmacy_id: {
            user_id: staff.id,
            pharmacy_id: pharmacy.id,
          },
        },
        update: {},
        create: {
          user_id: staff.id,
          pharmacy_id: pharmacy.id,
          role,
          is_active: true,
          invited_by: pharmacy.created_by,
        },
      });
      memberships.push(membership);
    }
  }

  console.log(`✅ Seeded ${memberships.length} pharmacy memberships`);
  return memberships;
}