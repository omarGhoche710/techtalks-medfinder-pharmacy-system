"use client";

import { useCallback, useEffect, useState } from "react";

type GeoState = {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  resolved: boolean;
};

export function useGeolocation(enabled: boolean): GeoState {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    loading: enabled,
    error: null,
    resolved: !enabled,
  });

  useEffect(() => {
    if (!enabled) return;

    if (!navigator.geolocation) {
      const id = window.setTimeout(() => {
        setState((prev) => ({
          ...prev,
          error: "Geolocation not supported",
        }));
      }, 0);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setState((prev) => ({ ...prev, loading: true }));
    }, 0);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
          resolved: true,
        });
      },
      () => {
        setState({
          lat: null,
          lng: null,
          loading: false,
          error: "Location unavailable — using default area",
          resolved: true,
        });
      },
      { timeout: 8000, maximumAge: 300000 }
    );

    return () => window.clearTimeout(id);
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
          resolved: true,
        });
      },
      () => {
        setState((prev) => ({
          ...prev,
          loading: false,
          resolved: true,
        }));
      }
    );
  }, [enabled]);

  return { ...state, refresh } as GeoState & { refresh: () => void };
}
