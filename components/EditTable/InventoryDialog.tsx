"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
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

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  onConfirm: () => void
}

type StockMode = "in" | "out"

// ─── Delete confirmation dialog ──────────────────────────────────────────────

export function DeleteConfirmDialog({ open, onOpenChange, count, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className="hidden" />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {count} medication{count !== 1 ? "s" : ""}?</DialogTitle>
          <DialogDescription>
            This will permanently remove {count === 1 ? "this medication" : `these ${count} medications`} from your inventory. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => { onConfirm(); onOpenChange(false) }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit existing medication ────────────────────────────────────────────────

export function InventoryPop({ open, onOpenChange, medicine }: InventoryPopProps) {
  const router = useRouter()
  const [stockOpen, setStockOpen] = useState(false)
  const [discountOpen, setDiscountOpen] = useState(false)
  const [mode, setMode] = useState<StockMode>("in")
  const [qty, setQty] = useState("")
  const [discPercent, setDiscPercent] = useState("")
  const [discAmount, setDiscAmount] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  if (!medicine) return null

  const currentStock = medicine.stock ?? 0
  const unitPrice = medicine.price ?? 0

  const qtyNum = qty === "" ? 0 : parseFloat(qty)
  let qtyError = ""
  if (qty !== "" && (isNaN(qtyNum) || qtyNum < 0)) {
    qtyError = "Enter a positive number."
  } else if (mode === "out" && qtyNum > currentStock) {
    qtyError = `Can't dispense more than the ${currentStock} in stock.`
  }
  const qtyValid = qtyError === ""
  const newStock = !qtyValid ? currentStock : mode === "in" ? currentStock + qtyNum : currentStock - qtyNum
  const stockDirty = qty !== "" && qtyNum > 0 && qtyValid

  const handlePercentChange = (value: string) => {
    setDiscPercent(value)
    const p = Math.min(100, Math.max(0, parseFloat(value) || 0))
    setDiscAmount(value ? (Math.round(unitPrice * (p / 100) * 100) / 100).toFixed(2) : "")
  }

  const handleAmountChange = (value: string) => {
    setDiscAmount(value)
    const amt = Math.min(unitPrice, Math.max(0, parseFloat(value) || 0))
    setDiscPercent(value ? (Math.round((amt / unitPrice) * 100 * 10) / 10).toString() : "")
  }

  const discPercentNum = parseFloat(discPercent) || 0
  const discAmountNum = parseFloat(discAmount) || 0
  const discountDirty = discAmountNum > 0
  const finalPrice = Math.max(0, unitPrice - discAmountNum)
  const canSave = (stockDirty || discountDirty) && qtyValid && !saving

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setSaveError("")
    try {
      const body: Record<string, unknown> = {}
      if (stockDirty) body.stock_delta = mode === "in" ? qtyNum : -qtyNum
      if (discountDirty) body.discount_percentage = discPercentNum

      const res = await fetch(`/api/inventory/${medicine.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to save changes.")
      }
      onOpenChange(false)
      setQty(""); setDiscPercent(""); setDiscAmount("")
      router.refresh()
    } catch (err: any) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className="hidden" />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit medicine</DialogTitle>
          <DialogDescription>Make changes to your medicine. This cannot be undone.</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <div className="flex flex-col gap-3">
              {/* STOCK */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <button type="button" onClick={() => setStockOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-800"><Package size={15} /></div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Adjust stock{stockDirty && <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">Changed</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {stockDirty ? `Current: ${currentStock} → New: ${newStock}` : `Current: ${currentStock} units`}
                      </div>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${stockOpen ? "rotate-180" : ""}`} />
                </button>
                {stockOpen && (
                  <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-4 flex flex-col gap-3.5">
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-slate-500 mb-1.5 block">Direction</Label>
                      <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        <button type="button" onClick={() => setMode("in")} className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === "in" ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-500"}`}>Stock in ↑</button>
                        <button type="button" onClick={() => setMode("out")} className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === "out" ? "bg-orange-50 text-orange-700" : "bg-white text-slate-500"}`}>Dispense ↓</button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wide text-slate-500 mb-1.5 block">{mode === "in" ? "Quantity to add" : "Quantity to dispense"}</Label>
                      <Input type="number" min={0} placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} className={`font-mono font-semibold ${qtyError ? "border-red-500" : ""}`} />
                      {qtyError && <p className="mt-1 text-xs font-semibold text-red-600">{qtyError}</p>}
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2.5 text-sm">
                      <span className="text-slate-700">{currentStock} <span className="text-slate-400 mx-1.5">→</span></span>
                      <span className={`font-mono font-bold ${!qtyValid ? "text-red-600" : mode === "in" ? "text-emerald-700" : "text-orange-700"}`}>{newStock}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* DISCOUNT */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <button type="button" onClick={() => setDiscountOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-800"><Percent size={14} /></div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Apply discount{discountDirty && <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800">Changed</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{discountDirty ? `${discPercentNum}% off → $${finalPrice.toFixed(2)}` : "No discount applied"}</div>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${discountOpen ? "rotate-180" : ""}`} />
                </button>
                {discountOpen && (
                  <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-4 flex flex-col gap-3.5">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label className="text-xs uppercase tracking-wide text-slate-500 mb-1.5 block">Discount %</Label>
                        <Input type="number" min={0} max={100} placeholder="0" value={discPercent} onChange={(e) => handlePercentChange(e.target.value)} className="font-mono font-semibold" />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs uppercase tracking-wide text-slate-500 mb-1.5 block">Discount $</Label>
                        <Input type="number" min={0} step={0.01} placeholder="0.00" value={discAmount} onChange={(e) => handleAmountChange(e.target.value)} className="font-mono font-semibold" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-3 text-sm">
                      <span className="text-slate-700">Unit price{discountDirty && <span className="font-mono text-slate-400 line-through ml-1">${unitPrice.toFixed(2)}</span>}</span>
                      <span className={`font-mono font-bold ${discountDirty ? "text-blue-800" : "text-slate-900"}`}>${discountDirty ? finalPrice.toFixed(2) : unitPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Field>
        </FieldGroup>

        {saveError && <p className="text-xs text-red-600 px-1">{saveError}</p>}

        <DialogFooter className="flex items-center gap-2 sm:justify-between">
          <span className="text-xs text-slate-500">{stockDirty || discountDirty ? "Changes will be saved on submit" : "No changes yet"}</span>
          <div className="flex gap-2">
            <DialogClose asChild><Button variant="outline" type="button">Close</Button></DialogClose>
            <Button type="button" onClick={handleSave} disabled={!canSave}>{saving ? "Saving…" : "Save changes"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add new medication ──────────────────────────────────────────────────────

export function AddProduct({ open, onOpenChange }: AddProductpopProps) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const reset = () => {
    setCode(""); setName(""); setDescription(""); setQuantity(""); setPrice(""); setExpiryDate(""); setError("")
  }

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim() || !price || !expiryDate) {
      setError("Code, name, price, and expiry date are required.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          medicationName: name.trim(),
          description: description.trim() || undefined,
          quantity: quantity ? parseInt(quantity, 10) : 0,
          price: parseFloat(price),
          expiryDate,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to add product.")
      }
      const created = await res.json()
      reset()
      onOpenChange(false)
      router.push(created.status === "NEAR_EXPIRY" ? "/pharmacy/NearExpiry" : "/pharmacy/Inventory")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogTrigger className="hidden" />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
          <DialogDescription>Add a new medication to your inventory.</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <Label>Code</Label>
            <Input required placeholder="e.g. MED-001" value={code} onChange={(e) => setCode(e.target.value)} />
          </Field>
          <Field>
            <Label>Medicine Name</Label>
            <Input required placeholder="e.g. Paracetamol" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field>
            <Label>Description <span className="text-[#6B7280] font-normal text-xs">(optional)</span></Label>
            <Input placeholder="e.g. Pain relief, 500mg tablets" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field>
            <Label>Quantity</Label>
            <Input type="number" min={0} placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </Field>
          <Field>
            <Label>Price ($)</Label>
            <Input required type="number" min={0} step={0.01} placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Field>
            <Label>Expiry Date</Label>
            <Input required type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </Field>
        </FieldGroup>

        {error && <p className="text-xs text-red-600 px-1">{error}</p>}

        <DialogFooter>
          <DialogClose asChild><Button variant="outline" type="button" onClick={reset}>Cancel</Button></DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={saving}>{saving ? "Adding…" : "Add Product"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
