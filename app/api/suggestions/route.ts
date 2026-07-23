import { medicineSuggestions, searchCatalog } from "@/data/pharmacies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();

  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  await new Promise((resolve) => setTimeout(resolve, 150));

  const medicineMatches = medicineSuggestions
    .filter((name) => name.toLowerCase().includes(q))
    .map((text) => ({ text, type: "medicine" as const }));

  const pharmacyNames = [
    ...new Set(searchCatalog.map((item) => item.pharmacy.name)),
  ];
  const pharmacyMatches = pharmacyNames
    .filter((name) => name.toLowerCase().includes(q))
    .map((text) => ({ text, type: "pharmacy" as const }));

  const suggestions = [...medicineMatches, ...pharmacyMatches].slice(0, 8);

  return NextResponse.json({ suggestions });
}
