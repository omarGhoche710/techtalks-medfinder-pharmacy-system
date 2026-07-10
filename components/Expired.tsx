"use client"
import { useMemo, useState } from "react"
import { columns} from "@/components/columns"
import { DataTable } from "@/components/data-Table"
import { ExpiredPop } from "@/components/Dialogs/ExpiredDialog"
import { Footer } from "./PharmaFooter"
import { Header } from "./PharmaHeader"
import { medications as allMedications, Medication } from "@/data/medications";
import { filterMedications } from "@/lib/searchMedications";

export function Expired({ data }: { data: Medication[] }) {
    const [query, setQuery] = useState("");
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

    return (<>
        <Header medications={allMedications}
            query={query}
            onQueryChange={setQuery}
            onSearch={setSearchQuery} />
        <DataTable columns={tableColumns} data={data} />
        <ExpiredPop
            open={isOpen}
            onOpenChange={setIsOpen}
            medicine={selectedRow}
        />
        <Footer />
    </>)
}