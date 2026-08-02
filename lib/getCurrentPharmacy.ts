import { db } from "@/lib/db";
import type { Medication } from "@/data/medications";

/**
 * Gets the current user's active pharmacy ID.
 * Tries Clerk auth first; falls back to first pharmacy in DB (demo/dev mode).
 */
export async function getCurrentPharmacyId(): Promise<string | null> {
  try {
    // Try Clerk auth if available
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: clerkId } = await auth();
    if (clerkId) {
      const user = await db.user.findUnique({ where: { clerkId } });
      if (user) {
        const membership = await db.pharmacyMembership.findFirst({
          where: { user_id: user.id, is_active: true },
        });
        if (membership) return membership.pharmacy_id;
      }
    }
  } catch {
    // Clerk not configured or DB not ready — fall through
  }

  try {
    // Demo fallback: use first pharmacy in DB
    const pharmacy = await db.pharmacy.findFirst();
    return pharmacy?.id ?? null;
  } catch {
    // DB not connected yet
    return null;
  }
}

export async function getCurrentPharmacy() {
  const id = await getCurrentPharmacyId();
  if (!id) return null;
  return db.pharmacy.findUnique({ where: { id } });
}

/** Maps a Prisma Medication record to the UI Medication type */
export function mapMedication(m: {
  id: string;
  name: string;
  code: string;
  stock: number;
  status: string;
  price: number;
  date_expired: Date;
  description?: string | null;
  discount_percentage?: number | null;
  discounted_price?: number | null;
}): Medication {
  const statusMap: Record<string, string> = {
    ACTIVE: "active",
    NEAR_EXPIRY: "near expiry",
    DAMAGED: "expired",
    TRANSFERRED: "active",
  };

  return {
    id: m.id,
    name: m.name,
    code: m.code,
    stock: m.stock,
    status: statusMap[m.status] ?? "active",
    price: m.price,
    expiry: new Date(m.date_expired),
    description: m.description ?? "",
    imageColor: "#2563EB",
    discount_percentage: m.discount_percentage,
    discounted_price: m.discounted_price,
  };
}
