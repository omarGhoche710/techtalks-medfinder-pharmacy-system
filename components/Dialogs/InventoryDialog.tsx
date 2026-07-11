//this page is for the edit button in the data-table
//button shows different pop-ups depending on the page: inventroy, expired, or near expiry
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
import { useRef } from "react";

interface InventoryPopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: Medication | null
}

interface AddProductpopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InventoryPop({ open, onOpenChange, medicine }: InventoryPopProps) {
  if (!medicine) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogTrigger />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit medicine</DialogTitle>
            <DialogDescription>
              Make changes to your medicine. Please not that changes cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Choose action to proceed:</Label>
              <div className="flex justify-center gap-2">
                <button className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
                  Stock-in
                </button>
                <button className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
                  Dispense
                </button>
                <button className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
                  Damage
                </button>
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button >Close</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
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
              <Input required/>
            </Field>
            <Field>
              <Label>Medicine Name</Label>
              <Input type="string" required/>
            </Field>
            <Field>
              <Label>Quantity</Label>
              <Input type="number" required/>
            </Field>
            <Field>
              <Label>Price</Label>
              <Input type="number" required/>
            </Field>
            <Field>
              <Label>Expiry Date</Label>
              <Input type="date" required/>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose/>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
