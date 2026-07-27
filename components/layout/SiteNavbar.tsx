"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav-links";

function MedFinderLogo() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="3" fill="currentColor" className="text-[var(--primary)]" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect
          key={angle}
          x="14.5"
          y="4"
          width="3"
          height="8"
          rx="1.5"
          fill="currentColor"
          className="text-[var(--primary)]"
          transform={`rotate(${angle} 16 16)`}
        />
      ))}
    </svg>
  );
}

export default function SiteNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <MedFinderLogo />
          <span className="text-lg font-bold text-gray-900">MedFinder</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "nav-link-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/search"
          className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
          aria-label="Go to search"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
        </Link>
      </div>
    </header>
  );
}
