'use client'

import { useState } from 'react'
import {
    Store,
    Settings,
    LifeBuoy,
    ChevronDown,
    CircleUserRound,
    HomeIcon,
    Users,
    type LucideIcon
} from 'lucide-react'
import { usePathname } from "next/navigation";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import Link from "next/link";

type NavGroup = {
    label: string
    icon: LucideIcon
    items: NavItem[]
}

type NavItem = {
    label: string;
    href: string;
}

const groups: NavGroup[] = [
    {
        label: 'Store',
        icon: Store,
        items: [{ label: 'Inventory', href: '/pharmacy/Inventory' },
        { label: 'Near Expiry', href: '/pharmacy/NearExpiry' }, { label: 'Expired', href: '/pharmacy/Expired' },],
    },
    {
        label: 'Account Setting',
        icon: Settings,
        items: [{ label: 'My Profile', href: '#' }, { label: 'Security', href: '#' }],
    },
    {
        label: 'Help And Support',
        icon: LifeBuoy,
        items: [{ label: 'Log Out', href: '/pharmacy/signup' }, { label: 'Complain', href: '#' }],
    },
]

function NavSection({ group }: { group: NavGroup }) {
    const [open, setOpen] = useState(true)
    const [hovered, setHovered] = useState(false);
    const Icon = group.icon
    const pathname = usePathname();

    return (
        <SidebarGroup style={{ paddingTop: "0.25rem", paddingBottom: "0.25rem" }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    gap: "0.75rem",
                    borderRadius: "0.5rem",
                    paddingLeft: "0.5rem",
                    paddingRight: "0.5rem",
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    textAlign: "left",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#1F2B29",
                    transitionProperty: "color, background-color",
                    transitionDuration: "150ms",
                    backgroundColor: hovered ? "#E1F0EA" : "transparent",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                aria-expanded={open}>
                <Icon color={hovered ? "#145C54" : "#5B6B66"} style={{ width: "20px", height: "20px", transition: "color 150ms" }} />
                <span style={{ flex: 1 }}>{group.label}</span>
                <ChevronDown
                    style={{
                        color: "#5B6B66",
                        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                        width: "18px",
                        height: "18px",
                        transition: "transform 150ms",
                    }}
                />
            </button>

            {open && (
                <ul style={{
                    marginTop: "0.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.125rem",
                    paddingLeft: "0.75rem",
                }}>
                    {group.items.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    aria-current={isActive ? "page" : undefined}
                                    style={{
                                        display: "block",
                                        borderRadius: "0.375rem",
                                        borderWidth: "1px",
                                        borderStyle: "solid",
                                        paddingLeft: "0.75rem",
                                        paddingRight: "0.75rem",
                                        paddingTop: "0.375rem",
                                        paddingBottom: "0.375rem",
                                        fontSize: "0.875rem",
                                        transitionProperty: "color, background-color, border-color, box-shadow",
                                        transitionDuration: "150ms",

                                        borderColor: isActive ? "#145C54" : "transparent",
                                        backgroundColor: isActive ? "#E1F0EA" : "transparent",
                                        fontWeight: isActive ? 500 : undefined,
                                        color: isActive ? "#145C54" : "#5B6B66",
                                        boxShadow: isActive ? "0 1px 2px rgba(20,92,84,0.12)" : undefined,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) e.currentTarget.style.backgroundColor = "#F3F8F5";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </SidebarGroup>
    )
}

export function AppSidebar() {
    return (
        <Sidebar
            style={{
                borderRight: "1px solid #D8E7DF",
                backgroundColor: "#FBFDFC",
            }}>
            <SidebarHeader style={{
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                paddingLeft: "0.5rem",
                paddingRight: "0.5rem",
            }}>
                <CircleUserRound style={{ width: "1.5rem", height: "1.5rem", color: "#145C54" }} />
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#1F2B29" }}>Pharmacy name</span>
            </SidebarHeader>

            <SidebarContent style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <SidebarMenuItem>
                    <SidebarMenuButton style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        borderRadius: "0.375rem",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "#D8E7DF",
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.375rem",
                        paddingBottom: "0.375rem",
                        fontSize: "0.875rem",
                    }}
                    >
                        <HomeIcon style={{ color: "#145C54", width: "20px", height: "20px" }} />
                        <Link href='/pharmacy/Dashboard' style={{ flex: 1 }}>
                            Dashboard
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        borderRadius: "0.375rem",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "#D8E7DF",
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.375rem",
                        paddingBottom: "0.375rem",
                        fontSize: "0.875rem",
                    }}
                    >
                        <Users style={{ color: "#145C54", width: "20px", height: "20px" }} />
                        <Link href='/pharmacy/Staff' style={{ flex: 1 }}>
                            Staff
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>

                {groups.map((group) => (
                    <NavSection key={group.label} group={group} />
                ))}
            </SidebarContent>
            <SidebarFooter></SidebarFooter>
        </Sidebar>
    )
}

/*'use client'

import { useState } from 'react'
import {
    Store,
    Settings,
    LifeBuoy,
    ChevronDown,
    CircleUserRound,
    HomeIcon
} from 'lucide-react'
import { usePathname } from "next/navigation";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import Link from "next/link";

type NavGroup = {
    label: string
    icon: React.ComponentType<{ className?: string }>
    items: NavItem[]
}

type NavItem = {
    label: string;
    href: string;
}

const groups: NavGroup[] = [
    {
        label: 'Store',
        icon: Store,
        items: [{ label: 'Inventory', href: '/pharmacy/Inventory' },
        { label: 'Near Expiry', href: '/pharmacy/NearExpiry' }, { label: 'Expired', href: '/pharmacy/Expired' },],
    },
    {
        label: 'Account Setting',
        icon: Settings,
        items: [{ label: 'My Profile', href: '#' }, { label: 'Security', href: '#' }],
    },
    {
        label: 'Help And Support',
        icon: LifeBuoy,
        items: [{ label: 'Log Out', href: '/pharmacy/signup' }, { label: 'Complain', href: '#' }],
    },
]

function NavSection({ group }: { group: NavGroup }) {
    const [open, setOpen] = useState(true)
    const [hovered, setHovered] = useState(false);
    const Icon = group.icon
    const pathname = usePathname();


    return (
        <SidebarGroup style={{ paddingTop: "0.25rem", paddingBottom: "0.25rem" }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    gap: "0.75rem",
                    borderRadius: "0.5rem",
                    paddingLeft: "0.5rem",
                    paddingRight: "0.5rem",
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    textAlign: "left",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "hsl(var(--foreground))",
                    transitionProperty: "color, background-color",
                    backgroundColor: hovered ? "hsl(var(--muted))" : "transparent",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                aria-expanded={open}>
                <Icon />
                <span style={{
                    flex: 1,
                }}>{group.label}</span>
                <ChevronDown
                    style={{
                        color: "black",
                        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                        width: "24px",
                        height: "24px",
                    }}
                />
            </button>

            {open && (
                <ul style={{
                    marginTop: "0.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.125rem",
                    paddingLeft: "0.75rem",
                }}>
                    {group.items.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    aria-current={isActive ? "page" : undefined}
                                    style={{
                                        display: "block",
                                        borderRadius: "0.375rem",
                                        borderWidth: "1px",
                                        borderStyle: "solid",
                                        paddingLeft: "0.75rem",
                                        paddingRight: "0.75rem",
                                        paddingTop: "0.375rem",
                                        paddingBottom: "0.375rem",
                                        fontSize: "0.875rem",
                                        transitionProperty:
                                            "color, background-color, border-color, box-shadow",

                                        borderColor: isActive
                                            ? "hsl(var(--border))"
                                            : "transparent",

                                        backgroundColor: isActive
                                            ? "hsl(var(--card))"
                                            : "transparent",

                                        fontWeight: isActive ? 500 : undefined,

                                        color: isActive
                                            ? "hsl(var(--foreground))"
                                            : "hsl(var(--muted-foreground))",

                                        boxShadow: isActive
                                            ? "0 1px 2px rgba(0,0,0,0.1)"
                                            : undefined,
                                    }}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </SidebarGroup>
    )
}

export function AppSidebar() {
    return (
        <Sidebar
            style={{
                borderRight: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--background))",
            }}>
            <SidebarHeader style={{
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                paddingLeft: "0.5rem",
                paddingRight: "0.5rem",
            }}>
                <CircleUserRound style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "hsl(var(--muted-foreground))",
                }} />
                <span style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "hsl(var(--foreground))",
                }}>Pharmacy name</span>
            </SidebarHeader>

            <SidebarContent style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
            }}>
                <SidebarMenuItem >
                    <SidebarMenuButton style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        borderRadius: "0.375rem",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.375rem",
                        paddingBottom: "0.375rem",
                        fontSize: "0.875rem",
                    }}
                    >
                        <HomeIcon style={{
                            color: "black",
                            width: "24px",
                            height: "24px",
                        }} />
                        <Link href='/pharmacy/Dashboard'
                        style={{
                            flex: 1,
                        }}>
                            Dashboard
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                {groups.map((group) => (
                    <NavSection key={group.label} group={group} />
                ))}
            </SidebarContent>
            <SidebarFooter>

            </SidebarFooter>
        </Sidebar>
    )
}*/