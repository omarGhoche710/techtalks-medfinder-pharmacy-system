"use server";

import { db } from "@/lib/db";

// INVITE employee
export async function inviteEmployee(data: {
  pharmacyId: string;
  email: string;
  role: "PHARMACIST" | "EMPLOYEE";
  currentUserId: string;
}) {
  return db.invitation.create({
    data: {
      pharmacy_id: data.pharmacyId,
      invited_email: data.email,
      role: data.role,
      invited_by: data.currentUserId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}

// ACCEPT invitation
export async function acceptInvitation(invitationId: string, userId: string) {
  return db.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) throw new Error("Invitation not found");

    await tx.invitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    });

    const membership = await tx.pharmacyMembership.create({
      data: {
        user_id: userId,
        pharmacy_id: invitation.pharmacy_id,
        role: invitation.role,
        is_active: true,
      },
    });

    return membership;
  });
}

// CANCEL invitation (OWNER only)
export async function cancelInvitation(invitationId: string) {
  return db.invitation.update({
    where: { id: invitationId },
    data: { status: "CANCELLED" },
  });
}

// DELETE employee (OWNER only)
export async function deleteEmployee(
  pharmacyId: string,
  userId: string
) {
  return db.pharmacyMembership.delete({
    where: {
      user_id_pharmacy_id: {
        user_id: userId,
        pharmacy_id: pharmacyId,
      },
    },
  });
}