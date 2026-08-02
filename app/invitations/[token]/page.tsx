import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import AcceptInviteButton from "./AcceptInviteButton"

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const invitation = await db.invitation.findUnique({
    where: { token },
    include: { pharmacy: true },
  })

  if (!invitation) {
    return <ErrorPage message="This invitation link is invalid or has already been used." />
  }

  if (invitation.status !== "PENDING") {
    return (
      <ErrorPage
        message={`This invitation has already been ${invitation.status.toLowerCase()}.`}
      />
    )
  }

  if (invitation.expires_at < new Date()) {
    return (
      <ErrorPage message="This invitation has expired. Please ask the pharmacy owner to send a new one." />
    )
  }

  // Check if current user is logged in
  let dbUserId: string | null = null
  try {
    const { userId: clerkId } = await auth()
    if (clerkId) {
      const user = await db.user.findUnique({ where: { clerkId } })
      dbUserId = user?.id ?? null
    }
  } catch {
    // Clerk not configured — guest view
  }

  return (
    <div className="min-h-screen bg-[#EFF6FF] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#111827] mb-2">You're invited!</h1>
        <p className="text-[#6B7280] mb-6">
          You've been invited to join{" "}
          <span className="font-semibold text-[#111827]">{invitation.pharmacy.name}</span> on
          MedFinder as a{" "}
          <span className="font-semibold text-[#2563EB]">{invitation.role}</span>.
        </p>

        {dbUserId ? (
          // Logged in — show accept button
          <AcceptInviteButton token={token} userId={dbUserId} />
        ) : (
          // Guest — send to login/signup
          <div className="space-y-3">
            <p className="text-sm text-[#6B7280] mb-4">
              Sign in or create an account to accept this invitation.
            </p>
            <a
              href={`/pharmacy/login?next=/invitations/${token}`}
              className="block w-full rounded-xl bg-[#2563EB] text-white py-3 font-medium hover:bg-[#1D4ED8] transition-colors"
            >
              Sign in
            </a>
            <a
              href={`/pharmacy/signup?next=/invitations/${token}`}
              className="block w-full rounded-xl border border-[#E5E7EB] text-[#111827] py-3 font-medium hover:bg-[#F3F4F6] transition-colors"
            >
              Create account
            </a>
          </div>
        )}

        <p className="text-xs text-[#9CA3AF] mt-6">
          Sent to {invitation.invited_email}. Expires{" "}
          {invitation.expires_at.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          .
        </p>
      </div>
    </div>
  )
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#EFF6FF] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#C4544A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#111827] mb-2">Invitation unavailable</h1>
        <p className="text-[#6B7280]">{message}</p>
        <a
          href="/pharmacy/login"
          className="inline-block mt-6 text-[#2563EB] text-sm hover:underline"
        >
          Go to login →
        </a>
      </div>
    </div>
  )
}
