import { test, expect } from "@playwright/test";

type HealthResponse = {
  status: string;
  timestamp: string;
};

test.describe("Health API", () => {
  test("GET /api/health returns ok status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as HealthResponse;
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
