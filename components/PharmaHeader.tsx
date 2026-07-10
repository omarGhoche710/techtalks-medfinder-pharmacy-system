"use client"
import { Plus } from 'lucide-react'
import SearchBar from "./Searchbar";
import type { Medication } from "@/data/medications";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  medications: Medication[];
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
};

export function Header({
  medications,
  query,
  onQueryChange,
  onSearch,
}: HeaderProps) {
  return (
    <div className="w-full">
      <div className="flex w-full justify-center px-6 pt-4">
        <SearchBar
          medications={medications}
          query={query}
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </div>
      <div className="flex justify-end px-6 pt-6 pb-4">
        <Button className="h-10 gap-1.5 bg-[#2563EB] px-4 text-white hover:bg-[#1d4ed8]">
          <Plus className="size-4" />
          Add New Product
        </Button>
      </div>
    </div>
  )
}