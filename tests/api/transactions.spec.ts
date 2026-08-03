import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

// We'll store IDs created during tests to use across test cases
let createdMedicationId: string;
let createdPharmacyId: string;
let createdTransactionId: string;

test.describe("Transactions API", () => {

  // ============================================
  // GET /api/transactions
  // ============================================

  test("GET /api/transactions returns a list", async ({ request }) => {
    const response = await request.get("/api/transactions");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /api/transactions filters by type=STOCK_IN", async ({ request }) => {
    const response = await request.get("/api/transactions?type=STOCK_IN");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    body.forEach((t: any) => {
      expect(t.type).toBe("STOCK_IN");
    });
  });

  test("GET /api/transactions filters by type=DISPENSE", async ({ request }) => {
    const response = await request.get("/api/transactions?type=DISPENSE");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    body.forEach((t: any) => {
      expect(t.type).toBe("DISPENSE");
    });
  });

  test("GET /api/transactions filters by type=DAMAGE", async ({ request }) => {
    const response = await request.get("/api/transactions?type=DAMAGE");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    body.forEach((t: any) => {
      expect(t.type).toBe("DAMAGE");
    });
  });

  // ============================================
  // POST /api/transactions — Validation
  // ============================================

  test("POST /api/transactions rejects missing type", async ({ request }) => {
    const response = await request.post("/api/transactions", {
      data: {
        medicationId: "some-id",
        quantity: 5,
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/transactions rejects missing medicationId", async ({ request }) => {
    const response = await request.post("/api/transactions", {
      data: {
        type: "STOCK_IN",
        quantity: 5,
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/transactions rejects invalid transaction type", async ({ request }) => {
    const response = await request.post("/api/transactions", {
      data: {
        type: "INVALID_TYPE",
        medicationId: "some-id",
        quantity: 5,
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/transactions rejects quantity of zero", async ({ request }) => {
    const response = await request.post("/api/transactions", {
      data: {
        type: "STOCK_IN",
        medicationId: "some-id",
        quantity: 0,
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/transactions rejects negative quantity", async ({ request }) => {
    const response = await request.post("/api/transactions", {
      data: {
        type: "STOCK_IN",
        medicationId: "some-id",
        quantity: -5,
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/transactions rejects non-existent medicationId", async ({ request }) => {
    const response = await request.post("/api/transactions", {
      data: {
        type: "STOCK_IN",
        medicationId: "non-existent-uuid",
        quantity: 10,
      },
    });
    // Either 404 (not found) or 401/403 (auth required) — both are valid
    expect([401, 403, 404]).toContain(response.status());
  });

  // ============================================
  // POST /api/transactions — Auth
  // ============================================

  test("POST /api/transactions requires authentication", async ({ request }) => {
    const response = await request.post("/api/transactions", {
      data: {
        type: "STOCK_IN",
        medicationId: "some-id",
        quantity: 10,
      },
    });
    // Should return 401 since we're not logged in during tests
    expect([400, 401]).toContain(response.status());
  });

});