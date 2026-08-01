import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

// =====================================================
// PATCH
// Deactivate Membership
//
// Business Rules:
// - Membership must exist
// - Membership must be active
// - Soft delete by setting is_active = false
// =====================================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // --------------------------------------
    // Find Membership
    // --------------------------------------

    const membership = await db.pharmacyMembership.findUnique({
      where: {
        id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          message: "Membership not found.",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------
    // Already Inactive?
    // --------------------------------------

    if (!membership.is_active) {
      return NextResponse.json(
        {
          message: "Membership is already inactive.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------
    // Deactivate Membership
    // --------------------------------------

    const updatedMembership = await db.pharmacyMembership.update({
      where: {
        id,
      },
      data: {
        is_active: false,
      },
    });

    return NextResponse.json(updatedMembership, {
      status: 200,
    });
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to deactivate membership.",
      },
      {
        status: 500,
      },
    );
  }
}
