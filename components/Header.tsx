"use client";

import SearchBar from "@/components/SearchBar";
import type { Medication } from "@/data/medications";

type HeaderProps = {
  medications: Medication[];
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
};

export default function Header({
  medications,
  query,
  onQueryChange,
  onSearch,
}: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-4 w-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-700">Pharmacy name</span>
      </div>

      <div className="flex flex-1 justify-center px-6">
        <SearchBar
          medications={medications}
          query={query}
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Role</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-xs font-medium text-white">
          AD
        </div>
      </div>
    </header>
  );
}
