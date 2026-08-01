"use client";

import FilterBar from "@/components/search/FilterBar";
import PharmacyMap from "@/components/search/PharmacyMap";
import ResultCard from "@/components/search/ResultCard";
import SearchBar from "@/components/search/SearchBar";
import SearchStateView from "@/components/search/SearchStateView";
import SortControls from "@/components/search/SortControls";
import { useGeolocation } from "@/hooks/useGeolocation";
import { applyFilters, applySorting } from "@/lib/filters";
import { fetchSearchResults } from "@/lib/searchApi";
import type {
  FilterState,
  SearchResult,
  SearchState,
  SortOption,
} from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 5;

type SearchPageClientProps = {
  initialQuery: string;
  initialNearMe: boolean;
  initialLat?: number;
  initialLng?: number;
};

export default function SearchPageClient({
  initialQuery,
  initialNearMe,
  initialLat,
  initialLng,
}: SearchPageClientProps) {
  const geo = useGeolocation(initialNearMe);
  const [query, setQuery] = useState(initialQuery);
  const [nearMe, setNearMe] = useState(initialNearMe);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : 0;
  const [state, setState] = useState<SearchState>(
    initialQuery ? "loading" : "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>(
    initialNearMe ? "distance" : "price_asc"
  );
  const [filters, setFilters] = useState<FilterState>({
    maxDistance: null,
    maxPrice: null,
    availability: "all",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [suppressFullLoading, setSuppressFullLoading] = useState(false);

  const lat = initialLat ?? geo.lat;
  const lng = initialLng ?? geo.lng;
  const searchLat = lat ?? undefined;
  const searchLng = lng ?? undefined;
  const isLoading = state === "loading";

  const runSearch = useCallback(
    async (searchQuery: string, useNearMe: boolean, targetPage: number = 1) => {
      if (!searchQuery.trim()) {
        setState("idle");
        setResults([]);
        setTotal(0);
        setPage(1);
        return;
      }

      setState("loading");
      setError(null);
      setQuery(searchQuery);
      setPage(targetPage);

      try {
        const data = await fetchSearchResults({
          query: searchQuery,
          nearMe: useNearMe,
          lat: useNearMe ? searchLat : undefined,
          lng: useNearMe ? searchLng : undefined,
          page: targetPage,
          pageSize: PAGE_SIZE,
        });
        setResults(data.results);
        setTotal(data.total);
        setState(data.results.length > 0 ? "success" : "empty");
        setSuppressFullLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setState("error");
        setResults([]);
        setTotal(0);
        setSuppressFullLoading(false);
      }
    },
    [searchLat, searchLng]
  );

  useEffect(() => {
    if (!initialQuery) return;
    // Wait for geolocation to resolve if Near Me is enabled
    if (initialNearMe && !geo.resolved) return;
    const id = window.setTimeout(() => runSearch(initialQuery, initialNearMe, 1), 0);
    return () => window.clearTimeout(id);
  }, [initialQuery, initialNearMe, geo.resolved, runSearch]);

  // Server already returns the correctly filtered + sorted page, so we just
  // re-apply client-side filters (price / availability / distance slider) and
  // re-sort if the user changes the sort. We keep the page slice small.
  const visiblePage = useMemo(() => {
    const filtered = applyFilters(results, filters, nearMe);
    return applySorting(filtered, sort, nearMe);
  }, [results, filters, sort, nearMe]);

  useEffect(() => {
    let timer: number | undefined;

    if (visiblePage.length === 0) {
      timer = window.setTimeout(() => setSelectedId(null), 0);
      return () => {
        if (timer) window.clearTimeout(timer);
      };
    }

    const shouldSelectFirst =
      !selectedId || !visiblePage.some((r) => r.id === selectedId);

    if (shouldSelectFirst) {
      const idToSelect = visiblePage[0].id;
      timer = window.setTimeout(() => setSelectedId(idToSelect), 0);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [visiblePage, selectedId]);

  const handleSearch = (searchQuery: string, useNearMe: boolean) => {
    const togglingNear = useNearMe !== nearMe;
    if (togglingNear) setSuppressFullLoading(true);
    setNearMe(useNearMe);
    const params = new URLSearchParams();
    params.set("q", searchQuery);
    params.set("nearMe", String(useNearMe));
    if (useNearMe && lat !== undefined && lng !== undefined) {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
    }
    window.history.replaceState(null, "", `/search?${params.toString()}`);
    runSearch(searchQuery, useNearMe, 1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage === page || nextPage > totalPages) return;
    // Suppress the full loading overlay so the page change feels instant —
    // the pagination buttons themselves provide the loading affordance.
    setSuppressFullLoading(true);
    runSearch(query, nearMe, nextPage);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-8">
        <SearchBar
          initialQuery={query}
          initialNearMe={nearMe}
          onSearch={handleSearch}
          lat={searchLat}
          lng={searchLng}
          geoLoading={geo.loading}
        />
        {geo.error && nearMe && (
          <p className="mt-2 text-xs text-amber-600" role="status">
            {geo.error}
          </p>
        )}
      </div>

      {(state === "success" || isLoading) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {total}
            </span>{" "}
            result{total !== 1 ? "s" : ""} for &ldquo;{query}
            &rdquo;
            {nearMe && (
              <span className="ml-1 text-primary">· Near Me</span>
            )}
            {total > 0 && (
              <span className="ml-1 text-gray-500">
                (page {page} of {totalPages})
              </span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <FilterBar
              filters={filters}
              nearMe={nearMe}
              onChange={setFilters}
              disabled={isLoading}
            />
            <SortControls sort={sort} nearMe={nearMe} onChange={setSort} disabled={isLoading} />
          </div>
        </div>
      )}

      {state === "success" && visiblePage.length === 0 && (
        <SearchStateView state="empty" query={query} />
      )}

      {visiblePage.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="flex flex-col gap-3">
            <div
              role="list"
              aria-label="Search results"
              className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1"
            >
              {visiblePage.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  nearMe={nearMe}
                  isSelected={selectedId === result.id}
                  onSelect={() => {
                    setSelectedId(result.id);
                    document
                      .getElementById(`result-${result.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                role="navigation"
                aria-label="Pagination"
                className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || isLoading}
                  className="rounded-md border border-gray-200 px-3 py-1 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page <span className="font-semibold text-gray-900">{page}</span>{" "}
                  of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || isLoading}
                  className="rounded-md border border-gray-200 px-3 py-1 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            )}
          </div>

          <div className="sticky top-4 h-[70vh]">
            <PharmacyMap
              results={visiblePage}
              selectedId={selectedId}
              userLat={nearMe ? searchLat : undefined}
              userLng={nearMe ? searchLng : undefined}
              onSelect={setSelectedId}
            />
            {isLoading && !suppressFullLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
                  <p className="mt-2 text-sm text-gray-700">Loading map…</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {state !== "success" && !(state === "loading" && suppressFullLoading) && (
        <SearchStateView
          state={state}
          query={query}
          error={error}
          onRetry={() => runSearch(query, nearMe, page)}
        />
      )}
    </div>
  );
}