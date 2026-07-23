"use client";

import { stockColor, stockLabel } from "@/lib/filters";
import { formatDistance } from "@/lib/geo";
import type { SearchResult } from "@/lib/types";

type ResultListItemProps = {
  result: SearchResult;
  nearMe: boolean;
};

export default function ResultListItem({ result, nearMe }: ResultListItemProps) {
  return (
    <article
      className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
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
    </article>
  );
}
