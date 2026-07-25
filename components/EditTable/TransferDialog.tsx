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

// TODO: replace with real nearby-pharmacy + demand data once API integration is wired up
const MOCK_PHARMACIES = [
    { id: "ph1", name: "Al-Shifa Pharmacy", distance: 2.3, angle: 40 },
    { id: "ph2", name: "Green Cross Pharmacy", distance: 4.1, angle: 130 },
    { id: "ph3", name: "Cedar Valley Pharmacy", distance: 6.8, angle: 210 },
    { id: "ph4", name: "Wellness Point Pharmacy", distance: 9.5, angle: 280 },
    { id: "ph5", name: "Al-Rahma Pharmacy", distance: 12.4, angle: 330 },
]

const MOCK_DEMAND: { id: string; name: string; needs: { code: string; qty: number }[] }[] = [
    { id: "ph3", name: "Cedar Valley Pharmacy", needs: [{ code: "AMX500", qty: 15 }, { code: "IBU200", qty: 20 }] },
    { id: "ph2", name: "Green Cross Pharmacy", needs: [{ code: "AMX500", qty: 30 }] },
    { id: "ph4", name: "Wellness Point Pharmacy", needs: [{ code: "IBU200", qty: 10 }] },
    { id: "ph5", name: "Al-Rahma Pharmacy", needs: [{ code: "AMX500", qty: 5 }] },
]

export type TransferAllocation = {
    pharmacyId: string
    pharmacyName: string
    items: { code: string; qty: number; price: number }[]
}

interface TransferDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    medicines: Medication[]
    onSend: (allocations: TransferAllocation[]) => void
}

