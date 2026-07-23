"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav-links";

function MedFinderLogo() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="3" fill="currentColor" className="text-primary" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect
          key={angle}
          x="14.5"
          y="4"
          width="3"
          height="8"
          rx="1.5"
          fill="currentColor"
          className="text-primary"
          transform={`rotate(${angle} 16 16)`}
        />
      ))}
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-6">
        <MedFinderLogo />
        <Link href="/" className="text-lg font-bold text-gray-900">
          MedFinder
        </Link>
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 p-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2 nav-link ${
              pathname === link.href ? "nav-link-active bg-blue-50" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
