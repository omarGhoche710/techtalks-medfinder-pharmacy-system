import { auth } from "@clerk/nextjs/server";
import { deleteEmployee } from "@/lib/database/queries/invitation";
import { requirePharmacyAccess } from "@/lib/auth/requirePharmacyAccess";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: pharmacyId, userId } = await params;
    const { role } = await requirePharmacyAccess(pharmacyId);

    // ✅ Only OWNER can delete employees
    if (role !== "OWNER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteEmployee(pharmacyId, userId);

    return NextResponse.json(
      { message: "Employee deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/pharmacies/[id]/employees/[userId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}