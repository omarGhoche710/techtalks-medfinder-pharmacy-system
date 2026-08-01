"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import React from "react"
import { DeleteConfirmDialog } from "@/components/EditTable/InventoryDialog"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  nameFilter: string,
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  onDelete?: (selectedRows: TData[]) => void
}


export function DataTable<TData, TValue>({
  columns,
  data,
  nameFilter,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({})
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pendingRows, setPendingRows] = React.useState<TData[]>([])

  const rowSelection = controlledRowSelection ?? internalRowSelection
  const handleRowSelectionChange = React.useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater
      if (onRowSelectionChange) onRowSelectionChange(next)
      else setInternalRowSelection(next)
    },
    [rowSelection, onRowSelectionChange]
  )

  React.useEffect(() => {
    setColumnFilters(
      nameFilter ? [{ id: "name", value: nameFilter }] : []
    )
  }, [nameFilter])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full max-w-[1000px] rounded-xl border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between py-4 pr-4">
        <div className="ml-auto flex items-center gap-2 mr-2">
          {onDelete && (() => {
            const selectedRows = table.getSelectedRowModel().rows.map(r => r.original)
            const hasSelection = selectedRows.length > 0
            return (
              <button
                type="button"
                onClick={() => {
                  if (!hasSelection) return
                  setPendingRows(selectedRows)
                  setConfirmOpen(true)
                }}
                title={hasSelection ? `Delete ${selectedRows.length} selected` : "Select rows to delete"}
                className={`flex items-center justify-center rounded-md p-2 transition-colors ${
                  hasSelection
                    ? "text-[#2563EB] hover:bg-[#EFF6FF] cursor-pointer"
                    : "text-[#D1D5DB] cursor-not-allowed"
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          })()}
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] hover:border-[#2563EB]"
            >
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter(
                (column) => column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize whitespace-nowrap"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[800px]">
          <TableHeader className="sticky top-0 z-10 bg-[#F9FAFB] px-4 py-3 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="border-b border-[#E5E7EB] text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="px-4 py-3" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="border-b border-[#EFF6FF] transition-colors hover:bg-[#F3F4F6]"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-[#111827]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-[#6B7280]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium">No medications found</span>
                    <span className="text-xs text-[#9CA3AF]">Add a new product using the button above</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {onDelete && (
        <DeleteConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          count={pendingRows.length}
          onConfirm={() => onDelete(pendingRows)}
        />
      )}
      <div className="sticky bottom-0 z-10 flex items-center justify-end
      space-x-2 border-t border-[#E5E7EB] bg-[#F9FAFB] py-4 pr-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] hover:border-[#2563EB] disabled:opacity-40"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] hover:border-[#2563EB] disabled:opacity-40"
        >
          Next
        </Button>
      </div>
    </div>
  )
}