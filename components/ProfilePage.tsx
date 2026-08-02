"use client"
import { useState, useRef } from "react"
import { AppSidebar } from "@/components/PharmaSidebar"
import { Footer } from "@/components/PharmaFooter"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Camera, Check } from "lucide-react"

const ROLES = ["Owner", "Pharmacist", "Assistant"]

export function ProfilePage({ isOwner = true }: { isOwner?: boolean }) {
  const [name, setName] = useState("Pharmacy Staff")
  const [role, setRole] = useState("Pharmacist")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setAvatar(URL.createObjectURL(file))
  }

  function handleRoleChange(r: string) {
    if (r !== role) {
      setPendingRole(r)
      setShowConfirm(true)
    }
  }

  function confirmRoleChange() {
    if (pendingRole) setRole(pendingRole)
    setPendingRole(null)
    setShowConfirm(false)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#F9FAFB]">
        <Footer />
        <SidebarTrigger className="m-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-[#EFF6FF]" />

        <div className="flex justify-center px-6 py-8">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E5E7EB] p-8 space-y-6">
            <h1 className="text-xl font-semibold text-[#111827]">My Profile</h1>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-2xl font-semibold overflow-hidden cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white border border-[#E5E7EB] rounded-full p-1.5 shadow-sm hover:bg-[#F9FAFB] transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-[#2563EB]" />
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <p className="text-xs text-[#6B7280]">Click to change photo</p>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#111827]">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#111827]">Role</label>
              {isOwner ? (
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] bg-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#6B7280] bg-[#F3F4F6]">
                  {role}
                </div>
              )}
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" /> Saved
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Role change confirmation dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 w-80 space-y-4 shadow-lg">
              <h2 className="font-semibold text-[#111827]">Change Role</h2>
              <p className="text-sm text-[#6B7280]">
                Are you sure you want to change your role to{" "}
                <strong className="text-[#111827]">{pendingRole}</strong>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPendingRole(null)
                    setShowConfirm(false)
                  }}
                  className="flex-1 rounded-lg border border-[#E5E7EB] py-2 text-sm text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRoleChange}
                  className="flex-1 rounded-lg bg-[#2563EB] py-2 text-sm text-white hover:bg-[#1D4ED8] transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
