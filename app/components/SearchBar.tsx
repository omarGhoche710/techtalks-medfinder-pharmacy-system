"use client";

import { FormEvent, useState } from "react";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export default function SearchBar({
  placeholder = "Search medicines by name...",
  className = "",
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch?.(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full items-center gap-2 rounded-full border border-medfinder-teal/20 bg-medfinder-surface p-2 pl-5 shadow-sm transition-shadow focus-within:border-medfinder-teal/40 focus-within:shadow-md ${className}`}
      role="search"
      aria-label="Search medicines"
    >
      <SearchIcon className="h-5 w-5 shrink-0 text-medfinder-muted" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-medfinder-muted/70 outline-none"
        aria-label="Medicine name"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-medfinder-teal px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-medfinder-teal-dark"
      >
        Search
      </button>
    </form>
  );
}
