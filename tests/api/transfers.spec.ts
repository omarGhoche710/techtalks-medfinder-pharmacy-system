import { test, expect, type APIRequestContext } from "@playwright/test";

import type { InventoryItem } from "@/lib/inventory-mapper";

type TransferRecord = {
  id: string;
  from_pharmacy_id: string;
  to_pharmacy_id: string;
  medication_id: string;
  quantity: number;
  status: string;
  medication: {
    id: string;
    name: string;
    pharmacy_id: string;
    stock: number;
    is_transferable: boolean;
  };
  fromPharmacy: { id: string; name: string };
  toPharmacy: { id: string; name: string };
};

type MedicationRecord = {
  id: string;
  pharmacy_id: string;
  stock: number;
  is_transferable: boolean;
  name: string;
};

type MatchingResponse = {
  recommended_target: {
    pharmacy_id: string;
    pharmacy_name: string;
    distance_km: number;
    current_stock: number;
    has_same_medication: boolean;
    score: number;
  } | null;
  other_candidates: MatchingResponse["recommended_target"][];
};

async function fetchInventory(request: APIRequestContext): Promise<InventoryItem[]> {
  const response = await request.get("/api/inventory");
  return (await response.json()) as InventoryItem[];
}

async function fetchMedications(request: APIRequestContext): Promise<MedicationRecord[]> {
  const response = await request.get("/api/medications");
  return (await response.json()) as MedicationRecord[];
}