export function TransferDialog({ open, onOpenChange, medicines, onSend }: TransferDialogProps) {
    const [activeTab, setActiveTab] = useState<"location" | "demand">("location")
    const [radiusKm, setRadiusKm] = useState(10)
    const [remaining, setRemaining] = useState<Record<string, number>>({})
    const [summary, setSummary] = useState<TransferAllocation[]>([])
    const [activePharmacy, setActivePharmacy] = useState<{ id: string; name: string } | null>(null)
    const [allocDraft, setAllocDraft] = useState<Record<string, { qty: string; price: string }>>({})

    // Reset all internal state whenever the dialog opens with a new selection
    useEffect(() => {
        if (open) {
            const initial: Record<string, number> = {}
            medicines.forEach((m) => { initial[m.code] = m.stock })
            setRemaining(initial)
            setSummary([])
            setActivePharmacy(null)
            setAllocDraft({})
            setActiveTab("location")
        }
    }, [open, medicines])

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

    function handleSend() {
        onSend(summary)
        onOpenChange(false)
    }

    const inRangePharmacies = MOCK_PHARMACIES.filter((p) => p.distance <= radiusKm)
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
                    <div className="flex flex-wrap gap-2 border-b border-[#D8E7DF] pb-4">
                        {medicines.map((m) => {
                            const rem = remaining[m.code] ?? m.stock
                            const pct = m.stock > 0 ? Math.round((rem / m.stock) * 100) : 0
                            const done = rem <= 0
                            return (
                                <div
                                    key={m.code}
                                    className={`flex-1 min-w-[180px] rounded-xl border border-[#D8E7DF] p-2.5 transition-opacity ${done ? "opacity-45 bg-[#F6F7F6]" : "bg-white"}`}
                                >
                                    <div className="flex justify-between text-[13px] font-semibold">
                                        <span>{m.name}</span>
                                        <span className="text-[11px] text-[#5B6B66] font-medium">{m.code}</span>
                                    </div>
                                    <div className="h-1.5 rounded bg-[#EAF3ED] mt-2 overflow-hidden">
                                        <div className="h-full bg-[#145C54] transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[11px] text-[#5B6B66] mt-1">
                                        <span>of {m.stock} units</span>
                                        <span className={`font-mono font-bold ${done ? "text-[#5B6B66]" : "text-[#145C54]"}`}>{rem} left</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-[#D8E7DF]">
                        {(["location", "demand"] as const).map((tab) => (
                            <Button
                                key={tab}
                                variant="ghost"
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 rounded-none py-2.5 text-[13.5px] font-semibold border-b-2 transition-colors ${activeTab === tab
                                        ? "bg-white text-[#145C54] border-[#145C54]"
                                        : "bg-white text-[#5B6B66] border-transparent hover:bg-[#F6F7F6]"
                                    }`}
                            >
                                {tab === "location" ? "Location" : "Demand"}
                            </Button>
                        ))}
                    </div>

                    {activeTab === "location" && (
                        <div className="pt-4 space-y-4">
                            <div className="flex gap-4">
                                <div className="shrink-0">
                                    <div
                                        className="relative rounded-full border border-[#D8E7DF] mx-auto"
                                        style={{ width: 220, height: 220, background: "radial-gradient(circle, #EAF3ED 0%, #FCFCFB 70%)" }}
                                    >
                                        <div
                                            className="absolute rounded-full border-2 border-dashed border-[#9FD8C7]"
                                            style={{
                                                width: (radiusKm / 20) * mapR * 2,
                                                height: (radiusKm / 20) * mapR * 2,
                                                top: "50%",
                                                left: "50%",
                                                transform: "translate(-50%, -50%)",
                                            }}
                                        />
                                        <div
                                            className="absolute rounded-full bg-[#145C54]"
                                            style={{ width: 10, height: 10, top: "50%", left: "50%", transform: "translate(-50%, -50%)", boxShadow: "0 0 0 4px rgba(20,92,84,.15)" }}
                                        />
                                        {MOCK_PHARMACIES.map((p) => {
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
                                                    className={`absolute w-3 h-3 rounded-full border-2 border-white transition-opacity ${inRange ? "bg-[#145C54] cursor-pointer" : "bg-[#E4C9C5] opacity-30 cursor-not-allowed"
                                                        }`}
                                                    style={{ left: x, top: y, transform: "translate(-50%, -50%)", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }}
                                                />
                                            )
                                        })}
                                    </div>
                                    <div className="mt-3 text-center">
                                        <label className="text-[11px] text-[#5B6B66] uppercase tracking-wide">
                                            Radius: <span className="font-mono font-bold text-[#145C54]">{radiusKm}</span> km
                                        </label>
                                        <input
                                            type="range"
                                            min={1}
                                            max={20}
                                            value={radiusKm}
                                            onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                                            className="w-full accent-[#145C54]"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-2 max-h-[250px] overflow-y-auto">
                                    {MOCK_PHARMACIES.slice().sort((a, b) => a.distance - b.distance).map((p) => {
                                        const inRange = p.distance <= radiusKm
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => inRange && openAllocation(p.id, p.name)}
                                                className={`flex justify-between items-center rounded-lg border border-[#D8E7DF] px-3 py-2.5 transition-colors ${inRange ? "cursor-pointer hover:border-[#145C54] hover:bg-[#EAF3ED]" : "opacity-40 cursor-not-allowed"
                                                    }`}
                                            >
                                                <div>
                                                    <div className="text-[13.5px] font-semibold">{p.name}</div>
                                                    <div className="text-[11.5px] text-[#5B6B66]">Nearby pharmacy</div>
                                                </div>
                                                <div className="text-xs font-bold font-mono text-[#145C54]">{p.distance} km</div>
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

                    {activeTab === "demand" && (
                        <div className="pt-4 space-y-4">
                            <div className="flex flex-col gap-2">
                                {MOCK_DEMAND.map((d) => {
                                    const matched = d.needs.filter((n) => remaining[n.code] !== undefined).length
                                    const partial = matched < medicines.length
                                    return (
                                        <div
                                            key={d.id}
                                            onClick={() => openAllocation(d.id, d.name)}
                                            className="rounded-lg border border-[#D8E7DF] p-3 cursor-pointer transition-colors hover:border-[#145C54] hover:bg-[#EAF3ED]"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-[13.5px] font-semibold">{d.name}</span>
                                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${partial ? "bg-[#E4C9C5] text-[#7A3B2E]" : "bg-[#145C54] text-white"
                                                    }`}>
                                                    wants {matched} of {medicines.length}
                                                </span>
                                            </div>
                                            <div className="flex gap-1.5 flex-wrap mt-2">
                                                {d.needs.map((n) => (
                                                    <span key={n.code} className="text-[11px] bg-[#EAF3ED] text-[#145C54] px-2 py-0.5 rounded-full font-semibold">
                                                        {n.code} · needs {n.qty}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
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
                    <div className="pt-4 border-t border-[#D8E7DF]">
                        <h4 className="text-xs uppercase tracking-wide text-[#5B6B66] font-semibold mb-2">Transfer summary</h4>
                        {summary.length === 0 ? (
                            <p className="text-[12.5px] text-[#5B6B66] italic">No pharmacies added yet.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {summary.map((s, idx) => (
                                    <div key={idx} className="flex justify-between items-center rounded-lg border border-[#D8E7DF] bg-white px-3 py-2 text-[12.5px]">
                                        <div>
                                            <div className="font-bold">{s.pharmacyName}</div>
                                            <div className="text-[11.5px] text-[#5B6B66]">
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
                    <span className="text-xs text-[#5B6B66]">
                        {summary.length > 0
                            ? `${summary.length} pharmac${summary.length > 1 ? "ies" : "y"} · ${totalAllocated} units allocated`
                            : "Nothing allocated yet"}
                    </span>
                    <div className="flex gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSend} disabled={summary.length === 0}>
                            Send transfer requests
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
        <div className="rounded-xl border border-[#145C54] bg-[#EAF3ED] p-3.5">
            <h4 className="text-[13.5px] font-semibold mb-2.5">Allocate to {pharmacyName}</h4>
            {availableMeds.length === 0 ? (
                <p className="text-[12.5px] text-[#5B6B66] italic">All selected medicines are fully allocated.</p>
            ) : (
                <div className="space-y-2">
                    {availableMeds.map((m) => (
                        <div key={m.code} className="flex items-center gap-2.5">
                            <span className="flex-1 text-[12.5px] font-semibold">
                                {m.name} <span className="text-[11px] font-normal text-[#5B6B66]">({remaining[m.code]} left)</span>
                            </span>
                            <input
                                type="number"
                                min={0}
                                max={remaining[m.code]}
                                value={draft[m.code]?.qty ?? ""}
                                onChange={(e) => onQtyChange(m.code, e.target.value, m.price)}
                                placeholder="qty"
                                className="w-[70px] rounded-md border border-[#D8E7DF] px-2 py-1.5 text-[12.5px] font-mono font-semibold"
                            />
                            <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={draft[m.code]?.price ?? ""}
                                onChange={(e) => onPriceChange(m.code, e.target.value)}
                                placeholder="$0.00"
                                className="w-[80px] rounded-md border border-[#D8E7DF] px-2 py-1.5 text-[12.5px] font-mono font-semibold"
                            />
                        </div>
                    ))}
                </div>
            )}
            <Button
                onClick={onAdd}
                disabled={!hasAnyQty}
                className="mt-2.5 rounded-lg bg-[#145C54] text-white px-3.5 py-2 text-[12.5px] font-semibold disabled:bg-[#B7C4C1] disabled:cursor-not-allowed"
            >
                Add to transfer
            </Button>
        </div>
    )
}