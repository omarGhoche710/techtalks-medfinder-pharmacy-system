import Staff from "@/components/Staff"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { getMembershipRole } from "@/lib/auth/getMembershipRole"
import { getCurrentPharmacyId } from "@/lib/getCurrentPharmacy"

export default async function StaffPage() {
  let isOwner = false
  let pharmacyId: string | null = null
  let dbUserId: string | null = null

  try {
    const { userId: clerkId } = await auth()
    if (clerkId) {
      const [user, pid] = await Promise.all([
        db.user.findUnique({ where: { clerkId } }),
        getCurrentPharmacyId(),
      ])
      pharmacyId = pid
      if (user && pharmacyId) {
        dbUserId = user.id
        const role = await getMembershipRole(user.id, pharmacyId)
        isOwner = role === "OWNER"
      }
    }
  } catch {
    // Auth not configured — default to read-only
  }

  return (
    <div className="container mx-auto pb-10 pt-0">
      <Staff
        isOwner={isOwner}
        pharmacyId={pharmacyId ?? undefined}
        inviterId={dbUserId ?? undefined}
      />
    </div>
  )
}
