import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";
import { InviteStatus, PharmacyRole } from "@/app/generated/prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      where: { id: invited_by },
      select: { id: true, username: true },
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
    // Send invitation email
    // --------------------------------------

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/invitations/${token}`;

    await resend.emails.send({
      from: "MedFinder <onboarding@resend.dev>",
      to: invited_email,
      subject: `You've been invited to join ${pharmacy.name} on MedFinder`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #E5E7EB">
          <h2 style="color:#111827;font-size:20px;margin-bottom:8px">You're invited!</h2>
          <p style="color:#6B7280;font-size:15px;line-height:1.6;margin-bottom:24px">
            <strong>${inviter.username}</strong> has invited you to join
            <strong>${pharmacy.name}</strong> on MedFinder as a <strong>${role}</strong>.
          </p>
          <a href="${inviteUrl}"
            style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
            Accept Invitation
          </a>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
            This link expires in 7 days. If you didn't expect this invite, you can ignore this email.
          </p>
        </div>
      `,
    });

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

// =====================================================
// GET
// List Invitations
//
// Query:
// ?pharmacy_id=
//
// Returns all invitations for a pharmacy
// ordered by newest first.
// =====================================================

export async function GET(req: NextRequest) {
  try {
    const pharmacy_id = req.nextUrl.searchParams.get("pharmacy_id");

    // --------------------------------------
    // Validate Query Parameter
    // --------------------------------------

    if (!pharmacy_id) {
      return NextResponse.json(
        {
          message: "pharmacy_id is required.",
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
    // Fetch Invitations
    // --------------------------------------

    const invitations = await db.invitation.findMany({
      where: {
        pharmacy_id,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(invitations, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to fetch invitations.",
      },
      {
        status: 500,
      },
    );
  }
}
