"use client"
import { useMemo, useState } from "react"
import { columns } from "@/components/columns"
import { DataTable } from "@/components/data-Table"
import { RowSelectionState } from "@tanstack/react-table"
import { NearExpiryActionBar } from "./EditTable/NearExpiryActionBar"
import { Footer } from "./PharmaFooter"
import { Header } from "./PharmaHeader"
import { medications as allMedications, Medication } from "@/data/medications";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/PharmaSidebar"
import { filterMedications } from "@/lib/searchMedications";

export function NearExpiry({ data }: { data: Medication[] }) {
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [appliedFilter, setAppliedFilter] = useState("")
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [isOpen, setIsOpen] = useState(false)

    const selectedMedicines = useMemo(
        () =>
            Object.keys(rowSelection)
                .filter((id) => rowSelection[id])
                .map((id) => data[Number(id)])
                .filter(Boolean),
        [rowSelection, data]
    )
    
    const tableColumns = columns(() => { })

    const handleApplyDiscount = (medicines: Medication[], percent: number) => {
        // replace with real API
        console.log("Would call: discount(bulk)", { ids: medicines.map((m) => m.code), percent })
    }

    const handleConfirmDamage = (medicines: Medication[]) => {
        // replace with real API
        console.log("Would call: damage(bulk)", { ids: medicines.map((m) => m.code) })
    }

    const handleTransaction = (medicines: Medication[]) => {
        //redirect to another page or pop-up
    }

    return (
        <div>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-[#EAF3ED] min-w-0">
                    <SidebarTrigger className="m-2 text-[#5B6B66] hover:text-[#145C54] hover:bg-[#E1F0EA]" />
                    <Header
                        medications={allMedications}
                        query={query}
                        onQueryChange={setQuery}
                        onSearch={(q) => setAppliedFilter(q)}
                    />
                    <div className="flex flex-col items-center gap-2 px-4 min-w-0">
                        <div className="w-full max-w-[1000px] min-w-0">
                            <NearExpiryActionBar
                                selected={selectedMedicines}
                                onClearSelection={() => setRowSelection({})}
                                onApplyDiscount={handleApplyDiscount}
                                onConfirmDamage={handleConfirmDamage}
                                onTransaction={handleTransaction}
                            />
                        </div>
                        <DataTable
                            columns={tableColumns}
                            data={data}
                            nameFilter={appliedFilter}
                            rowSelection={rowSelection}
                            onRowSelectionChange={setRowSelection}
                        />
                    </div>
                    <Footer />
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}