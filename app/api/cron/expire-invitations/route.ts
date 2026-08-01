import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { handleError } from "@/lib/utils";

// =====================================================
// POST
// Expire Invitations
//
// Marks all pending invitations whose expiration
// date has passed as EXPIRED.
// =====================================================

export async function POST() {
  try {
    const result = await db.invitation.updateMany({
      where: {
        status: "PENDING",
        expires_at: {
          lt: new Date(),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    return NextResponse.json(
      {
        message: "Expired invitations updated successfully.",
        updated: result.count,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    handleError(error);

    return NextResponse.json(
      {
        message: "Failed to update expired invitations.",
      },
      {
        status: 500,
      },
    );
  }
}
