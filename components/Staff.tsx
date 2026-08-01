'use client'

import { useState } from "react";
import { Search, Plus, X, Mail } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/PharmaSidebar"

type StaffStatus = "Invited" | "Employed" | "Absent";

type StaffMember = {
    id: string;
    name: string;
    jobTitle: string;
    salary: number;
    startDate: string;
    status: StaffStatus;
};

const initialMembers: StaffMember[] = [
    { id: "1", name: "Anatoliy Belik", jobTitle: "Head of Design", salary: 1350, startDate: "Mar 13, 2023", status: "Invited" },
    { id: "2", name: "Ksenia Bator", jobTitle: "Fullstack Engineer", salary: 1500, startDate: "Oct 13, 2023", status: "Absent" },
    { id: "3", name: "Bogdan Nikitin", jobTitle: "Mobile Lead", salary: 2600, startDate: "Nov 4, 2023", status: "Invited" },
    { id: "4", name: "Arsen Yatsenko", jobTitle: "Sales Manager", salary: 900, startDate: "Sep 4, 2021", status: "Invited" },
    { id: "5", name: "Daria Yurchenko", jobTitle: "Network Engineer", salary: 1000, startDate: "Feb 21, 2023", status: "Invited" },
    { id: "6", name: "Yulia Polishchuk", jobTitle: "Head of Design", salary: 1700, startDate: "Aug 2, 2024", status: "Absent" },
];

const statusStyles: Record<StaffStatus, string> = {
    Invited: "bg-[#EFF6FF] text-[#2563EB]",
    Employed: "bg-[#EFF6FF] text-[#2563EB]",
    Absent: "bg-[#F3F4F6] text-[#6B7280]",
};

const avatarColors = ["#2563EB", "#B9761F", "#C4544A", "#6B4FA0", "#2F6FB0", "#4C8C4A"];

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function Avatar({ name, index }: { name: string; index: number }) {
    return (
        <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
            style={{ backgroundColor: avatarColors[index % avatarColors.length] }}
        >
            {initials(name)}
        </div>
    );
}

interface StaffProps {
    isOwner?: boolean;
    pharmacyId?: string;
    inviterId?: string;
}

