import { createPharmacy } from "@/lib/database/queries/pharmacy";
import { db } from "@/lib/db";
import { getSessionClerkId } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const clerkId = await getSessionClerkId();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    const result = await createPharmacy({
      ...body,
      userId: user.id,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/pharmacies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}