"use server"

import { db } from "@/lib/db";

type CreatePharmacyInput = {
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  userId: string;
};

export const createPharmacy = async (data: CreatePharmacyInput) => {
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
};