import { medicineSuggestions, searchCatalog } from "@/data/pharmacies";
import { haversineKm } from "@/lib/geo";
import type { SearchResult, SearchParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

function searchItems(params: SearchParams): SearchResult[] {
  const trimmed = params.query.trim().toLowerCase();
  if (!trimmed) return [];

  let results = searchCatalog.filter(
    (item) =>
      item.medicineName.toLowerCase().includes(trimmed) ||
      item.medicineCode.toLowerCase().includes(trimmed) ||
      item.pharmacy.name.toLowerCase().includes(trimmed)
  );

  if (params.nearMe && params.lat !== undefined && params.lng !== undefined) {
    results = results.map((item) => ({
      ...item,
      distanceKm: haversineKm(
        params.lat!,
        params.lng!,
        item.pharmacy.lat,
        item.pharmacy.lng
      ),
    }));
    results.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") ?? "";
  const nearMe = searchParams.get("nearMe") === "true";
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const simulateError = searchParams.get("error") === "true";

  if (simulateError) {
    return NextResponse.json(
      { error: "Search service temporarily unavailable." },
      { status: 500 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  const params: SearchParams = {
    query,
    nearMe,
    lat: lat ? parseFloat(lat) : undefined,
    lng: lng ? parseFloat(lng) : undefined,
  };

  const results = searchItems(params);

  return NextResponse.json({
    results,
    query,
    nearMe,
    total: results.length,
  });
}
