
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getMembershipRole } from './getMembershipRole';
import { redirect } from 'next/navigation';

export async function requirePharmacyAccess(pharmacyId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect('/sign-in');

  const role = await getMembershipRole(user.id, pharmacyId);
  if (!role) redirect('/unauthorized'); 

  return { user, role };
}