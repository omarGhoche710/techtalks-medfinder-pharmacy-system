"use client"
import { useMemo, useState } from "react"
import { columns } from "@/components/columns"
import { DataTable } from "@/components/data-Table"
import { InventoryPop } from "@/components/EditTable/InventoryDialog"
import { Footer } from "./PharmaFooter"
import { Header } from "./PharmaHeader"
import { medications as allMedications, Medication } from "@/data/medications";
import { filterMedications } from "@/lib/searchMedications";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/PharmaSidebar"

export function Inventory({ data }: { data: Medication[] }) {
    const [query, setQuery] = useState("");
    const [appliedFilter, setAppliedFilter] = useState("")
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRow, setSelectedRow] = useState<Medication | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const filteredMedications = useMemo(
        () => filterMedications(allMedications, searchQuery),
        [searchQuery]
    );

    const tableColumns = columns((med) => {
        setSelectedRow(med)
        setIsOpen(true)
    })

    return (<div>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-[#EAF3ED]">
                <SidebarTrigger className="m-2 text-[#5B6B66] hover:text-[#145C54] hover:bg-[#E1F0EA]" />
                <Header medications={allMedications}
                    query={query}
                    onQueryChange={setQuery}
                    onSearch={(q) => setAppliedFilter(q)}
                />
                <div className="flex justify-center">
                    <DataTable columns={tableColumns} data={data} nameFilter={appliedFilter} />
                </div>
                <InventoryPop
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    medicine={selectedRow}
                />
                <Footer />
            </SidebarInset>
        </SidebarProvider>
    </div>)
}