import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

import { InviteStatus, PharmacyRole } from "@/app/generated/prisma/client";

// =====================================================
// POST
// Accept Invitation
// =====================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: token } = await params;

    const body = await req.json();

    const { user_id } = body;

    // --------------------------------------
    // Required Fields
    // --------------------------------------

    if (!user_id) {
      return NextResponse.json(
        {
          message: "User ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // User Exists?
    // --------------------------------------

    const user = await db.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------
    // Invitation Exists?
    // --------------------------------------

    const invitation = await db.invitation.findUnique({
      where: {
        token,
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
    // Invitation Pending?
    // --------------------------------------

    if (invitation.status !== InviteStatus.PENDING) {
      return NextResponse.json(
        {
          message: "Invitation has already been used or cancelled.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Invitation Expired?
    // --------------------------------------

    if (invitation.expires_at < new Date()) {
      return NextResponse.json(
        {
          message: "Invitation has expired.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Membership Already Exists?
    // --------------------------------------

    const existingMembership = await db.pharmacyMembership.findUnique({
      where: {
        user_id_pharmacy_id: {
          user_id,
          pharmacy_id: invitation.pharmacy_id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        {
          message: "User is already a member of this pharmacy.",
        },
        {
          status: 409,
        },
      );
    }

    // --------------------------------------
    // Transaction
    // --------------------------------------

    const result = await db.$transaction(async (tx) => {
      const membership = await tx.pharmacyMembership.create({
        data: {
          user_id,
          pharmacy_id: invitation.pharmacy_id,
          role: invitation.role as PharmacyRole,
          invited_by: invitation.invited_by,
        },
      });

      const updatedInvitation = await tx.invitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          status: InviteStatus.ACCEPTED,
        },
      });

      return {
        membership,
        invitation: updatedInvitation,
      };
    });

    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to accept invitation.",
      },
      {
        status: 500,
      },
    );
  }
}
