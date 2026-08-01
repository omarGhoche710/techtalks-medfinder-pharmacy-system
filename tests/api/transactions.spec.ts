import { test, expect } from "@playwright/test";

test.describe("Transactions API", () => {
  test("stock_in increases inventory quantity", async ({ request }) => {
    // Get current quantity first
    const before = await request.get("/api/inventory/1");
    const beforeData = await before.json();
    const startQuantity = beforeData.quantity;

    const response = await request.post("/api/transactions", {
      data: {
        type: "stock_in",
        inventoryId: "1",
        quantity: 20,
        notes: "Playwright test - stock in",
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.updatedInventory.newQuantity).toBe(startQuantity + 20);
  });

  test("dispense decreases inventory quantity", async ({ request }) => {
    const before = await request.get("/api/inventory/2");
    const beforeData = await before.json();
    const startQuantity = beforeData.quantity;

    const response = await request.post("/api/transactions", {
      data: {
        type: "dispense",
        inventoryId: "2",
        quantity: 5,
        notes: "Playwright test - dispense",
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.updatedInventory.newQuantity).toBe(startQuantity - 5);
  });

  test("damage decreases inventory quantity", async ({ request }) => {
    const before = await request.get("/api/inventory/3");
    const beforeData = await before.json();
    const startQuantity = beforeData.quantity;

    const response = await request.post("/api/transactions", {
      data: {
        type: "damage",
        inventoryId: "3",
        quantity: 1,
        notes: "Playwright test - damage",
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.updatedInventory.newQuantity).toBe(startQuantity - 1);
  });

  test("dispense fails when quantity exceeds stock", async ({ request }) => {
    const response = await request.post("/api/transactions", {
      data: {
        type: "dispense",
        inventoryId: "3",
        quantity: 999,
        notes: "Playwright test - insufficient stock",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Not enough stock");
  });

  test("rejects invalid transaction type", async ({ request }) => {
    const response = await request.post("/api/transactions", {
      data: {
        type: "invalid_type",
        inventoryId: "1",
        quantity: 5,
      },
    });

    expect(response.status()).toBe(400);
  });

  test("GET /api/transactions/:id returns a transaction", async ({ request }) => {
    const response = await request.get("/api/transactions/t1");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe("t1");
  });

  test("GET /api/transactions/:id returns 404 for missing transaction", async ({ request }) => {
    const response = await request.get("/api/transactions/t999");
    expect(response.status()).toBe(404);
  });
});