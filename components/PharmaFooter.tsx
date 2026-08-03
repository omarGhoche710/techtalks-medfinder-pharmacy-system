import Link from "next/link";
import { CircleUserRound } from "lucide-react";

export function Footer() {
  return (
    <header className="border-b border-[#E5E7EB] bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-[#111827]">MedFinder</span>
        <Link
          href="/pharmacy/profile"
          className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] hover:bg-[#F3F4F6] transition-colors"
        >
          <CircleUserRound className="w-4 h-4 text-[#2563EB]" />
          Profile
        </Link>
      </div>
    </header>
  )
}
