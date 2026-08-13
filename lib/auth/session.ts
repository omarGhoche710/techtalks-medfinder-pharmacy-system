import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

const TEST_CLERK_ID_HEADER = "x-test-clerk-id";

function isPlaywrightAuthBypassEnabled() {
  return process.env.PLAYWRIGHT_AUTH_BYPASS === "true";
}

export async function getSessionClerkId(): Promise<string | null> {
  if (isPlaywrightAuthBypassEnabled()) {
    const requestHeaders = await headers();
    const testClerkId = requestHeaders.get(TEST_CLERK_ID_HEADER);
    if (testClerkId) {
      return testClerkId;
    }
  }

  const { userId } = await auth();
  return userId ?? null;
}

export { TEST_CLERK_ID_HEADER };
