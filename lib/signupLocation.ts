export interface SignupLocation {
  lat: number;
  lng: number;
}

const STORAGE_KEY = "pharmacy_signup_location";

export function setSignupLocation(location: SignupLocation) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

export function getSignupLocation(): SignupLocation | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSignupLocation() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}