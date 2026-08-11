import { test, expect } from "@playwright/test";

type MedicationRecord = {
  id: string;
  status: string;
  discount_percentage: number | null;
  discounted_price: number | null;
};

test.describe("Medication Discount API", () => {
  test("PATCH /api/medications/:id/discount rejects missing discount_percentage", async ({
    request,
  }) => {
    const response = await request.patch(
      "/api/medications/non-existent-uuid/discount",
      { data: {} },
    );
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("between 0 and 100");
  });

  test("PATCH /api/medications/:id/discount rejects negative discount", async ({
    request,
  }) => {
    const response = await request.patch(
      "/api/medications/non-existent-uuid/discount",
      { data: { discount_percentage: -5 } },
    );
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("between 0 and 100");
  });

  test("PATCH /api/medications/:id/discount rejects discount over 100", async ({
    request,
  }) => {
    const response = await request.patch(
      "/api/medications/non-existent-uuid/discount",
      { data: { discount_percentage: 150 } },
    );
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("between 0 and 100");
  });

  test("PATCH /api/medications/:id/discount returns 404 for non-existent medication", async ({
    request,
  }) => {
    const response = await request.patch(
      "/api/medications/non-existent-uuid/discount",
      { data: { discount_percentage: 10 } },
    );
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Medication not found");
  });

  test("PATCH /api/medications/:id/discount rejects non near-expiry medication", async ({
    request,
  }) => {
    const listResponse = await request.get("/api/medications");
    const medications = (await listResponse.json()) as MedicationRecord[];

    const activeMedication = medications.find(
      (med) => med.status !== "NEAR_EXPIRY",
    );
    if (!activeMedication) return;

    const response = await request.patch(
      `/api/medications/${activeMedication.id}/discount`,
      { data: { discount_percentage: 10 } },
    );
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("near-expiry");
  });

  test("PATCH /api/medications/:id/discount applies discount to near-expiry medication", async ({
    request,
  }) => {
    const listResponse = await request.get("/api/medications");
    const medications = (await listResponse.json()) as MedicationRecord[];

    const nearExpiryMedication = medications.find(
      (med) => med.status === "NEAR_EXPIRY",
    );
    if (!nearExpiryMedication) return;

    const response = await request.patch(
      `/api/medications/${nearExpiryMedication.id}/discount`,
      { data: { discount_percentage: 15 } },
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as MedicationRecord;
    expect(body.discount_percentage).toBe(15);
    expect(body.discounted_price).not.toBeNull();
  });
});
