"use client"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { columns } from "@/components/columns"
import { DataTable } from "@/components/data-Table"
import { RowSelectionState } from "@tanstack/react-table"
import { ExpiredActionBar } from "@/components/EditTable/ExpiredActionBar"
import { InventoryPop } from "@/components/EditTable/InventoryDialog"
import { Footer } from "./PharmaFooter"
import { Header } from "./PharmaHeader"
import { medications as fallbackMedications, Medication } from "@/data/medications";
import { filterMedications } from "@/lib/searchMedications";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/PharmaSidebar"

export function Expired({ data, allMedications }: { data: Medication[]; allMedications?: Medication[] }) {
    const allMedications_ = allMedications ?? fallbackMedications;
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [appliedFilter, setAppliedFilter] = useState("")
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    const selectedMedicines = useMemo(
        () =>
            Object.keys(rowSelection)
                .filter((id) => rowSelection[id])
                .map((id) => data[Number(id)])
                .filter(Boolean),
        [rowSelection, data]
    )

    const router = useRouter()
    const [selectedRow, setSelectedRow] = useState<Medication | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const tableColumns = columns((med) => {
        setSelectedRow(med)
        setIsEditOpen(true)
    })

    const handleConfirmDamage = async (medicines: Medication[]) => {
        await Promise.all(
            medicines.map((m) =>
                fetch(`/api/inventory/${m.id}`, { method: "DELETE" })
            )
        )
        setRowSelection({})
        router.refresh()
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-[#F9FAFB] min-w-0">
                <Footer />
                <SidebarTrigger className="m-2 text-[#6B7280] hover:text-[#2563EB] hover:bg-[#EFF6FF]" />
                <Header
                    medications={allMedications_}
                    query={query}
                    onQueryChange={setQuery}
                    onSearch={(q) => setAppliedFilter(q)}
                />
                <div className="flex flex-col items-center gap-2 px-4 min-w-0">
                    <div className="w-full max-w-[1000px] min-w-0">
                        <ExpiredActionBar
                            selected={selectedMedicines}
                            onClearSelection={() => setRowSelection({})}
                            onConfirmDamage={handleConfirmDamage}
                        />
                    </div>
                    <DataTable
                        columns={tableColumns}
                        data={data}
                        nameFilter={appliedFilter}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        onDelete={async (rows) => {
                            await Promise.all(rows.map((m) => fetch(`/api/inventory/${m.id}`, { method: "DELETE" })))
                            setRowSelection({})
                            router.refresh()
                        }}
                    />
                </div>
                <InventoryPop
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    medicine={selectedRow}
                />
            </SidebarInset>
        </SidebarProvider>
    )
}
