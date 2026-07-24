import type { PrismaClient, Pharmacy, Invitation } from "@/app/generated/prisma/client";
import { faker } from "@faker-js/faker";

/**
 * Seeds the `invitations` table (optional).
 * Each pharmacy gets 1-2 invitations in a random status.
 */
export async function seedInvitations(
  prisma: PrismaClient,
  pharmacies: Pharmacy[]
): Promise<Invitation[]> {
  console.log("🌱 Seeding invitations...");

  const invitations: Invitation[] = [];

  for (const pharmacy of pharmacies) {
    const inviteCount = faker.number.int({ min: 1, max: 2 });

    for (let i = 0; i < inviteCount; i++) {
      const status = faker.helpers.arrayElement([
        "PENDING",
        "ACCEPTED",
        "CANCELLED",
        "EXPIRED",
      ] as const);

      const invitation = await prisma.invitation.create({
        data: {
          pharmacy_id: pharmacy.id,
          invited_email: faker.internet.email(),
          role: faker.helpers.arrayElement(["PHARMACIST", "EMPLOYEE"] as const),
          status,
          invited_by: pharmacy.created_by,
          expires_at: faker.date.soon({ days: 14 }),
        },
      });

      invitations.push(invitation);
    }
  }

  console.log(`✅ Seeded ${invitations.length} invitations`);
  return invitations;
}