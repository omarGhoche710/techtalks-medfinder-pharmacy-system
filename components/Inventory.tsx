"use client"
import { useMemo, useState } from "react"
import { columns} from "@/components/columns"
import { DataTable } from "@/components/data-Table"
import { InventoryPop } from "@/components/Dialogs/InventoryDialog"
import { Footer } from "./PharmaFooter"
import { Header } from "./PharmaHeader"
import { medications as allMedications, Medication } from "@/data/medications";
import { filterMedications } from "@/lib/searchMedications";

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

    return ( <div>
        <Header medications={allMedications}
            query={query}
            onQueryChange={setQuery}
            onSearch={(q) => setAppliedFilter(q)}
            />
        <DataTable columns={tableColumns} data={data} nameFilter={appliedFilter}/>
        <InventoryPop
            open={isOpen}
            onOpenChange={setIsOpen}
            medicine={selectedRow}
        />
        <Footer />
    </div>)
}