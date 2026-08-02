"use client"
import { Plus } from 'lucide-react'
import { useState } from 'react';
import SearchBar from "./Searchbar";
import type { Medication } from "@/data/medications";
import { Button } from "@/components/ui/button";
import { AddProduct } from './EditTable/InventoryDialog';

type HeaderProps = {
  medications: Medication[];
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
};

export function Header({ medications, query, onQueryChange, onSearch }: HeaderProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  return (
    <div className="w-full border-b border-[#E5E7EB] bg-white">
      <div className="flex w-full justify-center px-6 pt-4">
        <SearchBar
          medications={medications}
          query={query}
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </div>
      <div className="flex justify-end px-6 pt-4 pb-4">
        <Button onClick={() => setIsAddOpen(true)} className="h-10 gap-1.5 rounded-lg bg-[#2563EB] px-4 text-white transition-colors hover:bg-[#1D4ED8] active:scale-[0.98]">
          <Plus className="size-4" />
          Add New Product
        </Button>
      </div>
      <AddProduct open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  )
}
