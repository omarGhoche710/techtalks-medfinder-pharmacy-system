
import { auth } from "@clerk/nextjs/server";
import { getUserById, updateUser, deleteUser } from "@/lib/database/queries/user";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    const { id } = await params;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (clerkId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingUser = await getUserById(id);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    const updatedUser = await updateUser(id, {
      firstName: body.firstName,
      lastName: body.lastName,
      username: body.username || existingUser.username,
      photo: body.photo || existingUser.photo,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    const { id } = await params;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (clerkId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingUser = await getUserById(id);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const deletedUser = await deleteUser(id);

    return NextResponse.json(
      { message: "User deleted successfully", user: deletedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}