import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

import { InviteStatus, PharmacyRole } from "@/app/generated/prisma/client";

// =====================================================
// PATCH
// Cancel Invitation
// =====================================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const { owner_id } = body;

    // --------------------------------------
    // Required Fields
    // --------------------------------------

    if (!owner_id) {
      return NextResponse.json(
        {
          message: "Owner ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Invitation Exists?
    // --------------------------------------

    const invitation = await db.invitation.findUnique({
      where: {
        id,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        {
          message: "Invitation not found.",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------
    // Invitation Must Be Pending
    // --------------------------------------

    if (invitation.status !== InviteStatus.PENDING) {
      return NextResponse.json(
        {
          message: "Only pending invitations can be cancelled.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Verify Owner Membership
    // --------------------------------------

    const membership = await db.pharmacyMembership.findFirst({
      where: {
        user_id: owner_id,
        pharmacy_id: invitation.pharmacy_id,
        role: PharmacyRole.OWNER,
        is_active: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          message: "Only the pharmacy owner can cancel invitations.",
        },
        {
          status: 403,
        },
      );
    }

    // --------------------------------------
    // Cancel Invitation
    // --------------------------------------

    const updatedInvitation = await db.invitation.update({
      where: {
        id,
      },
      data: {
        status: InviteStatus.CANCELLED,
      },
    });

    return NextResponse.json(updatedInvitation, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to cancel invitation.",
      },
      {
        status: 500,
      },
    );
  }
}
