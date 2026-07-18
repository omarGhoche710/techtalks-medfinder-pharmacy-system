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

interface ExpiredActionBarProps {
    selected: Medication[]
    onClearSelection: () => void
    onConfirmDamage: (medicines: Medication[]) => void
}

export function ExpiredActionBar({
    selected,
    onClearSelection,
    onConfirmDamage,
}: ExpiredActionBarProps) {
    const [damageOpen, setDamageOpen] = useState(false)

    if (selected.length === 0) return null

    const handleConfirmDamage = () => {
        onConfirmDamage(selected)
        setDamageOpen(false)
        onClearSelection()
    }

    return (
        <>
            <div className="sticky top-0 z-20 mb-3 flex items-center justify-between rounded-xl border border-[#D8E7DF] bg-[#145C54] px-4 py-3 text-white shadow-sm">
                <span className="text-sm font-semibold">
                    {selected.length} selected
                </span>
                <div className="flex gap-2">
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
        </>
    )
}
