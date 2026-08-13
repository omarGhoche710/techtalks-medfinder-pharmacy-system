import { test, expect } from "@playwright/test";

test.describe("Cron API", () => {
  test("GET /api/cron/check-expired-medications rejects unauthorized requests", async ({
    request,
  }) => {
    const response = await request.get("/api/cron/check-expired-medications");
    expect(response.status()).toBe(401);

    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("Unauthorized");
  });

  test("GET /api/cron/check-expired-medications rejects invalid bearer token", async ({
    request,
  }) => {
    const response = await request.get("/api/cron/check-expired-medications", {
      headers: {
        Authorization: "Bearer invalid-secret",
      },
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/cron/check-expired-medications rejects missing secret", async ({
    request,
  }) => {
    const response = await request.post("/api/cron/check-expired-medications", {
      data: {},
    });
    expect(response.status()).toBe(401);

    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("Unauthorized");
  });

  test("GET /api/cron/check-expired-medications succeeds with valid secret", async ({
    request,
  }) => {
    const cronSecret = process.env.CRON_SECRET;
    test.skip(!cronSecret, "CRON_SECRET is not configured");

    const response = await request.get("/api/cron/check-expired-medications", {
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });
    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      success: boolean;
      results: {
        nearExpiryUpdated: number;
        expiredMoved: number;
      };
    };
    expect(body.success).toBe(true);
    expect(body.results).toBeDefined();
  });
});
