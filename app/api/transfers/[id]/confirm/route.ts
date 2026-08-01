import { NextRequest, NextResponse } from "next/server";
import { sendTransferNotification } from "@/lib/notifications";
import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

import {
  MedicationStatus,
  PharmacyRole,
  TransferStatus,
} from "@/app/generated/prisma/client";

// =====================================================
// POST
// Confirm Transfer
//
// Business Rules:
// - Transfer must exist
// - Transfer must still be PENDING
// - User ID is required
// - User must be an ACTIVE OWNER or PHARMACIST
//   in the destination pharmacy
// - Reassign medication to destination pharmacy
// - Mark medication as TRANSFERRED
// - Update transfer status to CONFIRMED
// - Save confirmation time
// =====================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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
    // Find Transfer
    // --------------------------------------

    const transfer = await db.transfer.findUnique({
      where: {
        id,
      },
      include: {
        medication: true,
        toPharmacy: true,
      },
    });

    if (!transfer) {
      return NextResponse.json(
        {
          message: "Transfer not found.",
        },
        {
          status: 404,
        },
      );
    }
    // --------------------------------------
    // Destination pharmacy must still exist
    // and be approved
    // --------------------------------------

    if (!transfer.toPharmacy) {
      return NextResponse.json(
        {
          message: "Destination pharmacy not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (!transfer.toPharmacy.is_approved) {
      return NextResponse.json(
        {
          message: "Destination pharmacy is unavailable.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Only Pending Transfers Can Be Confirmed
    // --------------------------------------

    if (transfer.status !== TransferStatus.PENDING) {
      return NextResponse.json(
        {
          message: "Only pending transfers can be confirmed.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Verify User Membership
    // User must be OWNER or PHARMACIST
    // in destination pharmacy
    // --------------------------------------

    const membership = await db.pharmacyMembership.findFirst({
      where: {
        user_id,
        pharmacy_id: transfer.to_pharmacy_id,
        is_active: true,
        role: {
          in: [PharmacyRole.OWNER, PharmacyRole.PHARMACIST],
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          message:
            "Only an active OWNER or PHARMACIST of the destination pharmacy can confirm this transfer.",
        },
        {
          status: 403,
        },
      );
    }

    // --------------------------------------
    // Execute Transaction
    // --------------------------------------

    await db.$transaction(async (tx) => {
      // Move medication ownership

      await tx.medication.update({
        where: {
          id: transfer.medication_id,
        },
        data: {
          pharmacy_id: transfer.to_pharmacy_id,
          status: MedicationStatus.TRANSFERRED,
        },
      });

      // Confirm transfer

      await tx.transfer.update({
        where: {
          id,
        },
        data: {
          status: TransferStatus.CONFIRMED,
          confirmed_at: new Date(),
        },
      });
    });

    // --------------------------------------
    // Return Updated Transfer
    // --------------------------------------
    await sendTransferNotification(id, "CONFIRMED");
    const updatedTransfer = await db.transfer.findUnique({
      where: {
        id,
      },
      include: {
        medication: true,
        fromPharmacy: true,
        toPharmacy: true,
      },
    });

    return NextResponse.json(updatedTransfer, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to confirm transfer.",
      },
      {
        status: 500,
      },
    );
  }
}