test.describe("Transfers API", () => {
  test("GET /api/transfers returns a list", async ({ request }) => {
    const response = await request.get("/api/transfers");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as TransferRecord[];
    expect(Array.isArray(body)).toBe(true);

    if (body.length > 0) {
      const transfer = body[0];
      expect(transfer.id).toBeDefined();
      expect(transfer.fromPharmacy).toBeDefined();
      expect(transfer.toPharmacy).toBeDefined();
      expect(transfer.medication).toBeDefined();
    }
  });

  test("GET /api/transfers/:id returns 404 for non-existent id", async ({
    request,
  }) => {
    const response = await request.get("/api/transfers/non-existent-uuid");
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { message: string };
    expect(body.message).toBeTruthy();
  });

  test("GET /api/transfers/:id returns a transfer when id exists", async ({
    request,
  }) => {
    const listResponse = await request.get("/api/transfers");
    const transfers = (await listResponse.json()) as TransferRecord[];

    if (transfers.length === 0) return;

    const response = await request.get(`/api/transfers/${transfers[0].id}`);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as TransferRecord;
    expect(body.id).toBe(transfers[0].id);
  });

  test("POST /api/transfers rejects missing required fields", async ({
    request,
  }) => {
    const response = await request.post("/api/transfers", {
      data: { from_pharmacy_id: "a", to_pharmacy_id: "b" },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Missing required fields");
  });

  test("POST /api/transfers rejects same source and destination pharmacy", async ({
    request,
  }) => {
    const response = await request.post("/api/transfers", {
      data: {
        from_pharmacy_id: "same-id",
        to_pharmacy_id: "same-id",
        medication_id: "med-id",
        quantity: 1,
      },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("cannot be the same");
  });

  test("POST /api/transfers returns 404 for non-existent medication", async ({
    request,
  }) => {
    const inventory = await fetchInventory(request);
    if (inventory.length < 2) return;

    const fromPharmacyId = inventory[0].pharmacyId;
    const toPharmacyId =
      inventory.find((item) => item.pharmacyId !== fromPharmacyId)?.pharmacyId ??
      inventory[1].pharmacyId;

    const response = await request.post("/api/transfers", {
      data: {
        from_pharmacy_id: fromPharmacyId,
        to_pharmacy_id: toPharmacyId,
        medication_id: "non-existent-uuid",
        quantity: 1,
      },
    });
    expect(response.status()).toBe(404);
  });

  test("POST /api/transfers rejects medication not at source pharmacy", async ({
    request,
  }) => {
    const inventory = await fetchInventory(request);
    if (inventory.length < 2) return;

    const sourceItem = inventory[0];
    const destinationItem =
      inventory.find((item) => item.pharmacyId !== sourceItem.pharmacyId) ??
      inventory[1];

    const response = await request.post("/api/transfers", {
      data: {
        from_pharmacy_id: destinationItem.pharmacyId,
        to_pharmacy_id: sourceItem.pharmacyId,
        medication_id: sourceItem.medicationId,
        quantity: 1,
      },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("does not belong");
  });

  test("POST /api/transfers rejects quantity exceeding stock", async ({
    request,
  }) => {
    const medications = await fetchMedications(request);
    const transferable = medications.find((med) => med.is_transferable);
    if (!transferable) return;

    const inventory = await fetchInventory(request);
    const destinationPharmacyId = inventory.find(
      (item) => item.pharmacyId !== transferable.pharmacy_id,
    )?.pharmacyId;
    if (!destinationPharmacyId) return;

    const response = await request.post("/api/transfers", {
      data: {
        from_pharmacy_id: transferable.pharmacy_id,
        to_pharmacy_id: destinationPharmacyId,
        medication_id: transferable.id,
        quantity: transferable.stock + 1000,
      },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("exceeds available stock");
  });

  test("POST /api/transfers rejects non-transferable medication", async ({
    request,
  }) => {
    const medications = await fetchMedications(request);
    const nonTransferable = medications.find((med) => !med.is_transferable);
    if (!nonTransferable) return;

    const inventory = await fetchInventory(request);
    const destinationPharmacyId = inventory.find(
      (item) => item.pharmacyId !== nonTransferable.pharmacy_id,
    )?.pharmacyId;
    if (!destinationPharmacyId) return;

    const response = await request.post("/api/transfers", {
      data: {
        from_pharmacy_id: nonTransferable.pharmacy_id,
        to_pharmacy_id: destinationPharmacyId,
        medication_id: nonTransferable.id,
        quantity: 1,
      },
    });
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("not transferable");
  });

  test("GET /api/transfers/matching requires query parameters", async ({
    request,
  }) => {
    const response = await request.get("/api/transfers/matching");
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("required");
  });

  test("GET /api/transfers/matching returns 404 for non-existent pharmacy", async ({
    request,
  }) => {
    const medications = await fetchMedications(request);
    if (medications.length === 0) return;

    const response = await request.get(
      `/api/transfers/matching?pharmacy_id=non-existent-uuid&medication_id=${medications[0].id}`,
    );
    expect(response.status()).toBe(404);
  });

  test("GET /api/transfers/matching returns recommendations for valid input", async ({
    request,
  }) => {
    const medications = await fetchMedications(request);
    if (medications.length === 0) return;

    const medication = medications[0];
    const response = await request.get(
      `/api/transfers/matching?pharmacy_id=${medication.pharmacy_id}&medication_id=${medication.id}`,
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as MatchingResponse;
    expect(body).toHaveProperty("recommended_target");
    expect(Array.isArray(body.other_candidates)).toBe(true);

    if (body.recommended_target) {
      expect(body.recommended_target.pharmacy_id).toBeDefined();
      expect(typeof body.recommended_target.distance_km).toBe("number");
      expect(typeof body.recommended_target.score).toBe("number");
    }
  });

  test("POST /api/transfers/:id/cancel returns 404 for non-existent id", async ({
    request,
  }) => {
    const response = await request.post(
      "/api/transfers/non-existent-uuid/cancel",
    );
    expect(response.status()).toBe(404);
  });

  test("POST /api/transfers/:id/confirm rejects missing user_id", async ({
    request,
  }) => {
    const response = await request.post(
      "/api/transfers/non-existent-uuid/confirm",
      { data: {} },
    );
    expect(response.status()).toBe(400);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("User ID is required");
  });

  test("POST /api/transfers/:id/complete returns 404 for non-existent id", async ({
    request,
  }) => {
    const response = await request.post(
      "/api/transfers/non-existent-uuid/complete",
    );
    expect(response.status()).toBe(404);
  });
});
