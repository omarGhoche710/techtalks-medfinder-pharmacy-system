import type { APIRequestContext } from "@playwright/test";

import type { InventoryItem } from "@/lib/inventory-mapper";

/** Seeded admin user — owner of the first pharmacy in seed data */
export const TEST_OWNER_CLERK_ID = "clerk_admin_001";

export const TEST_CLERK_ID_HEADER = "x-test-clerk-id";

export function authHeaders(clerkId: string = TEST_OWNER_CLERK_ID) {
  return {
    [TEST_CLERK_ID_HEADER]: clerkId,
  };
}

export function createAuthenticatedRequest(
  request: APIRequestContext,
  clerkId: string = TEST_OWNER_CLERK_ID,
) {
  return {
    get: (url: string, options?: Parameters<APIRequestContext["get"]>[1]) =>
      request.get(url, {
        ...options,
        headers: { ...authHeaders(clerkId), ...options?.headers },
      }),
    post: (url: string, options?: Parameters<APIRequestContext["post"]>[1]) =>
      request.post(url, {
        ...options,
        headers: { ...authHeaders(clerkId), ...options?.headers },
      }),
    patch: (url: string, options?: Parameters<APIRequestContext["patch"]>[1]) =>
      request.patch(url, {
        ...options,
        headers: { ...authHeaders(clerkId), ...options?.headers },
      }),
    delete: (
      url: string,
      options?: Parameters<APIRequestContext["delete"]>[1],
    ) =>
      request.delete(url, {
        ...options,
        headers: { ...authHeaders(clerkId), ...options?.headers },
      }),
  };
}

export async function fetchOwnerPharmacyId(
  request: APIRequestContext,
): Promise<string | null> {
  const response = await request.get("/api/inventory");
  const inventory = (await response.json()) as InventoryItem[];
  return inventory[0]?.pharmacyId ?? null;
}

export async function fetchOwnerInventoryItem(
  request: APIRequestContext,
): Promise<InventoryItem | null> {
  const response = await request.get("/api/inventory");
  const inventory = (await response.json()) as InventoryItem[];
  return inventory[0] ?? null;
}
