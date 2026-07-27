/* eslint-disable camelcase */

import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import {
  createUser,
  updateUser,
  deleteUser,
  getUserById,
} from "@/lib/database/queries/user";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get Svix headers
  const headerPayload = await headers();

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // IMPORTANT: Keep raw body for Svix verification
  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);

    return new Response("Invalid signature", {
      status: 401,
    });
  }

  const eventType = evt.type;

  console.log(`Webhook received: ${eventType}`);

  // CREATE USER
  if (eventType === "user.created") {
    const {
      id,
      image_url,
      first_name,
      last_name,
      username,
    } = evt.data;

    const user = {
      clerkId: id,
      username: username || `user_${id.slice(0, 8)}`,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    };

    const newUser = await createUser(user);

    return NextResponse.json({
      message: "User created",
      user: newUser,
    });
  }

  // UPDATE USER
  if (eventType === "user.updated") {
    const {
      id,
      image_url,
      first_name,
      last_name,
      username,
    } = evt.data;

    const user = {
      firstName: first_name,
      lastName: last_name,
      username: username || `user_${id.slice(0, 8)}`,
      photo: image_url,
    };

    const updatedUser = await updateUser(id, user);

    return NextResponse.json({
      message: "User updated",
      user: updatedUser,
    });
  }

  // DELETE USER
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    const deletedUser = await deleteUser(id!);

    return NextResponse.json({
      message: "User deleted",
      user: deletedUser,
    });
  }

  // BACKFILL: session.created for a user that doesn't exist yet in our DB
  // (e.g. their user.created event fired before this webhook was configured,
  // or that delivery failed). Fetch the profile from Clerk and create it.
  if (eventType === "session.created") {
    const sessionUserId = evt.data.user_id;

    const existingUser = await getUserById(sessionUserId);

    if (!existingUser) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(sessionUserId);

      const newUser = await createUser({
        clerkId: clerkUser.id,
        username:
          clerkUser.username || `user_${clerkUser.id.slice(0, 8)}`,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        photo: clerkUser.imageUrl,
      });

      console.log(`Backfilled missing user from session.created: ${newUser.clerkId}`);

      return NextResponse.json({
        message: "User backfilled from session",
        user: newUser,
      });
    }
  }

  console.log(`Unhandled webhook event: ${eventType}`);

  return NextResponse.json({
    message: "Webhook received",
  });
}