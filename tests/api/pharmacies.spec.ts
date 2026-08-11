import { test, expect } from "@playwright/test";

import type { InventoryItem } from "@/lib/inventory-mapper";

type MedicationRecord = {
  id: string;
  pharmacy_id: string;
  status: string;
  stock: number;
  is_transferable: boolean;
  date_expired: string;
};

test.describe("Pharmacies API", () => {
  test("POST /api/pharmacies requires authentication", async ({ request }) => {
    const response = await request.post("/api/pharmacies", {
      data: {
        name: "Test Pharmacy",
        address: "123 Test St",
        lat: 33.8938,
        lng: 35.5018,
        phone: "1234567890",
      },
    });
    expect(response.status()).toBe(401);

    const body = (await response.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  test("GET /api/pharmacies/:id/surplus returns 404 for non-existent pharmacy", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/pharmacies/non-existent-uuid/surplus",
    );
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Pharmacy not found");
  });

  test("GET /api/pharmacies/:id/nearExpiry returns 404 for non-existent pharmacy", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/pharmacies/non-existent-uuid/nearExpiry",
    );
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Pharmacy not found");
  });

  test("GET /api/pharmacies/:id/surplus returns a list for valid pharmacy", async ({
    request,
  }) => {
    const inventoryResponse = await request.get("/api/inventory");
    const inventory = (await inventoryResponse.json()) as InventoryItem[];

    if (inventory.length === 0) return;

    const pharmacyId = inventory[0].pharmacyId;
    const response = await request.get(
      `/api/pharmacies/${pharmacyId}/surplus`,
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as MedicationRecord[];
    expect(Array.isArray(body)).toBe(true);

    body.forEach((medication) => {
      expect(medication.pharmacy_id).toBe(pharmacyId);
      expect(medication.status).toBe("NEAR_EXPIRY");
      expect(medication.is_transferable).toBe(true);
      expect(medication.stock).toBeGreaterThan(0);
    });
  });

  test("GET /api/pharmacies/:id/nearExpiry returns a list for valid pharmacy", async ({
    request,
  }) => {
    const inventoryResponse = await request.get("/api/inventory");
    const inventory = (await inventoryResponse.json()) as InventoryItem[];

    if (inventory.length === 0) return;

    const pharmacyId = inventory[0].pharmacyId;
    const response = await request.get(
      `/api/pharmacies/${pharmacyId}/nearExpiry`,
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as MedicationRecord[];
    expect(Array.isArray(body)).toBe(true);

    body.forEach((medication) => {
      expect(medication.pharmacy_id).toBe(pharmacyId);
      expect(medication.status).toBe("NEAR_EXPIRY");
    });
  });

  test("POST /api/pharmacies/:id/invite requires authentication", async ({
    request,
  }) => {
    const inventoryResponse = await request.get("/api/inventory");
    const inventory = (await inventoryResponse.json()) as InventoryItem[];

    const pharmacyId =
      inventory.length > 0 ? inventory[0].pharmacyId : "non-existent-uuid";

    const response = await request.post(
      `/api/pharmacies/${pharmacyId}/invite`,
      {
        data: {
          email: "test@example.com",
          role: "EMPLOYEE",
        },
      },
    );
    expect([401, 404]).toContain(response.status());
  });
});
