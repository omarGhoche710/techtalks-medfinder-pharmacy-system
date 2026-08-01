'use client'

import {
    Store,
    Settings,
    LifeBuoy,
    CircleUserRound,
    HomeIcon,
    Users,
    type LucideIcon,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from './ui/sidebar'
import Link from 'next/link'

/* ─── data ──────────────────────────────────────────────────────────── */

const topItems: { label: string; href: string; icon: LucideIcon }[] = [
    { label: 'Dashboard', href: '/pharmacy/Dashboard', icon: HomeIcon },
    { label: 'Staff',     href: '/pharmacy/Staff',     icon: Users   },
]

const sections: {
    label: string
    icon: LucideIcon
    items: { label: string; href: string }[]
}[] = [
    {
        label: 'Store',
        icon: Store,
        items: [
            { label: 'Inventory',   href: '/pharmacy/Inventory'  },
            { label: 'Near Expiry', href: '/pharmacy/NearExpiry' },
            { label: 'Expired',     href: '/pharmacy/Expired'    },
        ],
    },
    {
        label: 'Account Setting',
        icon: Settings,
        items: [
            { label: 'My Profile', href: '/pharmacy/profile'  },
            { label: 'Security',   href: '/pharmacy/security' },
        ],
    },
    {
        label: 'Help And Support',
        icon: LifeBuoy,
        items: [
            { label: 'Log Out',  href: '/pharmacy/signup'   },
            { label: 'Complain', href: '/pharmacy/complain' },
        ],
    },
]

/* ─── component ──────────────────────────────────────────────────────── */

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar className="border-r border-[#E5E7EB] bg-white">

            {/* Pharmacy identity */}
            <SidebarHeader className="border-b border-[#E5E7EB] px-4 py-[14px]">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]">
                        <CircleUserRound className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[#111827]">Pharmacy name</span>
                </div>
            </SidebarHeader>

            <SidebarContent className="flex flex-col gap-1 overflow-y-auto px-2 py-3">

                {/* Dashboard & Staff — match Photo 3 "Store" style:
                    blue icon + bold dark text, dark-fill when active */}
                {topItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link
                            key={label}
                            href={href}
                            className={[
                                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                                active
                                    ? 'bg-[#111827] text-white'
                                    : 'text-[#111827] hover:bg-[#F3F4F6]',
                            ].join(' ')}
                        >
                            <Icon
                                className={[
                                    'h-[1.1rem] w-[1.1rem] shrink-0 transition-colors',
                                    active
                                        ? 'text-white'
                                        : 'text-[#2563EB] group-hover:text-[#2563EB]',
                                ].join(' ')}
                            />
                            {label}
                        </Link>
                    )
                })}

                {/* Sections */}
                {sections.map(({ label, icon: Icon, items }) => (
                    <div key={label} className="mt-4">

                        {/* Section label — Photo 1: small-caps, gray, with icon */}
                        <div className="mb-1 flex items-center gap-1.5 px-3 py-0.5">
                            <Icon className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#9CA3AF]">
                                {label}
                            </span>
                        </div>

                        {/* Section items */}
                        <div className="flex flex-col gap-0.5">
                            {items.map(({ label: itemLabel, href }) => {
                                const active = pathname === href
                                return (
                                    <Link
                                        key={itemLabel}
                                        href={href}
                                        className={[
                                            'flex items-center rounded-lg py-2 pl-8 pr-3 text-sm transition-colors',
                                            active
                                                ? 'bg-[#111827] font-medium text-white'
                                                : 'font-normal text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]',
                                        ].join(' ')}
                                    >
                                        {itemLabel}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </SidebarContent>

            {/* User avatar */}
            <SidebarFooter className="border-t border-[#E5E7EB] px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-white">
                        N
                    </div>
                    <span className="truncate text-sm text-[#6B7280]">Staff member</span>
                </div>
            </SidebarFooter>

        </Sidebar>
    )
}
