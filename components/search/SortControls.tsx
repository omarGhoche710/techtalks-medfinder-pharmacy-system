"use client";

import type { SortOption } from "@/lib/types";

type SortControlsProps = {
  sort: SortOption;
  nearMe: boolean;
  onChange: (sort: SortOption) => void;
};

const sortOptions: { value: SortOption; label: string; nearMeOnly?: boolean }[] =
  [
    { value: "distance", label: "Distance", nearMeOnly: true },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
  ];

export default function SortControls({
  sort,
  nearMe,
  onChange,
}: SortControlsProps) {
  const options = sortOptions.filter((o) => !o.nearMeOnly || nearMe);

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium text-gray-600">Sort by</span>
      <select
        aria-label="Sort results"
        value={sort}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="input-field"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
