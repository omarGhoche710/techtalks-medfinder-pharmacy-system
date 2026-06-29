"use client";

import { useState } from "react";
import SearchBar from "./components/SearchBar";

export default function Home() {
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-teal-50/80 to-white dark:from-zinc-950 dark:to-black">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
            Rx
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              MedFinder
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pharmacy medication locator
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 py-16 sm:py-24">
        <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              Find your medication nearby
            </h1>
            <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Search for a drug and see which pharmacies near you have it in
              stock.
            </p>
          </div>

          <SearchBar onSearch={setLastQuery} />

          {lastQuery && (
            <p className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-100">
              Searching for{" "}
              <span className="font-semibold">&ldquo;{lastQuery}&rdquo;</span>{" "}
              — results will appear here once the API is connected.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
