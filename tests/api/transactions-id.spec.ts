import { test, expect } from "@playwright/test";

type TransactionDetail = {
  id: string;
  type: string;
  medicationId: string | null;
  medicationName: string | null;
  pharmacyId: string | null;
  pharmacyName: string | null;
  quantity: number;
  performedBy: string | null;
  performedByName: string | null;
  date: string;
};

type TransactionListItem = {
  id: string;
  type: string;
};

test.describe("Transaction by ID API", () => {
  test("GET /api/transactions/:id returns 404 for non-existent id", async ({
    request,
  }) => {
    const response = await request.get("/api/transactions/non-existent-uuid");
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { error: string };
    expect(body.error).toContain("not found");
  });

  test("GET /api/transactions/:id returns transaction when id exists", async ({
    request,
  }) => {
    const listResponse = await request.get("/api/transactions");
    const transactions = (await listResponse.json()) as TransactionListItem[];

    if (transactions.length === 0) return;

    const response = await request.get(
      `/api/transactions/${transactions[0].id}`,
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as TransactionDetail;
    expect(body.id).toBe(transactions[0].id);
    expect(body.type).toBe(transactions[0].type);
    expect(body.date).toBeDefined();
    expect(Number.isNaN(Date.parse(body.date))).toBe(false);
  });

  test("GET /api/transactions/:id returns mapped response shape", async ({
    request,
  }) => {
    const listResponse = await request.get("/api/transactions");
    const transactions = (await listResponse.json()) as TransactionListItem[];

    if (transactions.length === 0) return;

    const response = await request.get(
      `/api/transactions/${transactions[0].id}`,
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as TransactionDetail;
    expect(body).toHaveProperty("medicationId");
    expect(body).toHaveProperty("medicationName");
    expect(body).toHaveProperty("pharmacyId");
    expect(body).toHaveProperty("pharmacyName");
    expect(body).toHaveProperty("quantity");
    expect(body).toHaveProperty("performedBy");
    expect(body).toHaveProperty("performedByName");
  });
});
