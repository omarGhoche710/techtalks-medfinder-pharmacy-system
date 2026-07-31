import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";
import { InviteStatus, PharmacyRole } from "@/app/generated/prisma/client";

// =====================================================
// POST
// Create Invitation
// =====================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { pharmacy_id, invited_email, role, invited_by } = body;

    // --------------------------------------
    // Required Fields
    // --------------------------------------

    if (!pharmacy_id || !invited_email || !role || !invited_by) {
      return NextResponse.json(
        {
          message: "Missing required fields.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Validate Role
    // --------------------------------------

    if (!Object.values(PharmacyRole).includes(role)) {
      return NextResponse.json(
        {
          message: "Invalid pharmacy role.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Pharmacy Exists?
    // --------------------------------------

    const pharmacy = await db.pharmacy.findUnique({
      where: {
        id: pharmacy_id,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        {
          message: "Pharmacy not found.",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------
    // Inviting User Exists?
    // --------------------------------------

    const inviter = await db.user.findUnique({
      where: {
        id: invited_by,
      },
    });

    if (!inviter) {
      return NextResponse.json(
        {
          message: "Inviting user not found.",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------
    // Is Inviter OWNER of this Pharmacy?
    // --------------------------------------

    const membership = await db.pharmacyMembership.findUnique({
      where: {
        user_id_pharmacy_id: {
          user_id: invited_by,
          pharmacy_id,
        },
      },
    });

    if (!membership || membership.role !== PharmacyRole.OWNER) {
      return NextResponse.json(
        {
          message: "Only the pharmacy owner can send invitations.",
        },
        {
          status: 403,
        },
      );
    }

    // --------------------------------------
    // Existing Pending Invitation?
    // --------------------------------------

    const existingInvitation = await db.invitation.findFirst({
      where: {
        pharmacy_id,
        invited_email,
        status: InviteStatus.PENDING,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        {
          message: "A pending invitation already exists for this email.",
        },
        {
          status: 409,
        },
      );
    }

    // --------------------------------------
    // Generate Token
    // --------------------------------------

    const token = crypto.randomUUID();

    // --------------------------------------
    // Expiration Date (7 Days)
    // --------------------------------------

    const expires_at = new Date();

    expires_at.setDate(expires_at.getDate() + 7);

    // --------------------------------------
    // Create Invitation
    // --------------------------------------

    const invitation = await db.invitation.create({
      data: {
        pharmacy_id,
        invited_email,
        role,
        invited_by,
        token,
        expires_at,
        status: InviteStatus.PENDING,
      },
    });

    // --------------------------------------
    // Email Placeholder
    // --------------------------------------

    console.log(`Invitation Link:\nhttp://localhost:3000/invitations/${token}`);

    // --------------------------------------
    // Success
    // --------------------------------------

    return NextResponse.json(invitation, {
      status: 201,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to create invitation.",
      },
      {
        status: 500,
      },
    );
  }
}
