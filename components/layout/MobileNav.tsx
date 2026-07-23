"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav-links";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <ul className="grid grid-cols-4 gap-1 px-2 py-2">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`flex flex-col items-center rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                pathname === link.href
                  ? "text-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>{link.label.split(" ").slice(-1)[0]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
