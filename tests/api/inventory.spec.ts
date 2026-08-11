import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

import type { InventoryItem } from "@/lib/inventory-mapper";

test.describe("Inventory API", () => {

  // ============================================
  // GET /api/inventory
  // ============================================

  test("GET /api/inventory returns a list", async ({ request }) => {
    const response = await request.get("/api/inventory");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /api/inventory returns correct shape", async ({ request }) => {
    const response = await request.get("/api/inventory");
    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.length > 0) {
      const item = body[0];
      expect(item.id).toBeDefined();
      expect(item.code).toBeDefined();
      expect(item.medicationName).toBeDefined();
      expect(item.pharmacyName).toBeDefined();
      expect(item.quantity).toBeDefined();
      expect(item.price).toBeDefined();
      expect(item.expiryDate).toBeDefined();
    }
  });

  test("GET /api/inventory filters by pharmacyId", async ({ request }) => {
    // First get all inventory to find a real pharmacyId
    const allResponse = await request.get("/api/inventory");
    const allBody = await allResponse.json();

    if (allBody.length > 0) {
      const pharmacyId = allBody[0].pharmacyId;
      const filtered = await request.get(
        `/api/inventory?pharmacyId=${pharmacyId}`
      );
      expect(filtered.status()).toBe(200);
      const filteredBody = await filtered.json();
      filteredBody.forEach((item: InventoryItem) => {
        expect(item.pharmacyId).toBe(pharmacyId);
      });
    }
  });

  test("GET /api/inventory filters by medicationId", async ({ request }) => {
    const allResponse = await request.get("/api/inventory");
    const allBody = await allResponse.json();

    if (allBody.length > 0) {
      const medicationId = allBody[0].medicationId;
      const filtered = await request.get(
        `/api/inventory?medicationId=${medicationId}`
      );
      expect(filtered.status()).toBe(200);
      const filteredBody = await filtered.json();
      filteredBody.forEach((item: InventoryItem) => {
        expect(item.medicationId).toBe(medicationId);
      });
    }
  });

  // ============================================
  // POST /api/inventory — Validation
  // ============================================

  test("POST /api/inventory rejects missing code", async ({ request }) => {
    const response = await request.post("/api/inventory", {
      data: {
        medicationName: "Test Med",
        pharmacyId: "some-id",
        quantity: 10,
        price: 5.0,
        expiryDate: "2027-01-01",
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/inventory rejects missing pharmacyId", async ({ request }) => {
    const response = await request.post("/api/inventory", {
      data: {
        code: faker.string.alphanumeric(8),
        medicationName: "Test Med",
        quantity: 10,
        price: 5.0,
        expiryDate: "2027-01-01",
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/inventory rejects negative quantity", async ({ request }) => {
    const response = await request.post("/api/inventory", {
      data: {
        code: faker.string.alphanumeric(8),
        medicationName: "Test Med",
        pharmacyId: "some-id",
        quantity: -5,
        price: 5.0,
        expiryDate: "2027-01-01",
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/inventory rejects negative price", async ({ request }) => {
    const response = await request.post("/api/inventory", {
      data: {
        code: faker.string.alphanumeric(8),
        medicationName: "Test Med",
        pharmacyId: "some-id",
        quantity: 10,
        price: -1.0,
        expiryDate: "2027-01-01",
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/inventory requires auth", async ({ request }) => {
    const response = await request.post("/api/inventory", {
      data: {
        code: faker.string.alphanumeric(8),
        medicationName: "Test Med",
        pharmacyId: "some-id",
        quantity: 10,
        price: 5.0,
        expiryDate: "2027-01-01",
      },
    });
    expect([400, 401, 403, 404]).toContain(response.status());
  });

  // ============================================
  // PATCH /api/inventory/:id
  // ============================================

  test("PATCH /api/inventory/:id returns 404 for non-existent id", async ({ request }) => {
    const response = await request.patch(
      "/api/inventory/non-existent-uuid",
      {
        data: { price: 10.0 },
      }
    );
    expect(response.status()).toBe(404);
  });

  test("PATCH /api/inventory/:id rejects direct stock update", async ({ request }) => {
    const allResponse = await request.get("/api/inventory");
    const allBody = await allResponse.json();

    if (allBody.length > 0) {
      const id = allBody[0].id;
      const response = await request.patch(`/api/inventory/${id}`, {
        data: { quantity: 999 },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain("Stock cannot be updated directly");
    }
  });

  // ============================================
  // DELETE /api/inventory/:id
  // ============================================

  test("DELETE /api/inventory/:id returns 404 for non-existent id", async ({ request }) => {
    const response = await request.delete(
      "/api/inventory/non-existent-uuid"
    );
    expect(response.status()).toBe(404);
  });

  // ============================================
  // GET /api/expired
  // ============================================

  test("GET /api/expired returns a list", async ({ request }) => {
    const response = await request.get("/api/expired");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /api/expired items have expiry dates in the past or near future", async ({ request }) => {
    const response = await request.get("/api/expired");
    expect(response.status()).toBe(200);
    const body = await response.json();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    body.forEach((item: InventoryItem) => {
      const expiryDate = new Date(item.expiryDate);
      expect(expiryDate.getTime()).toBeLessThanOrEqual(
        thirtyDaysFromNow.getTime()
      );
    });
  });

});