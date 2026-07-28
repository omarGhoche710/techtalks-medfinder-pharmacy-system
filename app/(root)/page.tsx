"use client";

import SearchBar from "@/components/search/SearchBar";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function HomePage() {
  const geo = useGeolocation(true);

  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center py-10">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Find your medication
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:text-lg">
            Search pharmacies near you and compare prices, stock, and distance.
          </p>

          <div className="mt-8">
            <SearchBar
              size="large"
              initialNearMe={true}
              lat={geo.lat}
              lng={geo.lng}
              geoLoading={geo.loading}
            />
            {geo.error && (
              <p className="mt-2 text-xs text-amber-600" role="status">
                {geo.error}
              </p>
            )}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                title: "Search",
                desc: "Type a medicine name and press Enter",
              },
              {
                title: "Near Me",
                desc: "Toggle ON to search by your location",
              },
              {
                title: "Compare",
                desc: "View price, stock, and distance",
              },
            ].map((item) => (
              <div key={item.title} className="card px-4 py-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
