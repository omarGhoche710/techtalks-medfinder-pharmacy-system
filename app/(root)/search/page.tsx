import SearchPageClient from "@/components/search/SearchPageClient";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    nearMe?: string;
    lat?: string;
    lng?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const nearMe = params.nearMe !== "false";
  const lat = params.lat ? parseFloat(params.lat) : undefined;
  const lng = params.lng ? parseFloat(params.lng) : undefined;

  return (
    <SearchPageClient
      initialQuery={query}
      initialNearMe={nearMe}
      initialLat={lat}
      initialLng={lng}
    />
  );
}
