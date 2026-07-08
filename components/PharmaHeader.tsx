"use client"
import {Plus} from 'lucide-react'
import {Button} from "@/components/ui/button";

export function AddProductButton() {
  return (
    <div className="flex justify-end px-6 pt-2 pb-4">
      <Button className="h-10 gap-1.5 bg-primary px-4 text-primary-foreground hover:bg-primary/90">
        <Plus className="size-4" />
        Add New Product
      </Button>
    </div>
  )
}

export function Searchbar() {
    //add top search bar
}