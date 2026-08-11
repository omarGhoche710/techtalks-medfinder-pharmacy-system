import { test, expect } from "@playwright/test";

test.describe("Users API", () => {
  test("GET /api/users requires authentication", async ({ request }) => {
    const response = await request.get("/api/users");
    expect(response.status()).toBe(401);

    const body = (await response.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  test("POST /api/users requires authentication", async ({ request }) => {
    const response = await request.post("/api/users", {
      data: {
        username: "testuser",
        photo: "https://example.com/photo.png",
      },
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/users rejects missing fields when unauthenticated", async ({
    request,
  }) => {
    const response = await request.post("/api/users", {
      data: { username: "testuser" },
    });
    expect([400, 401]).toContain(response.status());
  });

  test("GET /api/users/:id returns 404 for non-existent id", async ({
    request,
  }) => {
    const response = await request.get("/api/users/non-existent-uuid");
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { error: string };
    expect(body.error).toContain("not found");
  });
});
