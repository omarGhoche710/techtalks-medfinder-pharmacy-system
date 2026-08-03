import { useState } from "react";
import { Package, AlertTriangle, XCircle, PackageX, ArrowRight, Users } from "lucide-react";

type OutOfStockItem = { id: string; name: string };

interface DashboardProps {
    pharmacyName: string;
    totalMedications: number;
    nearExpiryCount: number;
    expiredCount: number;
    outOfStockItems: OutOfStockItem[];
    onNavigate: (page: "pharmacy/Inventory" | "pharmacy/NearExpiry" | "pharmacy/Expired" | "pharmacy/Staff") => void;
}

export default function Dashboard({
    pharmacyName,
    totalMedications,
    nearExpiryCount,
    expiredCount,
    outOfStockItems,
    onNavigate,
}: DashboardProps) {
    return (
        <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Top row: welcome + stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Welcome card */}
                    <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-[#2563EB] text-white p-8 md:p-10 flex flex-col justify-between min-h-[280px]">
                        <div className="max-w-md">
                            <p className="text-sm uppercase tracking-wide text-[#BFDBFE] mb-2">
                                MedFinder for pharmacies
                            </p>
                            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                                Welcome back, {pharmacyName}
                            </h1>
                            <p className="mt-3 text-[#DBEAFE] text-sm md:text-base">
                                Here's what's happening in your inventory today.
                            </p>
                        </div>
                        <PharmacistBear className="absolute top-4 right-4 w-28 h-28 md:w-36 md:h-36" />
                    </div>

                    {/* Stats rail */}
                    <div className="flex flex-col gap-4">
                        <StatCard
                            icon={<Package className="w-5 h-5" />}
                            label="Medications in inventory"
                            value={totalMedications}
                            tone="teal"
                        />
                        <StatCard
                            icon={<AlertTriangle className="w-5 h-5" />}
                            label="Near expiry"
                            value={nearExpiryCount}
                            tone="amber"
                        />
                        <StatCard
                            icon={<XCircle className="w-5 h-5" />}
                            label="Expired"
                            value={expiredCount}
                            tone="coral"
                        />
                    </div>
                </div>

                {/* Out of stock callout — only shows if there's something to say */}
                {outOfStockItems.length > 0 && (
                    <div className="rounded-2xl bg-white border border-[#E4C9C5] p-5 flex items-start gap-4">
                        <div className="rounded-full bg-[#F7E7E5] p-2.5 text-[#C4544A] shrink-0">
                            <PackageX className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-[#111827]">
                                {outOfStockItems.length} medication{outOfStockItems.length > 1 ? "s" : ""} out of stock
                            </p>
                            <p className="text-sm text-[#6B7280] mt-0.5">
                                {outOfStockItems.slice(0, 4).map((m) => m.name).join(", ")}
                                {outOfStockItems.length > 4 && ` and ${outOfStockItems.length - 4} more`}
                            </p>
                        </div>
                        <button
                            onClick={() => onNavigate("pharmacy/Inventory")}
                            className="text-sm font-medium text-[#2563EB] hover:underline shrink-0 self-center"
                        >
                            Restock
                        </button>
                    </div>
                )}

                {/* Page shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ActionCard
                        icon={<Package className="w-6 h-6" />}
                        title="Inventory"
                        description="View, add, and manage every medication your pharmacy carries."
                        tone="teal"
                        onClick={() => onNavigate("pharmacy/Inventory")}
                    />
                    <ActionCard
                        icon={<AlertTriangle className="w-6 h-6" />}
                        title="Near expiry"
                        description="Medications expiring soon, so you can discount or return them in time."
                        tone="amber"
                        onClick={() => onNavigate("pharmacy/NearExpiry")}
                    />
                    <ActionCard
                        icon={<XCircle className="w-6 h-6" />}
                        title="Expired"
                        description="Stock past its expiry date that needs to be pulled from shelves."
                        tone="coral"
                        onClick={() => onNavigate("pharmacy/Expired")}
                    />
                    <ActionCard
                        icon={<Users className="w-6 h-6" />}
                        title="Staff"
                        description="Invite team members and manage who has access to your pharmacy."
                        tone="violet"
                        onClick={() => onNavigate("pharmacy/Staff")}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    tone: "teal" | "amber" | "coral" | "violet";
}) {
    const tones = {
        teal: "bg-white text-[#2563EB]",
        amber: "bg-white text-[#B9761F]",
        coral: "bg-white text-[#C4544A]",
        violet: "bg-white text-[#6B4FA0]",
    };
    return (
        <div className={`rounded-2xl p-5 flex items-center gap-4 border border-[#E5E7EB] ${tones[tone]}`}>
            <div className="shrink-0">{icon}</div>
            <div>
                <p className="text-2xl font-semibold leading-none">{value}</p>
                <p className="text-xs text-[#6B7280] mt-1">{label}</p>
            </div>
        </div>
    );
}

function ActionCard({
    icon,
    title,
    description,
    tone,
    onClick,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    tone: "teal" | "amber" | "coral" | "violet";
    onClick: () => void;
}) {
    const iconTones = {
        teal: "bg-[#EFF6FF] text-[#2563EB]",
        amber: "bg-[#FAEEDA] text-[#B9761F]",
        coral: "bg-[#F7E7E5] text-[#C4544A]",
        violet: "bg-[#EEE8F7] text-[#6B4FA0]",
    };
    return (
        <button
            onClick={onClick}
            className="text-left rounded-2xl bg-white border border-[#E5E7EB] p-6 hover:border-[#2563EB] hover:shadow-sm transition-all group"
        >
            <div className={`inline-flex rounded-full p-3 mb-4 ${iconTones[tone]}`}>{icon}</div>
            <h3 className="font-semibold text-[#111827] flex items-center gap-1.5">
                {title}
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="text-sm text-[#6B7280] mt-1.5 leading-relaxed">{description}</p>
        </button>
    );
}

function PharmacistBear({ className }: { className?: string }) {
    const [blink, setBlink] = useState(false);
    return (
        <svg
            viewBox="0 0 200 200"
            className={className}
            style={{ animation: "medfinder-float 4s ease-in-out infinite" }}
            onMouseEnter={() => {
                setBlink(true);
                setTimeout(() => setBlink(false), 180);
            }}
        >
            <style>{`
        @keyframes medfinder-float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
      `}</style>
            {/* ears */}
            <circle cx="62" cy="52" r="16" fill="#8B5E3C" />
            <circle cx="138" cy="52" r="16" fill="#8B5E3C" />
            <circle cx="62" cy="52" r="8" fill="#C99A6C" />
            <circle cx="138" cy="52" r="8" fill="#C99A6C" />
            {/* head */}
            <circle cx="100" cy="90" r="52" fill="#A8703F" />
            <ellipse cx="100" cy="102" rx="26" ry="20" fill="#D9B48A" />
            {/* glasses */}
            <circle cx="82" cy="86" r="14" fill="none" stroke="#111827" strokeWidth="3" />
            <circle cx="118" cy="86" r="14" fill="none" stroke="#111827" strokeWidth="3" />
            <line x1="96" y1="86" x2="104" y2="86" stroke="#111827" strokeWidth="3" />
            {/* eyes */}
            {blink ? (
                <>
                    <line x1="77" y1="86" x2="87" y2="86" stroke="#111827" strokeWidth="2.5" />
                    <line x1="113" y1="86" x2="123" y2="86" stroke="#111827" strokeWidth="2.5" />
                </>
            ) : (
                <>
                    <circle cx="82" cy="86" r="3" fill="#111827" />
                    <circle cx="118" cy="86" r="3" fill="#111827" />
                </>
            )}
            {/* nose */}
            <ellipse cx="100" cy="104" rx="6" ry="4" fill="#111827" />
            {/* lab coat */}
            <path
                d="M60 138 Q100 122 140 138 L148 190 L52 190 Z"
                fill="#FFFFFF"
                stroke="#E5E7EB"
                strokeWidth="2"
            />
            <path d="M92 138 L100 150 L108 138" fill="none" stroke="#E5E7EB" strokeWidth="2" />
            <circle cx="100" cy="165" r="2.5" fill="#2563EB" />
            <circle cx="100" cy="178" r="2.5" fill="#2563EB" />
        </svg>
    );
}