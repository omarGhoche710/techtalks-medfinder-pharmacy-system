"use client";

import type { SearchResult } from "@/lib/types";
import { useMemo } from "react";

type PharmacyMapProps = {
  results: SearchResult[];
  selectedId: string | null;
  userLat?: number;
  userLng?: number;
  onSelect: (id: string) => void;
};

type MapPoint = {
  id: string;
  label: string;
  x: number;
  y: number;
};

function projectPoints(
  results: SearchResult[],
  userLat?: number,
  userLng?: number
): MapPoint[] {
  const lats = results.map((r) => r.pharmacy.lat);
  const lngs = results.map((r) => r.pharmacy.lng);
  if (userLat !== undefined && userLng !== undefined) {
    lats.push(userLat);
    lngs.push(userLng);
  }

  const minLat = Math.min(...lats) - 0.005;
  const maxLat = Math.max(...lats) + 0.005;
  const minLng = Math.min(...lngs) - 0.005;
  const maxLng = Math.max(...lngs) + 0.005;

  const toXY = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng)) * 100,
    y: 100 - ((lat - minLat) / (maxLat - minLat)) * 100,
  });

  const points: MapPoint[] = results.map((result) => {
    const { x, y } = toXY(result.pharmacy.lat, result.pharmacy.lng);
    return {
      id: result.id,
      label: result.pharmacy.name,
      x,
      y,
    };
  });

  if (userLat !== undefined && userLng !== undefined) {
    const { x, y } = toXY(userLat, userLng);
    points.push({ id: "user", label: "Your location", x, y });
  }

  return points;
}

export default function PharmacyMap({
  results,
  selectedId,
  userLat,
  userLng,
  onSelect,
}: PharmacyMapProps) {
  const points = useMemo(
    () => projectPoints(results, userLat, userLng),
    [results, userLat, userLng]
  );

  const centerLat =
    userLat ?? results.reduce((sum, r) => sum + r.pharmacy.lat, 0) / results.length;
  const centerLng =
    userLng ?? results.reduce((sum, r) => sum + r.pharmacy.lng, 0) / results.length;

  return (
    <div
      className="relative h-full min-h-[320px] overflow-hidden rounded-xl border border-gray-200 bg-[#e8f0e8]"
      aria-label="Pharmacy map"
      role="region"
    >
      <iframe
        title="OpenStreetMap"
        className="pointer-events-none absolute inset-0 h-full w-full border-0 opacity-60"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.04}%2C${centerLat - 0.03}%2C${centerLng + 0.04}%2C${centerLat + 0.03}&layer=mapnik`}
        loading="lazy"
      />

      <div className="absolute inset-0">
        {points.map((point) => {
          const isUser = point.id === "user";
          const isSelected = point.id === selectedId;

          if (isUser) {
            return (
              <div
                key={point.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                title={point.label}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2563eb] ring-4 ring-[#2563eb]/25" />
              </div>
            );
          }

          return (
            <button
              key={point.id}
              type="button"
              title={point.label}
              aria-label={point.label}
              aria-pressed={isSelected}
              onClick={() => onSelect(point.id)}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md transition-transform hover:scale-110 ${
                  isSelected ? "scale-110 bg-[#2563eb]" : "bg-red-500"
                }`}
              >
                Rx
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
