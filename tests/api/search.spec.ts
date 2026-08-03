import { test, expect } from "@playwright/test";

test.describe("Search API", () => {

  // ============================================
  // Basic Search
  // ============================================

  test("GET /api/search returns empty results when no query", async ({ request }) => {
    const response = await request.get("/api/search");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.results).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  test("GET /api/search returns results for valid query", async ({ request }) => {
    const response = await request.get("/api/search?q=a");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.meta).toBeDefined();
    expect(body.meta.query).toBe("a");
  });

  test("GET /api/search returns correct response shape", async ({ request }) => {
    const response = await request.get("/api/search?q=a");
    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.results.length > 0) {
      const result = body.results[0];
      // Check medication object
      expect(result.medication).toBeDefined();
      expect(result.medication.id).toBeDefined();
      expect(result.medication.name).toBeDefined();
      expect(result.medication.price).toBeDefined();
      // Check inventory object
      expect(result.inventory).toBeDefined();
      expect(result.inventory.quantity).toBeDefined();
      expect(result.inventory.stockStatus).toBeDefined();
      // Check pharmacy object
      expect(result.pharmacy).toBeDefined();
      expect(result.pharmacy.id).toBeDefined();
      expect(result.pharmacy.name).toBeDefined();
      expect(result.pharmacy.address).toBeDefined();
    }
  });

  test("GET /api/search returns empty array for unknown medication", async ({ request }) => {
    const response = await request.get("/api/search?q=xyzunknownmed999");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.results).toEqual([]);
    expect(body.meta.total).toBe(0);
  });

  // ============================================
  // Near Me Search
  // ============================================

  test("GET /api/search with nearMe and location returns distanceKm", async ({ request }) => {
    const response = await request.get(
      "/api/search?q=a&nearMe=true&lat=33.8938&lng=35.5018"
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.meta.nearMe).toBe(true);

    if (body.results.length > 0) {
      expect(body.results[0].pharmacy.distanceKm).not.toBeNull();
    }
  });

  test("GET /api/search nearMe results sorted by distance", async ({ request }) => {
    const response = await request.get(
      "/api/search?q=a&nearMe=true&lat=33.8938&lng=35.5018"
    );
    expect(response.status()).toBe(200);
    const body = await response.json();

    const distances = body.results
      .map((r: any) => r.pharmacy.distanceKm)
      .filter((d: any) => d !== null);

    for (let i = 1; i < distances.length; i++) {
      expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
    }
  });

  test("GET /api/search with small radius returns fewer results", async ({ request }) => {
    const broadResponse = await request.get(
      "/api/search?q=a&nearMe=true&lat=33.8938&lng=35.5018&radius=100"
    );
    const narrowResponse = await request.get(
      "/api/search?q=a&nearMe=true&lat=33.8938&lng=35.5018&radius=0.1"
    );

    expect(broadResponse.status()).toBe(200);
    expect(narrowResponse.status()).toBe(200);

    const broadBody = await broadResponse.json();
    const narrowBody = await narrowResponse.json();

    expect(narrowBody.meta.total).toBeLessThanOrEqual(broadBody.meta.total);
  });

  // ============================================
  // Availability Filter
  // ============================================

  test("GET /api/search with available=true returns only in-stock items", async ({ request }) => {
    const response = await request.get("/api/search?q=a&available=true");
    expect(response.status()).toBe(200);
    const body = await response.json();

    body.results.forEach((result: any) => {
      expect(result.inventory.quantity).toBeGreaterThan(0);
      expect(result.inventory.stockStatus).not.toBe("out_of_stock");
    });
  });

  // ============================================
  // Pagination
  // ============================================

  test("GET /api/search pagination returns correct page size", async ({ request }) => {
    const response = await request.get("/api/search?q=a&page=1&pageSize=2");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.results.length).toBeLessThanOrEqual(2);
    expect(body.meta.pageSize).toBe(2);
    expect(body.meta.page).toBe(1);
  });

  test("GET /api/search pagination meta is correct", async ({ request }) => {
    const response = await request.get("/api/search?q=a&page=1&pageSize=2");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.meta.total).toBeDefined();
    expect(body.meta.totalPages).toBeDefined();
    expect(body.meta.totalPages).toBe(
      body.meta.total === 0
        ? 0
        : Math.ceil(body.meta.total / body.meta.pageSize)
    );
  });

  test("GET /api/search page 2 returns different results than page 1", async ({ request }) => {
    const page1 = await request.get("/api/search?q=a&page=1&pageSize=2");
    const page2 = await request.get("/api/search?q=a&page=2&pageSize=2");

    expect(page1.status()).toBe(200);
    expect(page2.status()).toBe(200);

    const body1 = await page1.json();
    const body2 = await page2.json();

    if (body1.results.length > 0 && body2.results.length > 0) {
      expect(body1.results[0].id).not.toBe(body2.results[0].id);
    }
  });

  // ============================================
  // Demand Signal
  // ============================================

  test("GET /api/search result has demandSignal field", async ({ request }) => {
    const response = await request.get("/api/search?q=a");
    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.results.length > 0) {
      const result = body.results[0];
      expect("demandSignal" in result.medication).toBe(true);
      expect(["critical", "low", null]).toContain(result.medication.demandSignal);
    }
  });

});