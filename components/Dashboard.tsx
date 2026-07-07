"use client";

import { useMemo, useState } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MedicationTable from "@/components/MedicationTable";
import Sidebar from "@/components/Sidebar";
import { medications as allMedications } from "@/data/medications";
import { filterMedications } from "@/lib/searchMedications";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMedications = useMemo(
    () => filterMedications(allMedications, searchQuery),
    [searchQuery]
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <Header
            medications={allMedications}
            query={query}
            onQueryChange={setQuery}
            onSearch={setSearchQuery}
          />

          <main className="flex-1 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                <h1 className="text-lg font-semibold text-gray-900">
                  Pharmacy name&apos;s Medication&apos;s Table
                </h1>
                {searchQuery && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#2563eb]">
                    {filteredMedications.length} result
                    {filteredMedications.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  Filter
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  Download
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add New Product
                </button>
              </div>
            </div>

            <MedicationTable
              medications={filteredMedications}
              query={searchQuery}
            />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
