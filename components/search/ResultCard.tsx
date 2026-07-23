"use client";

import { stockColor, stockLabel } from "@/lib/filters";
import { formatDistance } from "@/lib/geo";
import type { SearchResult } from "@/lib/types";
import { useState } from "react";

type ResultCardProps = {
  result: SearchResult;
  isSelected: boolean;
  nearMe: boolean;
  onSelect: () => void;
};

export default function ResultCard({
  result,
  isSelected,
  nearMe,
  onSelect,
}: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      id={`result-${result.id}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${result.medicineName} at ${result.pharmacy.name}`}
      className={`cursor-pointer rounded-xl border bg-white p-4 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] ${
        isSelected
          ? "border-[#2563eb] shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            {result.medicineName}
          </h3>
          <p className="text-xs text-gray-500">{result.medicineCode}</p>
        </div>
        <span className="text-lg font-bold text-[#2563eb]">
          ${result.price.toFixed(2)}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-sm font-medium text-gray-800">
          {result.pharmacy.name}
        </p>
        <p className="text-xs text-gray-500">{result.pharmacy.address}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stockColor(result.stock)}`}
        >
          {stockLabel(result.stock)}
          {result.stock !== "out_of_stock" && ` (${result.quantity})`}
        </span>
        {nearMe && result.distanceKm !== null && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {formatDistance(result.distanceKm)}
          </span>
        )}
      </div>

      {expanded && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600">{result.description}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-gray-400">Phone</dt>
              <dd className="font-medium text-gray-700">
                {result.pharmacy.phone}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Hours</dt>
              <dd className="font-medium text-gray-700">
                {result.pharmacy.hours}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="mt-3 text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8]"
        aria-expanded={expanded}
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </article>
  );
}
