"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Medication } from "@/data/medications"
import { TransferDialog, TransferAllocation } from "./TransferDialog"

interface NearExpiryActionBarProps {
    selected: Medication[]
    onClearSelection: () => void
    onApplyDiscount: (medicines: Medication[], percent: number) => void
    onConfirmDamage: (medicines: Medication[]) => void
    onTransfer: (medicines: Medication[]) => void
    pharmacyId?: string
}

export function NearExpiryActionBar({
    selected,
    onClearSelection,
    onApplyDiscount,
    onConfirmDamage,
    onTransfer,
    pharmacyId = "",
}: NearExpiryActionBarProps) {
    const [discountOpen, setDiscountOpen] = useState(false)
    const [damageOpen, setDamageOpen] = useState(false)
    const [transferOpen, setTransferOpen] = useState(false)
    const [percent, setPercent] = useState("")

    if (selected.length === 0) return null

    const percentNum = Math.min(100, Math.max(0, parseFloat(percent) || 0))

    const handleApplyDiscount = () => {
        onApplyDiscount(selected, percentNum)
        setPercent("")
        setDiscountOpen(false)
        onClearSelection()
    }

    const handleConfirmDamage = () => {
        onConfirmDamage(selected)
        setDamageOpen(false)
        onClearSelection()
    }

    const handleTransferSend = (allocations: TransferAllocation[]) => {
        // TODO: pass full `allocations` (per-pharmacy qty/price) through once API integration is wired up.
        // For now we only forward the flat medicine list, matching the existing onTransfer signature.
        onTransfer(selected)
        onClearSelection()
    }

    return (
        <>
            <div className="sticky top-0 z-20 mb-3 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#2563EB] px-4 py-3 text-white shadow-sm">
                <span className="text-sm font-semibold">
                    {selected.length} selected
                </span>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setTransferOpen(true)}>
                        Transfer
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setDiscountOpen(true)}>
                        Discount
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-red-50 text-red-700 hover:bg-red-100"
                        onClick={() => setDamageOpen(true)}
                    >
                        Damage
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onClearSelection}>
                        Clear
                    </Button>
                </div>
            </div>

            {/* Discount dialog */}
            <Dialog open={discountOpen} onOpenChange={setDiscountOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Apply discount</DialogTitle>
                        <DialogDescription>
                            This percentage will be applied to all {selected.length} selected medicines.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <Label className="text-xs uppercase tracking-wide text-slate-500 mb-1.5 block">
                            Discount %
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            value={percent}
                            onChange={(e) => setPercent(e.target.value)}
                            className="font-mono font-semibold"
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleApplyDiscount} disabled={percentNum <= 0}>
                            Apply to {selected.length} items
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Damage confirmation */}
            <Dialog open={damageOpen} onOpenChange={setDamageOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Mark as damaged</DialogTitle>
                        <DialogDescription>
                            This will remove the following {selected.length} item(s). This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <ul className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-2 text-sm text-slate-700">
                        {selected.map((m) => (
                            <li key={m.code} className="px-2 py-1">{m.name}</li>
                        ))}
                    </ul>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleConfirmDamage}
                        >
                            Confirm damage
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transfer dialog */}
            <TransferDialog
                open={transferOpen}
                onOpenChange={setTransferOpen}
                medicines={selected}
                pharmacyId={pharmacyId}
                onSend={handleTransferSend}
            />
        </>
    )
}