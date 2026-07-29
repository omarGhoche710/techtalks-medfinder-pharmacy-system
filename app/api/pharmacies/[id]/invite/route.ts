import { auth } from "@clerk/nextjs/server";
import { inviteEmployee } from "@/lib/database/queries/invitation";
import { requirePharmacyAccess } from "@/lib/auth/requirePharmacyAccess";
import { NextResponse } from "next/server";
import { getUserById } from "@/lib/database/queries/user";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id: pharmacyId } = await params;

    const { role } = await requirePharmacyAccess(pharmacyId);

    // ✅ Only OWNER can invite
    if (role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const invitation = await inviteEmployee({
      pharmacyId,
      email: body.email,
      role: body.role,
      currentUserId: userId,
    });

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error("POST /api/pharmacies/[id]/invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}