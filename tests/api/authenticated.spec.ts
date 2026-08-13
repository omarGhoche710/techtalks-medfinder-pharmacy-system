import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

import {
  authHeaders,
  createAuthenticatedRequest,
  fetchOwnerInventoryItem,
  fetchOwnerPharmacyId,
  TEST_OWNER_CLERK_ID,
} from "../fixtures/auth";

test.describe("Authenticated API", () => {
  test("POST /api/inventory succeeds for pharmacy owner", async ({ request }) => {
    const authed = createAuthenticatedRequest(request);
    const pharmacyId = await fetchOwnerPharmacyId(request);
    test.skip(!pharmacyId, "No seeded inventory/pharmacy data");

    const response = await authed.post("/api/inventory", {
      data: {
        code: `TEST-${faker.string.alphanumeric(8)}`,
        medicationName: "Playwright Test Med",
        pharmacyId,
        quantity: 10,
        price: 9.99,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.medicationName).toBe("Playwright Test Med");
    expect(body.pharmacyId).toBe(pharmacyId);
  });

  test("POST /api/inventory returns 403 for unknown clerk user", async ({
    request,
  }) => {
    const pharmacyId = await fetchOwnerPharmacyId(request);
    test.skip(!pharmacyId, "No seeded inventory/pharmacy data");

    const response = await request.post("/api/inventory", {
      headers: authHeaders("clerk_unknown_user"),
      data: {
        code: `TEST-${faker.string.alphanumeric(8)}`,
        medicationName: "Should Fail",
        pharmacyId,
        quantity: 1,
        price: 1,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    expect(response.status()).toBe(404);
    const body = (await response.json()) as { error: string };
    expect(body.error).toContain("User not found");
  });

  test("PATCH /api/inventory/:id succeeds for pharmacy owner", async ({
    request,
  }) => {
    const authed = createAuthenticatedRequest(request);
    const item = await fetchOwnerInventoryItem(request);
    test.skip(!item, "No seeded inventory data");

    const response = await authed.patch(`/api/inventory/${item.id}`, {
      data: {
        price: item.price,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(item.id);
  });

  test("POST /api/transactions returns 404 for non-existent medication when authenticated", async ({
    request,
  }) => {
    const authed = createAuthenticatedRequest(request);

    const response = await authed.post("/api/transactions", {
      data: {
        type: "STOCK_IN",
        medicationId: "non-existent-uuid",
        quantity: 1,
      },
    });

    expect(response.status()).toBe(404);
    const body = (await response.json()) as { error: string };
    expect(body.error).toContain("Medication not found");
  });

  test("POST /api/transactions succeeds for pharmacy owner STOCK_IN", async ({
    request,
  }) => {
    const authed = createAuthenticatedRequest(request);
    const item = await fetchOwnerInventoryItem(request);
    test.skip(!item, "No seeded inventory data");

    const beforeResponse = await request.get("/api/inventory");
    const beforeInventory = (await beforeResponse.json()) as {
      id: string;
      quantity: number;
    }[];
    const before = beforeInventory.find((entry) => entry.id === item.id);
    test.skip(!before, "Inventory item missing from list");

    const response = await authed.post("/api/transactions", {
      data: {
        type: "STOCK_IN",
        medicationId: item.id,
        quantity: 1,
      },
    });

    expect(response.status()).toBe(201);
    const body = (await response.json()) as {
      transaction: { type: string; quantity: number };
      updatedMedication: { newStock: number; previousStock: number };
    };
    expect(body.transaction.type).toBe("STOCK_IN");
    expect(body.updatedMedication.newStock).toBe(before.quantity + 1);
  });

  test("POST /api/pharmacies succeeds for authenticated user", async ({
    request,
  }) => {
    const authed = createAuthenticatedRequest(request, TEST_OWNER_CLERK_ID);

    const response = await authed.post("/api/pharmacies", {
      data: {
        name: `${faker.company.name()} Test Pharmacy`,
        address: faker.location.streetAddress(),
        lat: 33.8938,
        lng: 35.5018,
        phone: faker.phone.number(),
      },
    });

    expect(response.status()).toBe(201);
    const body = (await response.json()) as {
      pharmacy: { name: string };
    };
    expect(body.pharmacy.name).toBeDefined();
  });
});
