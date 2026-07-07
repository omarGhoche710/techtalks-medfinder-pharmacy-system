"use client";

import type { Medication } from "@/data/medications";
import { highlightMatch } from "@/lib/searchMedications";

type MedicationTableProps = {
  medications: Medication[];
  query: string;
};

function HighlightedCell({ text, query }: { text: string; query: string }) {
  const parts = highlightMatch(text, query);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark
            key={index}
            className="rounded bg-blue-100 px-0.5 font-medium text-blue-800"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

function SortIcon() {
  return (
    <svg
      className="ml-1 inline h-3 w-3 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  );
}

export default function MedicationTable({
  medications,
  query,
}: MedicationTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#2563eb]"
                />
              </th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">
                Medicine Name
                <SortIcon />
              </th>
              <th className="px-4 py-3">
                Quantity
                <SortIcon />
              </th>
              <th className="px-4 py-3">
                Expiry
                <SortIcon />
              </th>
              <th className="px-4 py-3">
                Description
                <SortIcon />
              </th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {medications.length > 0 ? (
              medications.map((medication) => (
                <tr
                  key={medication.id}
                  className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[#2563eb]"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: medication.imageColor }}
                    >
                      {medication.code.slice(0, 3)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900">
                      <HighlightedCell text={medication.name} query={query} />
                    </p>
                    <p className="text-xs text-gray-500">
                      <HighlightedCell text={medication.code} query={query} />
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {medication.quantity}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {medication.expiry}
                  </td>
                  <td className="max-w-xs px-4 py-4">
                    <p className="line-clamp-2 text-sm text-gray-600">
                      <HighlightedCell
                        text={medication.description}
                        query={query}
                      />
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      aria-label={`Edit ${medication.name}`}
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-sm text-gray-500">
                    No medications match your search.
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Try a different name, code, or description.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <button
          type="button"
          className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
          aria-label="Delete selected"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>

        <div className="flex items-center gap-1 text-sm">
          <button
            type="button"
            className="rounded p-1 text-gray-400 hover:text-gray-600"
            aria-label="Previous page"
          >
            ‹
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              type="button"
              className={`flex h-8 w-8 items-center justify-center rounded ${
                page === 1
                  ? "border border-[#2563eb] text-[#2563eb]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="rounded p-1 text-gray-400 hover:text-gray-600"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
