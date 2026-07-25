'use client'

import { useState } from "react";
import { Search, Plus, X, Mail, MessageSquare } from "lucide-react";
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
    Invited: "bg-[#E1F0EA] text-[#145C54]",
    Employed: "bg-[#E1F0EA] text-[#145C54]",
    Absent: "bg-[#F1F3F2] text-[#5B6B66]",
};

const avatarColors = ["#145C54", "#B9761F", "#C4544A", "#6B4FA0", "#2F6FB0", "#4C8C4A"];

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

export default function Staff() {
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
                <div className="min-h-screen bg-[#EAF3ED] p-6 md:p-10">
                    <div className="mx-auto max-w-6xl space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <SidebarTrigger />
                            <div>
                                <h1 className="text-2xl font-semibold text-[#1F2B29]">Staff</h1>
                                <p className="text-sm text-[#5B6B66] mt-1">
                                    Manage who has access to your pharmacy.
                                </p>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="w-4 h-4 text-[#5B6B66] absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search staff"
                                    className="w-full rounded-xl bg-white border border-[#D8E7DF] pl-9 pr-3 py-2 text-sm text-[#1F2B29] placeholder:text-[#5B6B66] focus:outline-none focus:border-[#145C54]"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StaffStatus | "All")}
                                className="rounded-xl bg-white border border-[#D8E7DF] px-3 py-2 text-sm text-[#1F2B29] focus:outline-none focus:border-[#145C54]"
                            >
                                <option value="All">All statuses</option>
                                <option value="Invited">Invited</option>
                                <option value="Employed">Employed</option>
                                <option value="Absent">Absent</option>
                            </select>

                            <button
                                onClick={() => setInviteOpen(true)}
                                className="flex items-center gap-1.5 rounded-xl bg-[#145C54] text-white px-4 py-2 text-sm font-medium hover:bg-[#0F4A43] transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Invite
                            </button>
                        </div>

                        {/* Table */}
                        <div className="rounded-2xl bg-white border border-[#D8E7DF] overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#D8E7DF] text-left text-[#5B6B66]">
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
                                            className="group border-b border-[#EAF3ED] last:border-0 hover:bg-[#F3F8F5] transition-colors"
                                        >
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={member.name} index={i} />
                                                    <span className="font-medium text-[#1F2B29]">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-[#5B6B66]">{member.jobTitle}</td>
                                            <td className="py-3 px-5 text-[#5B6B66]">${member.salary.toLocaleString()}</td>
                                            <td className="py-3 px-5 text-[#5B6B66]">{member.startDate}</td>
                                            <td className="py-3 px-5">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[member.status]}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <button
                                                    onClick={() => setPendingDelete(member)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1.5 hover:bg-[#F7E7E5] text-[#C4544A]"
                                                    aria-label={`Remove ${member.name}`}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-[#5B6B66]">
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
                                <h3 className="font-semibold text-[#1F2B29]">Remove {pendingDelete.name}?</h3>
                                <p className="text-sm text-[#5B6B66] mt-1.5">
                                    They'll lose access to this pharmacy's dashboard. This can't be undone.
                                </p>
                                <div className="flex gap-3 mt-5">
                                    <button
                                        onClick={() => setPendingDelete(null)}
                                        className="flex-1 rounded-xl border border-[#D8E7DF] py-2 text-sm font-medium text-[#1F2B29] hover:bg-[#F3F8F5]"
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
                    {inviteOpen && <InviteDialog onClose={() => setInviteOpen(false)} />}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

function InviteDialog({ onClose }: { onClose: () => void }) {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [jobTitle, setJobTitle] = useState("");

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#1F2B29] text-lg">Invite staff member</h3>
                    <button onClick={onClose} className="text-[#5B6B66] hover:text-[#1F2B29]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-[#5B6B66]">Full name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sara Khalil"
                            className="w-full mt-1 rounded-xl border border-[#D8E7DF] px-3 py-2 text-sm focus:outline-none focus:border-[#145C54]"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-[#5B6B66]">Job title</label>
                        <input
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Pharmacist"
                            className="w-full mt-1 rounded-xl border border-[#D8E7DF] px-3 py-2 text-sm focus:outline-none focus:border-[#145C54]"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-[#5B6B66]">Email or phone number</label>
                        <input
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="sara@example.com or +961 ..."
                            className="w-full mt-1 rounded-xl border border-[#D8E7DF] px-3 py-2 text-sm focus:outline-none focus:border-[#145C54]"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#145C54] text-white py-2.5 text-sm font-medium hover:bg-[#0F4A43]"
                    >
                        <Mail className="w-4 h-4" />
                        Invite by email
                    </button>
                    <button
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#D8E7DF] text-[#1F2B29] py-2.5 text-sm font-medium hover:bg-[#F3F8F5]"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Invite by text
                    </button>
                </div>
            </div>
        </div>
    );
}