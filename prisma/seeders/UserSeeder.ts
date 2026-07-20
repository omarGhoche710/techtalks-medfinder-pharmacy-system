import type { PrismaClient, User } from "@/app/generated/prisma/client";
import { faker } from "@faker-js/faker";

/**
 * Seeds the `users` table.
 * Uses `upsert` on `clerkId` so the seeder is safely re-runnable.
 */
export async function seedUsers(prisma: PrismaClient): Promise<User[]> {
  console.log("🌱 Seeding users...");

  const usersData = [
    {
      clerkId: "clerk_admin_001",
      role: "ADMIN" as const,
      username: "admin",
      firstName: "Ahmed",
      lastName: "Khalil",
      photo: faker.image.avatar(),
    },
    ...Array.from({ length: 9 }).map(() => ({
      clerkId: `clerk_${faker.string.alphanumeric(12)}`,
      role: "USER" as const,
      username: faker.internet.username(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      photo: faker.image.avatar(),
    })),
  ];

  const users: User[] = [];

  for (const data of usersData) {
    const user = await prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: {},
      create: data,
    });
    users.push(user);
  }

  console.log(`✅ Seeded ${users.length} users`);
  return users;
}