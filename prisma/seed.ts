import { PrismaClient } from "@/app/generated/prisma/client";

import { seedUsers } from "./seeders/UserSeeder";
import { seedPharmacies } from "./seeders/PharmacySeeder";
import { seedPharmacyMemberships } from "./seeders/PharmacyMembershipSeeder";
import { seedMedications } from "./seeders/MedicationSeeder";
import { seedTransactions } from "./seeders/TransactionSeeder";
import { seedInvitations } from "./seeders/InvitationSeeder";
import { handleError } from "@/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding...\n");

  // Order matters: each seeder depends on records created by the previous one.
  const users = await seedUsers(prisma);
  const pharmacies = await seedPharmacies(prisma, users);
  const memberships = await seedPharmacyMemberships(prisma, users, pharmacies);
  const medications = await seedMedications(prisma, pharmacies);
  const transactions = await seedTransactions(prisma, medications, memberships);
  const invitations = await seedInvitations(prisma, pharmacies);

  console.log("\n✅ Seeding completed successfully!");
  console.table({
    users: users.length,
    pharmacies: pharmacies.length,
    memberships: memberships.length,
    medications: medications.length,
    transactions: transactions.length,
    invitations: invitations.length,
  });
}

main()
  .catch((error) => {
    handleError(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
