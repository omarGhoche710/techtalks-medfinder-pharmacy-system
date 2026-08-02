"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AcceptInviteButton({ token, userId }: { token: string; userId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleAccept() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Failed to accept invitation")
      router.push("/pharmacy/Dashboard")
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full rounded-xl bg-[#2563EB] text-white py-3 font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-60"
      >
        {loading ? "Accepting…" : "Accept Invitation"}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  )
}
