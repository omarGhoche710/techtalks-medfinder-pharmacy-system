
import { auth } from "@clerk/nextjs/server";
import { createUser, getAllUsers } from "@/lib/database/queries/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await getAllUsers();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.username || !body.photo) {
      return NextResponse.json(
        { error: "Missing required fields: username, photo" },
        { status: 400 }
      );
    }

    const newUser = await createUser({
      clerkId,
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      photo: body.photo,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}