import { test, expect } from "@playwright/test";

type DemandSignal = {
  signalType: "auto" | "manual";
  urgency: string;
  pharmacy: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    distanceKm: number | null;
  };
  medication: {
    id: string;
    name: string;
    code: string;
    currentStock: number;
    status: string;
  };
  transfer?: {
    id: string;
    quantity: number;
    reason: string | null;
    requestedFrom: {
      id: string;
      name: string;
    };
  };
};

type DemandResponse = {
  signals: DemandSignal[];
  meta: {
    total: number;
    autoDetected: number;
    manualRequests: number;
    lowStockThreshold: number;
  };
};

test.describe("Demand API", () => {
  test("GET /api/demand returns signals and meta", async ({ request }) => {
    const response = await request.get("/api/demand");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as DemandResponse;
    expect(Array.isArray(body.signals)).toBe(true);
    expect(body.meta).toBeDefined();
    expect(body.meta.total).toBe(body.signals.length);
    expect(body.meta.autoDetected + body.meta.manualRequests).toBe(
      body.meta.total,
    );
    expect(body.meta.lowStockThreshold).toBe(20);
  });

  test("GET /api/demand auto signals have correct shape", async ({ request }) => {
    const response = await request.get("/api/demand");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as DemandResponse;
    const autoSignals = body.signals.filter((s) => s.signalType === "auto");

    autoSignals.forEach((signal) => {
      expect(["critical", "low"]).toContain(signal.urgency);
      expect(signal.pharmacy.id).toBeDefined();
      expect(signal.medication.currentStock).toBeLessThan(20);
      expect(signal.transfer).toBeUndefined();
    });
  });

  test("GET /api/demand manual signals include transfer details", async ({
    request,
  }) => {
    const response = await request.get("/api/demand");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as DemandResponse;
    const manualSignals = body.signals.filter((s) => s.signalType === "manual");

    manualSignals.forEach((signal) => {
      expect(signal.urgency).toBe("requested");
      expect(signal.transfer).toBeDefined();
      expect(signal.transfer?.requestedFrom.id).toBeDefined();
      expect(signal.transfer?.requestedFrom.name).toBeDefined();
      expect(typeof signal.medication.currentStock).toBe("number");
    });
  });

  test("GET /api/demand filters by pharmacyId", async ({ request }) => {
    const allResponse = await request.get("/api/demand");
    expect(allResponse.status()).toBe(200);
    const allBody = (await allResponse.json()) as DemandResponse;

    if (allBody.signals.length === 0) return;

    const pharmacyId = allBody.signals[0].pharmacy.id;
    const filteredResponse = await request.get(
      `/api/demand?pharmacyId=${pharmacyId}`,
    );
    expect(filteredResponse.status()).toBe(200);

    const filteredBody = (await filteredResponse.json()) as DemandResponse;
    filteredBody.signals.forEach((signal) => {
      expect(signal.pharmacy.id).toBe(pharmacyId);
    });
  });

  test("GET /api/demand with location returns distanceKm", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/demand?lat=33.8938&lng=35.5018",
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as DemandResponse;
    if (body.signals.length > 0) {
      expect(body.signals[0].pharmacy.distanceKm).not.toBeNull();
    }
  });

  test("GET /api/demand filters by medication name", async ({ request }) => {
    const response = await request.get("/api/demand?name=a");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as DemandResponse;
    body.signals
      .filter((signal) => signal.signalType === "auto")
      .forEach((signal) => {
        expect(signal.medication.name.toLowerCase()).toContain("a");
      });
  });
});
