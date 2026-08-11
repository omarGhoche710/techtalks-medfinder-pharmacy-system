import { test, expect } from "@playwright/test";

test.describe("Memberships API", () => {
  test("PATCH /api/memberships/:id/deactivate returns 404 for non-existent id", async ({
    request,
  }) => {
    const response = await request.patch(
      "/api/memberships/non-existent-uuid/deactivate",
    );
    expect(response.status()).toBe(404);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain("Membership not found");
  });
});
