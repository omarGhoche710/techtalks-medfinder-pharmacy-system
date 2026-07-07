"use client"
import { useState } from "react"
import { columns, medicine } from "@/components/columns"
import { DataTable } from "@/components/data-Table"
import { InventoryPop } from "@/components/Dialogs/InventoryDialog"

export function InventoryTable({ data }: { data: medicine[] }) {
    const [selectedRow, setSelectedRow] = useState<medicine | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const tableColumns = columns((med) => {
        setSelectedRow(med)
        setIsOpen(true)
    })

    return (<>
    <DataTable columns={tableColumns} data={data} />
    <InventoryPop
        open={isOpen}
        onOpenChange={setIsOpen}
        medicine={selectedRow}
      />
      </>)
}