"use client"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { columns } from "@/components/columns"
import { DataTable } from "@/components/data-Table"
import { InventoryPop } from "@/components/EditTable/InventoryDialog"
import { Footer } from "./PharmaFooter"
import { Header } from "./PharmaHeader"
import { medications as fallbackMedications, Medication } from "@/data/medications";
import { filterMedications } from "@/lib/searchMedications";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/PharmaSidebar"

export function Inventory({ data, allMedications }: { data: Medication[]; allMedications?: Medication[] }) {
    const router = useRouter()
    const allMedications_ = allMedications ?? fallbackMedications;
    const [query, setQuery] = useState("");
    const [appliedFilter, setAppliedFilter] = useState("")
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRow, setSelectedRow] = useState<Medication | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const filteredMedications = useMemo(
        () => filterMedications(allMedications_, searchQuery),
        [allMedications_, searchQuery]
    );

    const tableColumns = columns((med) => {
        setSelectedRow(med)
        setIsOpen(true)
    })

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-[#F9FAFB]">
                <Footer />
                <SidebarTrigger className="m-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-[#EFF6FF]" />
                <Header
                    medications={allMedications_}
                    query={query}
                    onQueryChange={setQuery}
                    onSearch={(q) => setAppliedFilter(q)}
                />
                <div className="flex justify-center">
                    <DataTable
                        columns={tableColumns}
                        data={data}
                        nameFilter={appliedFilter}
                        onDelete={async (rows) => {
                            await Promise.all(rows.map((m) => fetch(`/api/inventory/${m.id}`, { method: "DELETE" })))
                            router.refresh()
                        }}
                    />
                </div>
                <InventoryPop
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    medicine={selectedRow}
                />
            </SidebarInset>
        </SidebarProvider>
    )
}
