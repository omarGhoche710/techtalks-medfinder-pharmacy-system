"use client";

import type { FilterState, StockStatus } from "@/lib/types";

type FilterBarProps = {
  filters: FilterState;
  nearMe: boolean;
  onChange: (filters: FilterState) => void;
  disabled?: boolean;
};

const availabilityOptions: { value: StockStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

const distanceOptions = [
  { value: null, label: "Any distance" },
  { value: 2, label: "Within 2 km" },
  { value: 5, label: "Within 5 km" },
  { value: 10, label: "Within 10 km" },
];

const priceOptions = [
  { value: null, label: "Any price" },
  { value: 5, label: "Under $5" },
  { value: 10, label: "Under $10" },
  { value: 15, label: "Under $15" },
];

export default function FilterBar({
  filters,
  nearMe,
  onChange,
  disabled = false,
}: FilterBarProps) {
  return (
    <div
      role="group"
      aria-label="Search filters"
      className="flex flex-wrap items-center gap-3"
    >
      {nearMe && (
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-600">Distance</span>
          <select
            aria-label="Filter by distance"
            value={filters.maxDistance ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                maxDistance: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={`input-field ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            disabled={disabled}
          >
            {distanceOptions.map((opt) => (
              <option key={String(opt.value)} value={opt.value ?? ""}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex items-center gap-2 text-sm">
        <span className="font-medium text-gray-600">Price</span>
        <select
          aria-label="Filter by price"
          value={filters.maxPrice ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              maxPrice: e.target.value ? Number(e.target.value) : null,
            })
          }
          className={`input-field ${disabled ? "opacity-50 pointer-events-none" : ""}`}
          disabled={disabled}
        >
          {priceOptions.map((opt) => (
            <option key={String(opt.value)} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="font-medium text-gray-600">Availability</span>
        <select
          aria-label="Filter by availability"
          value={filters.availability}
          onChange={(e) =>
            onChange({
              ...filters,
              availability: e.target.value as StockStatus | "all",
            })
          }
          className={`input-field ${disabled ? "opacity-50 pointer-events-none" : ""}`}
          disabled={disabled}
        >
          {availabilityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
