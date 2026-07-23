"use client";

import { DEFAULT_LOCATION } from "@/data/pharmacies";
import { useCallback, useEffect, useState } from "react";

type GeoState = {
  lat: number;
  lng: number;
  loading: boolean;
  error: string | null;
};

export function useGeolocation(enabled: boolean): GeoState {
  const [state, setState] = useState<GeoState>({
    lat: DEFAULT_LOCATION.lat,
    lng: DEFAULT_LOCATION.lng,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation not supported",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      () => {
        setState({
          lat: DEFAULT_LOCATION.lat,
          lng: DEFAULT_LOCATION.lng,
          loading: false,
          error: "Location unavailable — using default area",
        });
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, [enabled]);

  const refresh = useCallback(() => {
    if (!enabled || !navigator.geolocation) return;
    setState((prev) => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      () => {
        setState((prev) => ({ ...prev, loading: false }));
      }
    );
  }, [enabled]);

  return { ...state, refresh } as GeoState & { refresh: () => void };
}
