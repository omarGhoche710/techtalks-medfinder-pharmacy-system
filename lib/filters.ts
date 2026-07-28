import type { FilterState, SearchResult, SortOption, StockStatus } from "@/lib/types";

export function applyFilters(
  results: SearchResult[],
  filters: FilterState,
  nearMe: boolean
): SearchResult[] {
  return results.filter((item) => {
    if (filters.availability !== "all" && item.stock !== filters.availability) {
      return false;
    }
    if (filters.maxPrice !== null && item.price > filters.maxPrice) {
      return false;
    }
    if (
      nearMe &&
      filters.maxDistance !== null &&
      item.distanceKm !== null &&
      item.distanceKm > filters.maxDistance
    ) {
      return false;
    }
    return true;
  });
}

export function applySorting(
  results: SearchResult[],
  sort: SortOption,
  nearMe: boolean
): SearchResult[] {
  const sorted = [...results];

  switch (sort) {
    case "distance":
      if (!nearMe) return sorted;
      return sorted.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted;
  }
}

export function stockLabel(stock: StockStatus): string {
  switch (stock) {
    case "in_stock":
      return "In stock";
    case "low_stock":
      return "Low stock";
    case "out_of_stock":
      return "Out of stock";
  }
}

export function stockColor(stock: StockStatus): string {
  switch (stock) {
    case "in_stock":
      return "text-emerald-700 bg-emerald-50";
    case "low_stock":
      return "text-amber-700 bg-amber-50";
    case "out_of_stock":
      return "text-red-700 bg-red-50";
  }
}
