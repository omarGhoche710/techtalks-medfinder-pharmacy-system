
"use server";

import { db } from "@/lib/db";

export async function createUser(user: {
  clerkId: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  photo: string;
}) {
  return db.user.create({ data: user });
}

export async function getUserById(clerkId: string) {
  return db.user.findUnique({ where: { clerkId } });
}

export async function getAllUsers() {
  return db.user.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function updateUser(
  clerkId: string,
  user: {
    firstName?: string | null;
    lastName?: string | null;
    username: string;
    photo: string;
  }
) {
  return db.user.update({
    where: { clerkId },
    data: user,
  });
}

export async function deleteUser(clerkId: string) {
  return db.user.delete({ where: { clerkId } });
}