"use client"
import { useState } from "react"
import { AppSidebar } from "@/components/PharmaSidebar"
import { Footer } from "@/components/PharmaFooter"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Check, MessageSquare } from "lucide-react"

export function ComplainPage() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!message.trim()) return
    // TODO: when backend is ready, POST complaint to API or send to zeinabissa741@gmail.com
    setSubmitted(true)
  }

  function handleNew() {
    setSubject("")
    setMessage("")
    setSubmitted(false)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#F9FAFB]">
        <Footer />
        <SidebarTrigger className="m-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-[#EFF6FF]" />

        <div className="flex justify-center px-6 py-8">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E5E7EB] p-8">
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                  <Check className="w-7 h-7 text-[#2563EB]" />
                </div>
                <h2 className="text-xl font-semibold text-[#111827]">Complaint Received</h2>
                <p className="text-sm text-[#6B7280] max-w-xs">
                  Thank you for reaching out. Your complaint has been recorded and will be reviewed by our team.
                </p>
                <button
                  onClick={handleNew}
                  className="mt-2 text-sm text-[#2563EB] hover:underline"
                >
                  Submit another complaint
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#2563EB]" />
                  <h1 className="text-xl font-semibold text-[#111827]">Submit a Complaint</h1>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#111827]">
                    Subject{" "}
                    <span className="text-[#6B7280] font-normal">(optional)</span>
                  </label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Issue with inventory sync"
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] placeholder:text-[#6B7280]/60 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#111827]">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your complaint in detail..."
                    rows={6}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] placeholder:text-[#6B7280]/60 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg disabled:opacity-50"
                >
                  Submit Complaint
                </Button>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
