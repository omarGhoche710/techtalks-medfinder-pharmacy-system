import { test, expect } from "@playwright/test";

import type { InventoryItem } from "@/lib/inventory-mapper";

type InvitationRecord = {
  id: string;
  pharmacy_id: string;
  invited_email: string;
  role: string;
  status: string;
  token: string;
  invited_by: string;
};

test.describe("Invitations API", () => {
  test("GET /api/invitations requires pharmacy_id", async ({ request }) => {
    const response = await request.get("/api/invitations");
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("pharmacy_id is required");
  });

  test("GET /api/invitations returns 404 for non-existent pharmacy", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/invitations?pharmacy_id=non-existent-uuid",
    );
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Pharmacy not found");
  });

  test("GET /api/invitations returns a list for valid pharmacy", async ({
    request,
  }) => {
    const inventoryResponse = await request.get("/api/inventory");
    const inventory = (await inventoryResponse.json()) as InventoryItem[];

    if (inventory.length === 0) return;

    const pharmacyId = inventory[0].pharmacyId;
    const response = await request.get(
      `/api/invitations?pharmacy_id=${pharmacyId}`,
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as InvitationRecord[];
    expect(Array.isArray(body)).toBe(true);

    body.forEach((invitation) => {
      expect(invitation.pharmacy_id).toBe(pharmacyId);
      expect(invitation.invited_email).toBeDefined();
      expect(invitation.status).toBeDefined();
    });
  });

  test("POST /api/invitations rejects missing required fields", async ({
    request,
  }) => {
    const response = await request.post("/api/invitations", {
      data: { pharmacy_id: "some-id", invited_email: "test@example.com" },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Missing required fields");
  });

  test("POST /api/invitations rejects invalid role", async ({ request }) => {
    const response = await request.post("/api/invitations", {
      data: {
        pharmacy_id: "some-id",
        invited_email: "test@example.com",
        role: "INVALID_ROLE",
        invited_by: "user-id",
      },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Invalid pharmacy role");
  });

  test("POST /api/invitations returns 404 for non-existent pharmacy", async ({
    request,
  }) => {
    const response = await request.post("/api/invitations", {
      data: {
        pharmacy_id: "non-existent-uuid",
        invited_email: "test@example.com",
        role: "EMPLOYEE",
        invited_by: "user-id",
      },
    });
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Pharmacy not found");
  });

  test("POST /api/invitations returns 404 for non-existent inviter", async ({
    request,
  }) => {
    const inventoryResponse = await request.get("/api/inventory");
    const inventory = (await inventoryResponse.json()) as InventoryItem[];

    if (inventory.length === 0) return;

    const response = await request.post("/api/invitations", {
      data: {
        pharmacy_id: inventory[0].pharmacyId,
        invited_email: "test@example.com",
        role: "EMPLOYEE",
        invited_by: "non-existent-uuid",
      },
    });
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Inviting user not found");
  });

  test("PATCH /api/invitations/:id/cancel rejects missing owner_id", async ({
    request,
  }) => {
    const response = await request.patch(
      "/api/invitations/non-existent-uuid/cancel",
      { data: {} },
    );
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Owner ID is required");
  });

  test("PATCH /api/invitations/:id/cancel returns 404 for non-existent invitation", async ({
    request,
  }) => {
    const response = await request.patch(
      "/api/invitations/non-existent-uuid/cancel",
      { data: { owner_id: "owner-id" } },
    );
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Invitation not found");
  });

  test("POST /api/invitations/:id/accept rejects missing user_id", async ({
    request,
  }) => {
    const response = await request.post(
      "/api/invitations/non-existent-token/accept",
      { data: {} },
    );
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("User ID is required");
  });

  test("POST /api/invitations/:id/accept returns 404 for non-existent token", async ({
    request,
  }) => {
    const transactionsResponse = await request.get("/api/transactions");
    const transactions = (await transactionsResponse.json()) as {
      performedBy: string | null;
    }[];

    const userId = transactions.find((tx) => tx.performedBy)?.performedBy;
    if (!userId) return;

    const response = await request.post(
      "/api/invitations/non-existent-token/accept",
      { data: { user_id: userId } },
    );
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Invitation not found");
  });
});
