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
      className={`card-interactive ${isSelected ? "card-selected" : ""}`}
    >
        <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            {result.medicineName}
          </h3>
          <p className="text-xs text-gray-500">{result.medicineCode}</p>
        </div>
        <div className="text-right">
          {result.originalPrice && result.originalPrice > result.price ? (
            <div className="flex items-baseline gap-2">
              <span className="price-text text-lg font-semibold text-[var(--primary)]">
                ${result.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${result.originalPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="price-text text-lg font-semibold text-[var(--primary)]">
              ${result.price.toFixed(2)}
            </span>
          )}
        </div>
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
        {typeof result.daysToExpiry === "number" && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              result.daysToExpiry <= 0
                ? "bg-red-100 text-red-800"
                : result.daysToExpiry <= 7
                ? "bg-amber-100 text-amber-800"
                : "badge-muted"
            }`}
          >
            {result.daysToExpiry <= 0
              ? "Expired"
              : result.daysToExpiry === 1
              ? "Expiring in 1 day"
              : `Expiring in ${result.daysToExpiry} days`}
          </span>
        )}
        {nearMe && result.distanceKm !== null && (
          <span className="badge-muted">
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
        className="mt-3 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
        aria-expanded={expanded}
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </article>
  );
}
