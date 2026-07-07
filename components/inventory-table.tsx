//this page is vercel ai created and used for reference
/*'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Boxes,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SortKey = 'name' | 'quantity' | 'expiry'
type SortDir = 'asc' | 'desc'

function expiryToNumber(value: string) {
  const [month, year] = value.split('/')
  return Number(year) * 100 + Number(month)
}

export function InventoryTable() {
  const [rows, setRows] = useState<[]>()
  const [selected, setSelected] = useState<Set<string>>(
    new Set(['1', '6', '12']),
  )
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null)
  const [page, setPage] = useState(1)
  const totalPages = 5

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0
      if (sort.key === 'name') cmp = a.name.localeCompare(b.name)
      else if (sort.key === 'quantity') cmp = a.quantity - b.quantity
      else cmp = expiryToNumber(a.expiry) - expiryToNumber(b.expiry)
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [rows, sort])

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (prev?.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      }
      return { key, dir: 'asc' }
    })
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function deleteSelected() {
    if (selected.size === 0) return
    setRows((prev) => prev.filter((row) => !selected.has(row.id)))
    setSelected(new Set())
  }

  return (
    <section className="mx-6 rounded-2xl border border-border bg-card shadow-sm">
       Card header 
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Boxes className="size-5" />
        </div>
        <h2 className="flex-1 text-lg font-semibold text-foreground">
          {'Pharmacy name\u2019s Medication\u2019s Table'}
        </h2>
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted"
        >
          Filter
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted"
        >
          Download
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </div>

      Table 
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="text-sm text-muted-foreground">
              <th className="w-12 px-6 py-3" scope="col">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-2 py-3 font-medium" scope="col">
                <button
                  type="button"
                  onClick={() => toggleSort('name')}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  Medicine Name
                  <ArrowUpDown className="size-3.5" />
                </button>
              </th>
              <th className="px-2 py-3 font-medium" scope="col">
                <button
                  type="button"
                  onClick={() => toggleSort('quantity')}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  Quantity
                  <ArrowUpDown className="size-3.5" />
                </button>
              </th>
              <th className="px-2 py-3 font-medium" scope="col">
                <button
                  type="button"
                  onClick={() => toggleSort('expiry')}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  Expiry
                  <ArrowUpDown className="size-3.5" />
                </button>
              </th>
              <th className="px-2 py-3 font-medium" scope="col">
                Description
              </th>
              <th className="w-16 px-6 py-3" scope="col">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const checked = selected.has(row.id)
              return (
                <tr
                  key={row.id}
                  className="border-t border-border align-middle transition-colors hover:bg-muted/40"
                >
                  <td className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Select ${row.name}`}
                      className="size-4 cursor-pointer accent-primary"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        <Image
                          src="/medicine-box.png"
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div className="leading-tight">
                        <p className="font-medium text-foreground">{row.name}</p>
                        {row.code && (
                          <p className="text-sm text-muted-foreground">
                            {row.code}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-sm text-foreground tabular-nums">
                    {row.quantity.toLocaleString()}
                  </td>
                  <td className="px-2 py-3 text-sm text-foreground tabular-nums">
                    {row.expiry}
                  </td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      className="max-w-xs text-left text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    >
                      {row.description}
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      aria-label={`Edit ${row.name}`}
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      Bulk delete 
      <div className="border-t border-border px-6 py-3">
        <button
          type="button"
          onClick={deleteSelected}
          disabled={selected.size === 0}
          aria-label="Delete selected medications"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="size-5" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-1.5 px-6 pb-5 pt-1">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPage(n)}
            aria-current={page === n ? 'page' : undefined}
            className={cn(
              'flex size-8 items-center justify-center rounded-md border text-sm transition-colors',
              page === n
                ? 'border-primary text-primary'
                : 'border-border text-foreground hover:bg-muted',
            )}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
          className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  )
}

export function AddProductButton() {
  return (
    <div className="flex justify-end px-6 pt-2">
      <Button className="h-10 gap-1.5 bg-primary px-4 text-primary-foreground hover:bg-primary/90">
        <Plus className="size-4" />
        Add New Product
      </Button>
    </div>
  )
}*/