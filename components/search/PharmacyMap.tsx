"use client";

import type { SearchResult } from "@/lib/types";
import { useMemo } from "react";
import { DEFAULT_LOCATION } from "@/data/pharmacies";
import { haversineKm } from "@/lib/geo";

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
  userLat: number | undefined,
  userLng: number | undefined,
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
): MapPoint[] {
  const toXY = (lat: number, lng: number) => ({
    x: Math.min(
      100,
      Math.max(0, ((lng - minLng) / (maxLng - minLng)) * 100)
    ),
    y: Math.min(
      100,
      Math.max(0, 100 - ((lat - minLat) / (maxLat - minLat)) * 100)
    ),
  });

  const points = results.map((result) => {
    const { x, y } = toXY(
      result.pharmacy.lat,
      result.pharmacy.lng
    );

    return {
      id: result.id,
      label: result.pharmacy.name,
      x,
      y,
    };
  });

  if (userLat !== undefined && userLng !== undefined) {
    const { x, y } = toXY(userLat, userLng);

    points.push({
      id: "user",
      label: "Your location",
      x,
      y,
    });
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

  const {
    points,
    centerLat,
    centerLng,
    minLat,
    maxLat,
    minLng,
    maxLng,
    allCoords,
  } = useMemo(() => {

    const MAX_NEAR_KM = 200;


    // pharmacies used for map center
    let visibleResults = results;


    if (userLat !== undefined && userLng !== undefined) {
      const filtered = results.filter((r) =>
        haversineKm(
          userLat,
          userLng,
          r.pharmacy.lat,
          r.pharmacy.lng
        ) <= MAX_NEAR_KM
      );


      if (filtered.length > 0) {
        visibleResults = filtered;
      }
    }


    const coords = visibleResults.map((r) => ({
      lat: r.pharmacy.lat,
      lng: r.pharmacy.lng,
    }));


    if (userLat !== undefined && userLng !== undefined) {
      coords.push({
        lat: userLat,
        lng: userLng,
      });
    }



    let _minLat: number;
    let _maxLat: number;
    let _minLng: number;
    let _maxLng: number;


    if (coords.length === 0) {

      const lat = DEFAULT_LOCATION.lat;
      const lng = DEFAULT_LOCATION.lng;

      _minLat = lat - 0.03;
      _maxLat = lat + 0.03;
      _minLng = lng - 0.04;
      _maxLng = lng + 0.04;

    } else {

      _minLat = Math.min(...coords.map(c => c.lat));
      _maxLat = Math.max(...coords.map(c => c.lat));

      _minLng = Math.min(...coords.map(c => c.lng));
      _maxLng = Math.max(...coords.map(c => c.lng));


      const latPadding =
        Math.max(0.01, (_maxLat - _minLat) * 0.15);

      const lngPadding =
        Math.max(0.01, (_maxLng - _minLng) * 0.15);


      _minLat -= latPadding;
      _maxLat += latPadding;

      _minLng -= lngPadding;
      _maxLng += lngPadding;

    }


    const _centerLat =
      (_minLat + _maxLat) / 2;

    const _centerLng =
      (_minLng + _maxLng) / 2;



    const _points = projectPoints(
      visibleResults,
      userLat,
      userLng,
      _minLat,
      _maxLat,
      _minLng,
      _maxLng
    );


    return {
      points: _points,
      centerLat: _centerLat,
      centerLng: _centerLng,
      minLat: _minLat,
      maxLat: _maxLat,
      minLng: _minLng,
      maxLng: _maxLng,
      allCoords: coords,
    };


  }, [
    results,
    userLat,
    userLng
  ]);



  const iframeSrc =
    `https://www.openstreetmap.org/export/embed.html?bbox=` +
    `${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}` +
    `&layer=mapnik`;



  return (
    <div
      className="
      relative 
      h-full 
      min-h-[320px]
      overflow-hidden
      rounded-xl
      border
      border-gray-200
      bg-[#e8f0e8]
      "
    >

      <iframe
        title="OpenStreetMap"
        className="
        pointer-events-none
        absolute
        inset-0
        h-full
        w-full
        border-0
        opacity-60
        "
        src={iframeSrc}
        loading="lazy"
      />



      {/* Debug */}
      <div
        className="
        absolute
        left-2
        top-2
        z-20
        rounded-md
        bg-white/90
        p-2
        text-xs
        shadow
        "
      >
        <div>
          Center:
          {centerLat.toFixed(5)},
          {centerLng.toFixed(5)}
        </div>

        <div>
          Points:
          {points.length}
        </div>

      </div>



      {/* Markers */}

      <div className="absolute inset-0">


        {points.map(point => {

          const isUser =
            point.id === "user";

          const selected =
            point.id === selectedId;



          if (isUser) {

            return (
              <div
                key={point.id}
                className="
                absolute
                -translate-x-1/2
                -translate-y-1/2
                "
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`
                }}
              >

                <span
                  className="
                  block
                  h-4
                  w-4
                  rounded-full
                  bg-blue-600
                  ring-4
                  ring-blue-300/40
                  "
                />

              </div>
            );

          }



          return (

            <button
              key={point.id}
              type="button"
              title={point.label}
              onClick={() =>
                onSelect(point.id)
              }
              className="
              absolute
              -translate-x-1/2
              -translate-y-full
              "
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`
              }}
            >

              <span
                className={`
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                border-2
                border-white
                text-xs
                font-bold
                text-white
                shadow-md
                ${selected
                    ? "bg-blue-600 scale-110"
                    : "bg-red-500"
                  }
                `}
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