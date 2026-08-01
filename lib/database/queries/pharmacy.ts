"use server";

import { db } from "@/lib/db";

// CREATE with transaction
export async function createPharmacy(data: {
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  userId: string;
}) {
  return db.$transaction(async (tx) => {
    const pharmacy = await tx.pharmacy.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        lat: data.lat,
        lng: data.lng,
        created_by: data.userId,
        is_approved: false,
      },
    });

    const membership = await tx.pharmacyMembership.create({
      data: {
        user_id: data.userId,
        pharmacy_id: pharmacy.id,
        role: "OWNER",
        is_active: true,
      },
    });

    return { pharmacy, membership };
  });
}

// READ
export async function getPharmacyById(pharmacyId: string) {
  return db.pharmacy.findUnique({
    where: { id: pharmacyId },
    include: {
      memberships: {
        include: { user: true },
      },
    },
  });
}

// UPDATE
export async function updatePharmacy(
  pharmacyId: string,
  data: {
    name?: string;
    address?: string;
    phone?: string;
    lat?: number;
    lng?: number;
  }
) {
  return db.pharmacy.update({
    where: { id: pharmacyId },
    data,
  });
}

// DELETE
export async function deletePharmacy(pharmacyId: string) {
  return db.pharmacy.delete({
    where: { id: pharmacyId },
  });
}

// Get all pharmacies for a user
export async function getUserPharmacies(userId: string) {
  return db.pharmacyMembership.findMany({
    where: { user_id: userId, is_active: true },
    include: {
      pharmacy: true,
    },
  });
}