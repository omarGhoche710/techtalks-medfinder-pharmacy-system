"use client"
import { useEffect, useMemo, useState } from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Medication } from "@/data/medications"

type MatchedPharmacy = {
    id: string
    name: string
    distance: number
    angle: number
    current_stock: number
    has_same_medication: boolean
    score: number
}

export type TransferAllocation = {
    pharmacyId: string
    pharmacyName: string
    items: { code: string; qty: number; price: number }[]
}

interface TransferDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    medicines: Medication[]
    pharmacyId: string
    onSend: (allocations: TransferAllocation[]) => void
}

export function TransferDialog({ open, onOpenChange, medicines, pharmacyId, onSend }: TransferDialogProps) {
    const [activeTab, setActiveTab] = useState<"location">("location")
    const [radiusKm, setRadiusKm] = useState(10)
    const [remaining, setRemaining] = useState<Record<string, number>>({})
    const [summary, setSummary] = useState<TransferAllocation[]>([])
    const [activePharmacy, setActivePharmacy] = useState<{ id: string; name: string } | null>(null)
    const [allocDraft, setAllocDraft] = useState<Record<string, { qty: string; price: string }>>({})
    const [pharmacies, setPharmacies] = useState<MatchedPharmacy[]>([])
    const [loadingPharmacies, setLoadingPharmacies] = useState(false)
    const [sending, setSending] = useState(false)

    // Reset state and fetch real pharmacies whenever the dialog opens
    useEffect(() => {
        if (!open) return

        const initial: Record<string, number> = {}
        medicines.forEach((m) => { initial[m.code] = m.stock })
        setRemaining(initial)
        setSummary([])
        setActivePharmacy(null)
        setAllocDraft({})
        setActiveTab("location")

        // Fetch matching pharmacies using the first selected medication
        const firstMed = medicines[0]
        if (!firstMed || !pharmacyId) return

        setLoadingPharmacies(true)
        fetch(`/api/transfers/matching?pharmacy_id=${pharmacyId}&medication_id=${firstMed.id}`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (!data) return
                const allCandidates = [
                    data.recommended_target,
                    ...(data.other_candidates ?? []),
                ].filter(Boolean)

                const ANGLES = [40, 130, 210, 280, 330, 60, 160, 240, 310, 20]
                setPharmacies(allCandidates.map((p: any, i: number) => ({
                    id: p.pharmacy_id,
                    name: p.pharmacy_name,
                    distance: p.distance_km,
                    angle: ANGLES[i % ANGLES.length],
                    current_stock: p.current_stock,
                    has_same_medication: p.has_same_medication,
                    score: p.score,
                })))
            })
            .catch(() => {})
            .finally(() => setLoadingPharmacies(false))
    }, [open, medicines, pharmacyId])

    const totalAllocated = useMemo(
        () => summary.reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.qty, 0), 0),
        [summary]
    )

    function openAllocation(id: string, name: string) {
        setActivePharmacy({ id, name })
        setAllocDraft({})
    }

    function updateDraftQty(code: string, qty: string, price: number) {
        const qtyNum = parseFloat(qty) || 0
        setAllocDraft((prev) => ({
            ...prev,
            [code]: {
                qty,
                price: qtyNum > 0 ? (qtyNum * price).toFixed(2) : "",
            },
        }))
    }

    function updateDraftPrice(code: string, price: string) {
        setAllocDraft((prev) => ({
            ...prev,
            [code]: { qty: prev[code]?.qty ?? "", price },
        }))
    }

    function addAllocation() {
        if (!activePharmacy) return
        const items = Object.entries(allocDraft)
            .map(([code, v]) => ({ code, qty: parseFloat(v.qty) || 0, price: parseFloat(v.price) || 0 }))
            .filter((i) => i.qty > 0)

        if (items.length === 0) return

        setRemaining((prev) => {
            const next = { ...prev }
            items.forEach((i) => { next[i.code] = (next[i.code] ?? 0) - i.qty })
            return next
        })
        setSummary((prev) => [...prev, { pharmacyId: activePharmacy.id, pharmacyName: activePharmacy.name, items }])
        setActivePharmacy(null)
        setAllocDraft({})
    }

    function removeAllocation(idx: number) {
        const removed = summary[idx]
        setRemaining((prev) => {
            const next = { ...prev }
            removed.items.forEach((i) => { next[i.code] = (next[i.code] ?? 0) + i.qty })
            return next
        })
        setSummary((prev) => prev.filter((_, i) => i !== idx))
    }

    async function handleSend() {
        setSending(true)
        try {
            for (const allocation of summary) {
                for (const item of allocation.items) {
                    const med = medicines.find((m) => m.code === item.code)
                    if (!med) continue
                    await fetch("/api/transfers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            from_pharmacy_id: pharmacyId,
                            to_pharmacy_id: allocation.pharmacyId,
                            medication_id: med.id,
                            quantity: item.qty,
                            discount_percentage: med.price > 0 ? Math.round((1 - item.price / (item.qty * med.price)) * 100) : 0,
                            discounted_price: item.qty > 0 ? item.price / item.qty : 0,
                            reason: `Near-expiry transfer to ${allocation.pharmacyName}`,
                        }),
                    })
                }
            }
            onSend(summary)
            onOpenChange(false)
        } catch {
            // still close — partial success is fine for demo
            onSend(summary)
            onOpenChange(false)
        } finally {
            setSending(false)
        }
    }

    const inRangePharmacies = pharmacies.filter((p) => p.distance <= radiusKm)
    const mapR = 100 // px radius at max range (20km)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Transfer medicines</DialogTitle>
                    <DialogDescription>
                        Distribute the selected medicines across one or more pharmacies. Assign from either tab — the pool below tracks what's left.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Pool */}
                    <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-4">
                        {medicines.map((m) => {
                            const rem = remaining[m.code] ?? m.stock
                            const pct = m.stock > 0 ? Math.round((rem / m.stock) * 100) : 0
                            const done = rem <= 0
                            return (
                                <div
                                    key={m.code}
                                    className={`flex-1 min-w-[180px] rounded-xl border border-[#E5E7EB] p-2.5 transition-opacity ${done ? "opacity-45 bg-[#F9FAFB]" : "bg-white"}`}
                                >
                                    <div className="flex justify-between text-[13px] font-semibold">
                                        <span>{m.name}</span>
                                        <span className="text-[11px] text-[#6B7280] font-medium">{m.code}</span>
                                    </div>
                                    <div className="h-1.5 rounded bg-[#EFF6FF] mt-2 overflow-hidden">
                                        <div className="h-full bg-[#2563EB] transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[11px] text-[#6B7280] mt-1">
                                        <span>of {m.stock} units</span>
                                        <span className={`font-mono font-bold ${done ? "text-[#6B7280]" : "text-[#2563EB]"}`}>{rem} left</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {(
                        <div className="pt-4 space-y-4">
                            {loadingPharmacies && (
                                <p className="text-[12.5px] text-[#6B7280] italic">Finding nearby pharmacies…</p>
                            )}
                            <div className="flex gap-4">
                                <div className="shrink-0">
                                    <div
                                        className="relative rounded-full border border-[#E5E7EB] mx-auto"
                                        style={{ width: 220, height: 220, background: "radial-gradient(circle, #EFF6FF 0%, #FCFCFB 70%)" }}
                                    >
                                        <div
                                            className="absolute rounded-full border-2 border-dashed border-[#BFDBFE]"
                                            style={{
                                                width: (radiusKm / 20) * mapR * 2,
                                                height: (radiusKm / 20) * mapR * 2,
                                                top: "50%",
                                                left: "50%",
                                                transform: "translate(-50%, -50%)",
                                            }}
                                        />
                                        <div
                                            className="absolute rounded-full bg-[#2563EB]"
                                            style={{ width: 10, height: 10, top: "50%", left: "50%", transform: "translate(-50%, -50%)", boxShadow: "0 0 0 4px rgba(20,92,84,.15)" }}
                                        />
                                        {pharmacies.map((p) => {
                                            const inRange = p.distance <= radiusKm
                                            const rPx = (p.distance / 20) * mapR
                                            const rad = (p.angle * Math.PI) / 180
                                            const x = 110 + rPx * Math.cos(rad)
                                            const y = 110 + rPx * Math.sin(rad)
                                            return (
                                                <div
                                                    key={p.id}
                                                    title={`${p.name} (${p.distance} km)`}
                                                    onClick={() => inRange && openAllocation(p.id, p.name)}
                                                    className={`absolute w-3 h-3 rounded-full border-2 border-white transition-opacity ${inRange ? "bg-[#2563EB] cursor-pointer" : "bg-[#E4C9C5] opacity-30 cursor-not-allowed"
                                                        }`}
                                                    style={{ left: x, top: y, transform: "translate(-50%, -50%)", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }}
                                                />
                                            )
                                        })}
                                    </div>
                                    <div className="mt-3 text-center">
                                        <label className="text-[11px] text-[#6B7280] uppercase tracking-wide">
                                            Radius: <span className="font-mono font-bold text-[#2563EB]">{radiusKm}</span> km
                                        </label>
                                        <input
                                            type="range"
                                            min={1}
                                            max={20}
                                            value={radiusKm}
                                            onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                                            className="w-full accent-[#2563EB]"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                                    {pharmacies.slice().sort((a, b) => a.distance - b.distance).map((p) => {
                                        const inRange = p.distance <= radiusKm
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => inRange && openAllocation(p.id, p.name)}
                                                className={`flex justify-between items-center rounded-lg border border-[#E5E7EB] px-3 py-2.5 transition-colors ${inRange ? "cursor-pointer hover:border-[#2563EB] hover:bg-[#EFF6FF]" : "opacity-40 cursor-not-allowed"
                                                    }`}
                                            >
                                                <div>
                                                    <div className="text-[13.5px] font-semibold">{p.name}</div>
                                                    <div className="text-[11.5px] text-[#6B7280]">Nearby pharmacy</div>
                                                </div>
                                                <div className="text-xs font-bold font-mono text-[#2563EB]">{p.distance} km</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {activePharmacy && (
                                <AllocationPanel
                                    pharmacyName={activePharmacy.name}
                                    medicines={medicines}
                                    remaining={remaining}
                                    draft={allocDraft}
                                    onQtyChange={updateDraftQty}
                                    onPriceChange={updateDraftPrice}
                                    onAdd={addAllocation}
                                />
                            )}
                        </div>
                    )}


                    {/* Summary */}
                    <div className="pt-4 border-t border-[#E5E7EB]">
                        <h4 className="text-xs uppercase tracking-wide text-[#6B7280] font-semibold mb-2">Transfer summary</h4>
                        {summary.length === 0 ? (
                            <p className="text-[12.5px] text-[#6B7280] italic">No pharmacies added yet.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {summary.map((s, idx) => (
                                    <div key={idx} className="flex justify-between items-center rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[12.5px]">
                                        <div>
                                            <div className="font-bold">{s.pharmacyName}</div>
                                            <div className="text-[11.5px] text-[#6B7280]">
                                                {s.items.map((i) => `${i.code} × ${i.qty} @ $${i.price.toFixed(2)}`).join("  •  ")}
                                            </div>
                                        </div>
                                        <Button onClick={() => removeAllocation(idx)} className="text-[#B3261E] font-bold text-base px-1">
                                            ×
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t bg-white p-4 flex-row justify-between">
                    <span className="text-xs text-[#6B7280]">
                        {summary.length > 0
                            ? `${summary.length} pharmac${summary.length > 1 ? "ies" : "y"} · ${totalAllocated} units allocated`
                            : "Nothing allocated yet"}
                    </span>
                    <div className="flex gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSend} disabled={summary.length === 0 || sending}>
                            {sending ? "Sending…" : "Send transfer requests"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AllocationPanel({
    pharmacyName,
    medicines,
    remaining,
    draft,
    onQtyChange,
    onPriceChange,
    onAdd,
}: {
    pharmacyName: string
    medicines: Medication[]
    remaining: Record<string, number>
    draft: Record<string, { qty: string; price: string }>
    onQtyChange: (code: string, qty: string, price: number) => void
    onPriceChange: (code: string, price: string) => void
    onAdd: () => void
}) {
    const availableMeds = medicines.filter((m) => (remaining[m.code] ?? 0) > 0)
    const hasAnyQty = Object.values(draft).some((d) => (parseFloat(d.qty) || 0) > 0)

    return (
        <div className="rounded-xl border border-[#2563EB] bg-[#EFF6FF] p-3.5">
            <h4 className="text-[13.5px] font-semibold mb-2.5">Allocate to {pharmacyName}</h4>
            {availableMeds.length === 0 ? (
                <p className="text-[12.5px] text-[#6B7280] italic">All selected medicines are fully allocated.</p>
            ) : (
                <div className="space-y-2">
                    {availableMeds.map((m) => (
                        <div key={m.code} className="flex items-center gap-2.5">
                            <span className="flex-1 text-[12.5px] font-semibold">
                                {m.name} <span className="text-[11px] font-normal text-[#6B7280]">({remaining[m.code]} left)</span>
                            </span>
                            <input
                                type="number"
                                min={0}
                                max={remaining[m.code]}
                                value={draft[m.code]?.qty ?? ""}
                                onChange={(e) => onQtyChange(m.code, e.target.value, m.price)}
                                placeholder="qty"
                                className="w-[70px] rounded-md border border-[#E5E7EB] px-2 py-1.5 text-[12.5px] font-mono font-semibold"
                            />
                            <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={draft[m.code]?.price ?? ""}
                                onChange={(e) => onPriceChange(m.code, e.target.value)}
                                placeholder="$0.00"
                                className="w-[80px] rounded-md border border-[#E5E7EB] px-2 py-1.5 text-[12.5px] font-mono font-semibold"
                            />
                        </div>
                    ))}
                </div>
            )}
            <Button
                onClick={onAdd}
                disabled={!hasAnyQty}
                className="mt-2.5 rounded-lg bg-[#2563EB] text-white px-3.5 py-2 text-[12.5px] font-semibold disabled:bg-[#93C5FD] disabled:cursor-not-allowed"
            >
                Add to transfer
            </Button>
        </div>
    )
}