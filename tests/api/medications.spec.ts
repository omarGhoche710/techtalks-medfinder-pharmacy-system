import { test, expect } from "@playwright/test";

type MedicationRecord = {
  id: string;
  code: string;
  name: string;
  pharmacy_id: string;
  stock: number;
  price: number;
  pharmacy: {
    id: string;
    name: string;
    address: string;
  };
};

test.describe("Medications API", () => {
  test("GET /api/medications returns a list", async ({ request }) => {
    const response = await request.get("/api/medications");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as MedicationRecord[];
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /api/medications returns correct shape", async ({ request }) => {
    const response = await request.get("/api/medications");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as MedicationRecord[];
    if (body.length === 0) return;

    const medication = body[0];
    expect(medication.id).toBeDefined();
    expect(medication.code).toBeDefined();
    expect(medication.name).toBeDefined();
    expect(medication.pharmacy_id).toBeDefined();
    expect(medication.pharmacy).toBeDefined();
    expect(medication.pharmacy.id).toBeDefined();
    expect(medication.pharmacy.name).toBeDefined();
  });

  test("GET /api/medications/:id returns 404 for non-existent id", async ({
    request,
  }) => {
    const response = await request.get("/api/medications/non-existent-uuid");
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  test("GET /api/medications/:id returns medication when id exists", async ({
    request,
  }) => {
    const listResponse = await request.get("/api/medications");
    const medications = (await listResponse.json()) as MedicationRecord[];

    if (medications.length === 0) return;

    const response = await request.get(
      `/api/medications/${medications[0].id}`,
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as MedicationRecord;
    expect(body.id).toBe(medications[0].id);
    expect(body.pharmacy).toBeDefined();
  });
});
