
import { db } from '@/lib/db';
import type { PharmacyRole } from '@/app/generated/prisma/client';

export async function getMembershipRole(
  userId: string,
  pharmacyId: string
): Promise<PharmacyRole | null> {
  const membership = await db.pharmacyMembership.findUnique({
    where: {
      user_id_pharmacy_id: {
        user_id: userId,
        pharmacy_id: pharmacyId,
      },
    },
  });

  if (!membership || !membership.is_active) return null;

  return membership.role;
}