import type {
  SearchParams,
  SearchPage,
  SearchResult,
  StockStatus,
  Suggestion,
} from "@/lib/types";

type ApiSearchResult = {
  id: string;
  medication: {
    name: string;
    code: string;
    description: string;
    price: number;
    discountedPrice: number | null;
    daysToExpiry: number | null;
  };
  inventory: {
    quantity: number;
    stockStatus: StockStatus;
  };
  pharmacy: {
    id: string;
    name: string;
    address: string;
    phone: string;
    lat: number;
    lng: number;
    hours: string;
    distanceKm: number | null;
  };
};

type SearchApiResponse = {
  results?: ApiSearchResult[];
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
  error?: string;
};

function mapApiResultToSearchResult(result: ApiSearchResult): SearchResult {
  const hasDiscount =
    result.medication.discountedPrice !== null &&
    result.medication.discountedPrice < result.medication.price;

  return {
    id: result.id,
    medicineName: result.medication.name,
    medicineCode: result.medication.code,
    pharmacy: {
      id: result.pharmacy.id,
      name: result.pharmacy.name,
      address: result.pharmacy.address,
      lat: result.pharmacy.lat,
      lng: result.pharmacy.lng,
      phone: result.pharmacy.phone,
      hours: result.pharmacy.hours,
    },
    price: hasDiscount
      ? result.medication.discountedPrice!
      : result.medication.price,
    originalPrice: hasDiscount ? result.medication.price : undefined,
    stock: result.inventory.stockStatus,
    quantity: result.inventory.quantity,
    distanceKm: result.pharmacy.distanceKm,
    description: result.medication.description,
    daysToExpiry: result.medication.daysToExpiry,
  };
}

function resultsToSuggestions(results: SearchResult[]): Suggestion[] {
  const medicineNames = new Set<string>();
  const pharmacyNames = new Set<string>();

  for (const result of results) {
    medicineNames.add(result.medicineName);
    pharmacyNames.add(result.pharmacy.name);
  }

  return [
    ...Array.from(medicineNames).map((text) => ({
      text,
      type: "medicine" as const,
    })),
    ...Array.from(pharmacyNames).map((text) => ({
      text,
      type: "pharmacy" as const,
    })),
  ].slice(0, 8);
}

export async function fetchSearchResults(
  params: SearchParams,
): Promise<SearchPage> {
  const url = new URL("/api/search", window.location.origin);
  url.searchParams.set("q", params.query);
  url.searchParams.set("nearMe", String(params.nearMe));
  if (params.lat !== undefined) url.searchParams.set("lat", String(params.lat));
  if (params.lng !== undefined) url.searchParams.set("lng", String(params.lng));
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const res = await fetch(url.toString());
  const payload = (await res.json().catch(() => ({}))) as SearchApiResponse;
  if (!res.ok) {
    throw new Error(payload.error ?? "Search failed");
  }

  if (!payload.results || !Array.isArray(payload.results)) {
    return {
      results: [],
      total: 0,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 5,
      totalPages: 0,
    };
  }

  const results = payload.results.map(mapApiResultToSearchResult);
  const meta = payload.meta ?? {};
  const pageSize = meta.pageSize ?? params.pageSize ?? 5;
  const total = meta.total ?? results.length;
  const totalPages =
    meta.totalPages ?? (total === 0 ? 0 : Math.ceil(total / pageSize));

  return {
    results,
    total,
    page: meta.page ?? params.page ?? 1,
    pageSize,
    totalPages,
  };
}

export async function fetchSuggestions(
  params: SearchParams,
): Promise<Suggestion[]> {
  const searchPage = await fetchSearchResults(params);
  return resultsToSuggestions(searchPage.results);
}
