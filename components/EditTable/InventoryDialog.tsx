import { useState } from "react"
import { ChevronDown, Package, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Medication } from "@/data/medications"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InventoryPopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: Medication | null
}

interface AddProductpopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type StockMode = "in" | "out"

export function InventoryPop({ open, onOpenChange, medicine }: InventoryPopProps) {
  const [stockOpen, setStockOpen] = useState(false)
  const [discountOpen, setDiscountOpen] = useState(false)

  const [mode, setMode] = useState<StockMode>("in")
  const [qty, setQty] = useState("")

  const [discPercent, setDiscPercent] = useState("")
  const [discAmount, setDiscAmount] = useState("")

  if (!medicine) return null

  const currentStock = medicine.stock ?? 0
  const unitPrice = medicine.price ?? 0

  // ---- stock calc ----
  const qtyNum = qty === "" ? 0 : parseFloat(qty)
  let qtyError = ""
  if (qty !== "" && (isNaN(qtyNum) || qtyNum < 0)) {
    qtyError = "Enter a positive number."
  } else if (mode === "out" && qtyNum > currentStock) {
    qtyError = `Can't dispense more than the ${currentStock} in stock.`
  }
  const qtyValid = qtyError === ""
  const newStock = !qtyValid
    ? currentStock
    : mode === "in"
      ? currentStock + qtyNum
      : currentStock - qtyNum
  const stockDirty = qty !== "" && qtyNum > 0 && qtyValid

  // ---- discount calc ----
  const handlePercentChange = (value: string) => {
    setDiscPercent(value)
    const p = Math.min(100, Math.max(0, parseFloat(value) || 0))
    const amt = Math.round(unitPrice * (p / 100) * 100) / 100
    setDiscAmount(value ? amt.toFixed(2) : "")
  }

  const handleAmountChange = (value: string) => {
    setDiscAmount(value)
    const amt = Math.min(unitPrice, Math.max(0, parseFloat(value) || 0))
    const p = Math.round((amt / unitPrice) * 100 * 10) / 10
    setDiscPercent(value ? p.toString() : "")
  }

  const discPercentNum = parseFloat(discPercent) || 0
  const discAmountNum = parseFloat(discAmount) || 0
  const discountDirty = discAmountNum > 0
  const finalPrice = Math.max(0, unitPrice - discAmountNum)

  const canSave = (stockDirty || discountDirty) && qtyValid

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return

    const calls: string[] = []
    if (stockDirty) {
      calls.push(
        mode === "in"
          ? `stockIn({ id: medicine.id, qty: ${qtyNum} })`
          : `dispense({ id: medicine.id, qty: ${qtyNum} })`
      )
    }
    if (discountDirty) {
      calls.push(`discount({ id: medicine.id, percent: ${discPercentNum} })`)
    }
    // TODO: replace with real API calls once backend is available
    console.log("Would call:", calls)

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSave}>
        <DialogTrigger />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit medicine</DialogTitle>
            <DialogDescription>
              Make changes to your medicine. Please note that changes cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <div className="flex flex-col gap-3">
                {/* STOCK SECTION */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setStockOpen((o) => !o)}
                    aria-expanded={stockOpen}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                        <Package size={15} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          Adjust stock{" "}
                          {stockDirty && (
                            <span className="ml-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-800">
                              Changed
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {stockDirty
                            ? `Current: ${currentStock} → New: ${newStock}`
                            : `Current: ${currentStock} units`}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${stockOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {stockOpen && (
                    <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-4 flex flex-col gap-3.5">
                      <div>
                        <Label className="text-xs uppercase tracking-wide text-slate-500 mb-1.5 block">
                          Direction
                        </Label>
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setMode("in")}
                            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                              mode === "in"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-white text-slate-500"
                            }`}
                          >
                            Stock in ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => setMode("out")}
                            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                              mode === "out"
                                ? "bg-orange-50 text-orange-700"
                                : "bg-white text-slate-500"
                            }`}
                          >
                            Dispense ↓
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs uppercase tracking-wide text-slate-500 mb-1.5 block">
                          {mode === "in" ? "Quantity to add" : "Quantity to dispense"}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={qty}
                          onChange={(e) => setQty(e.target.value)}
                          className={`font-mono font-semibold ${qtyError ? "border-red-500" : ""}`}
                        />
                        {qtyError && (
                          <p className="mt-1 text-xs font-semibold text-red-600">{qtyError}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2.5 text-sm">
                        <span className="text-slate-700">
                          {currentStock} <span className="text-slate-400 mx-1.5">→</span>
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            !qtyValid ? "text-red-600" : mode === "in" ? "text-emerald-700" : "text-orange-700"
                          }`}
                        >
                          {newStock}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* DISCOUNT SECTION */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setDiscountOpen((o) => !o)}
                    aria-expanded={discountOpen}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                        <Percent size={14} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          Apply discount{" "}
                          {discountDirty && (
                            <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">
                              Changed
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {discountDirty
                            ? `${discPercentNum}% off → $${finalPrice.toFixed(2)}`
                            : "No discount applied"}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${discountOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {discountOpen && (
                    <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-4 flex flex-col gap-3.5">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label className="text-xs uppercase tracking-wide text-slate-500 mb-1.5 block">
                            Discount %
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            value={discPercent}
                            onChange={(e) => handlePercentChange(e.target.value)}
                            className="font-mono font-semibold"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs uppercase tracking-wide text-slate-500 mb-1.5 block">
                            Discount $
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            value={discAmount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="font-mono font-semibold"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-3 text-sm">
                        <span className="text-slate-700">
                          Unit price{" "}
                          {discountDirty && (
                            <span className="font-mono text-slate-400 line-through">
                              ${unitPrice.toFixed(2)}
                            </span>
                          )}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            discountDirty ? "text-blue-800" : "text-slate-900"
                          }`}
                        >
                          ${discountDirty ? finalPrice.toFixed(2) : unitPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter className="flex items-center gap-2 sm:justify-between">
            <span className="text-xs text-slate-500">
              {stockDirty || discountDirty ? "Changes will be saved on submit" : "No changes yet"}
            </span>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button">Close</Button>
              </DialogClose>
              <Button type="submit" disabled={!canSave}>Save changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export function AddProduct({ open, onOpenChange }: AddProductpopProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogTrigger />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Medication</DialogTitle>
            <DialogDescription>
              Add new medication to your inventory
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Code</Label>
              <Input required />
            </Field>
            <Field>
              <Label>Medicine Name</Label>
              <Input type="string" required />
            </Field>
            <Field>
              <Label>Quantity</Label>
              <Input type="number" required />
            </Field>
            <Field>
              <Label>Price</Label>
              <Input type="number" required />
            </Field>
            <Field>
              <Label>Expiry Date</Label>
              <Input type="date" required />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose />
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}