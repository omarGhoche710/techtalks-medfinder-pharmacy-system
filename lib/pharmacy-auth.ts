import { db } from "@/lib/db";
import { getSessionClerkId } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function verifyPharmacyMembership(pharmacyId: string) {
  const clerkId = await getSessionClerkId();

  if (!clerkId) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized — you must be logged in." },
        { status: 401 }
      ),
      user: null,
      membership: null,
    };
  }

  // Step 2: Find user in database by clerkId
  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      ),
      user: null,
      membership: null,
    };
  }

  // Step 3: Check active membership for this pharmacy
  const membership = await db.pharmacyMembership.findFirst({
    where: {
      user_id: user.id,
      pharmacy_id: pharmacyId,
      is_active: true,
    },
  });

  if (!membership) {
    return {
      error: NextResponse.json(
        {
          error: "Forbidden — you are not an active member of this pharmacy.",
        },
        { status: 403 }
      ),
      user: null,
      membership: null,
    };
  }

  // All checks passed
  return { error: null, user, membership };
}