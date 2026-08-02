"use client"
import { useState } from "react"
import { AppSidebar } from "@/components/PharmaSidebar"
import { Footer } from "@/components/PharmaFooter"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Check, Lock } from "lucide-react"

export function SecurityPage({ isOwner = true }: { isOwner?: boolean }) {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  function handleSave() {
    setError("")
    if (!current || !next || !confirm) {
      setError("All fields are required.")
      return
    }
    if (next !== confirm) {
      setError("New passwords don't match.")
      return
    }
    if (next.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setSaved(true)
    setCurrent("")
    setNext("")
    setConfirm("")
    setTimeout(() => setSaved(false), 3000)
  }

  const fields = [
    { label: "Current password", value: current, set: setCurrent, show: showCurrent, toggle: () => setShowCurrent((v) => !v) },
    { label: "New password", value: next, set: setNext, show: showNext, toggle: () => setShowNext((v) => !v) },
    { label: "Confirm new password", value: confirm, set: setConfirm, show: showConfirm, toggle: () => setShowConfirm((v) => !v) },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#F9FAFB]">
        <Footer />
        <SidebarTrigger className="m-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-[#EFF6FF]" />

        <div className="flex justify-center px-6 py-8">
          {!isOwner ? (
            <div className="flex flex-col items-center gap-3 text-center py-20">
              <div className="w-14 h-14 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#6B7280]" />
              </div>
              <p className="font-medium text-[#111827]">Access Restricted</p>
              <p className="text-sm text-[#6B7280]">Only the pharmacy owner can change the password.</p>
            </div>
          ) : (
            <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E5E7EB] p-8 space-y-6">
              <h1 className="text-xl font-semibold text-[#111827]">Security</h1>

              {saved && (
                <div className="flex items-center gap-2 rounded-lg bg-[#EFF6FF] border border-[#2563EB]/20 px-4 py-3 text-sm text-[#2563EB]">
                  <Check className="w-4 h-4 shrink-0" />
                  Password updated successfully.
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-[#F7E7E5] border border-[#C4544A]/20 px-4 py-3 text-sm text-[#C4544A]">
                  {error}
                </div>
              )}

              {fields.map(({ label, value, set, show, toggle }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-sm font-medium text-[#111827]">{label}</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 pr-10 text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#2563EB]"
                    >
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              <Button
                onClick={handleSave}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg"
              >
                Update Password
              </Button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
