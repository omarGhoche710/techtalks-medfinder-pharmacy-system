"use client";

import { FormEvent, useState } from "react";

type SearchBarProps = {
  onSearch?: (query: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  onSearch,
  placeholder = "Search for a medication (e.g., Amoxicillin, Ibuprofen)",
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
      className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
      role="search"
      aria-label="Medication search"
    >
      <div className="relative flex-1">
        <label htmlFor="medication-search" className="sr-only">
          Medication name
        </label>
        <span
          className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400"
          aria-hidden="true"
        >
          <SearchIcon />
        </span>
        <input
          id="medication-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-teal-400"
        />
      </div>
      <button
        type="submit"
        disabled={!query.trim()}
        className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-400"
      >
        Search
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