export default function Staff({ isOwner = false, pharmacyId, inviterId }: StaffProps) {
    const [members, setMembers] = useState<StaffMember[]>(initialMembers);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StaffStatus | "All">("All");
    const [pendingDelete, setPendingDelete] = useState<StaffMember | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);

    const filtered = members.filter((m) => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    function confirmDelete() {
        if (!pendingDelete) return;
        setMembers((prev) => prev.filter((m) => m.id !== pendingDelete.id));
        setPendingDelete(null);
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-[#EFF6FF] p-6 md:p-10">
                    <div className="mx-auto max-w-6xl space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <SidebarTrigger />
                            <div>
                                <h1 className="text-2xl font-semibold text-[#111827]">Staff</h1>
                                <p className="text-sm text-[#6B7280] mt-1">
                                    Manage who has access to your pharmacy.
                                </p>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search staff"
                                    className="w-full rounded-xl bg-white border border-[#E5E7EB] pl-9 pr-3 py-2 text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#2563EB]"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StaffStatus | "All")}
                                className="rounded-xl bg-white border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#2563EB]"
                            >
                                <option value="All">All statuses</option>
                                <option value="Invited">Invited</option>
                                <option value="Employed">Employed</option>
                                <option value="Absent">Absent</option>
                            </select>

                            {isOwner && (
                                <button
                                    onClick={() => setInviteOpen(true)}
                                    className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] text-white px-4 py-2 text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Invite
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#E5E7EB] text-left text-[#6B7280]">
                                        <th className="py-3 px-5 font-medium">Name</th>
                                        <th className="py-3 px-5 font-medium">Job title</th>
                                        <th className="py-3 px-5 font-medium">Salary</th>
                                        <th className="py-3 px-5 font-medium">Start date</th>
                                        <th className="py-3 px-5 font-medium">Status</th>
                                        <th className="py-3 px-5 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((member, i) => (
                                        <tr
                                            key={member.id}
                                            className="group border-b border-[#EFF6FF] last:border-0 hover:bg-[#F3F4F6] transition-colors"
                                        >
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={member.name} index={i} />
                                                    <span className="font-medium text-[#111827]">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-[#6B7280]">{member.jobTitle}</td>
                                            <td className="py-3 px-5 text-[#6B7280]">${member.salary.toLocaleString()}</td>
                                            <td className="py-3 px-5 text-[#6B7280]">{member.startDate}</td>
                                            <td className="py-3 px-5">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[member.status]}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                {isOwner && (
                                                    <button
                                                        onClick={() => setPendingDelete(member)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1.5 hover:bg-[#F7E7E5] text-[#C4544A]"
                                                        aria-label={`Remove ${member.name}`}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-[#6B7280]">
                                                No staff members match your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Delete confirmation */}
                    {pendingDelete && (
                        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                                <h3 className="font-semibold text-[#111827]">Remove {pendingDelete.name}?</h3>
                                <p className="text-sm text-[#6B7280] mt-1.5">
                                    They'll lose access to this pharmacy's dashboard. This can't be undone.
                                </p>
                                <div className="flex gap-3 mt-5">
                                    <button
                                        onClick={() => setPendingDelete(null)}
                                        className="flex-1 rounded-xl border border-[#E5E7EB] py-2 text-sm font-medium text-[#111827] hover:bg-[#F3F4F6]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 rounded-xl bg-[#C4544A] text-white py-2 text-sm font-medium hover:bg-[#A8453C]"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invite dialog */}
                    {inviteOpen && (
                        <InviteDialog
                            pharmacyId={pharmacyId}
                            inviterId={inviterId}
                            onClose={() => setInviteOpen(false)}
                        />
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

// ---------------------------------------------------------------------------
// InviteDialog — sends a real invitation email via POST /api/invitations
// ---------------------------------------------------------------------------

type InviteRole = "PHARMACIST" | "EMPLOYEE";

interface InviteDialogProps {
    pharmacyId?: string;
    inviterId?: string;
    onClose: () => void;
}

function InviteDialog({ pharmacyId, inviterId, onClose }: InviteDialogProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<InviteRole>("PHARMACIST");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);

    async function handleSend() {
        if (!email.trim()) { setError("Email is required."); return; }
        if (!pharmacyId || !inviterId) {
            setError("Could not determine your pharmacy. Please reload and try again.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pharmacy_id: pharmacyId,
                    invited_email: email.trim(),
                    role,
                    invited_by: inviterId,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message ?? "Failed to send invitation");
            setSent(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#111827] text-lg">
                        {sent ? "Invitation sent!" : "Invite staff member"}
                    </h3>
                    <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {sent ? (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center mx-auto mb-3">
                            <Mail className="w-6 h-6 text-[#2563EB]" />
                        </div>
                        <p className="text-[#6B7280] text-sm">
                            An invitation email was sent to <span className="font-medium text-[#111827]">{email}</span>.
                            The link expires in 7 days.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-5 w-full rounded-xl bg-[#2563EB] text-white py-2.5 text-sm font-medium hover:bg-[#1D4ED8]"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-[#6B7280]">Email address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="sara@example.com"
                                    className="w-full mt-1 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[#6B7280]">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as InviteRole)}
                                    className="w-full mt-1 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                                >
                                    <option value="PHARMACIST">Pharmacist</option>
                                    <option value="EMPLOYEE">Employee</option>
                                </select>
                            </div>
                        </div>

                        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSend}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] text-white py-2.5 text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-60"
                            >
                                <Mail className="w-4 h-4" />
                                {loading ? "Sending…" : "Send invitation"}
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-[#E5E7EB] text-[#111827] py-2.5 text-sm font-medium hover:bg-[#F3F4F6]"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
