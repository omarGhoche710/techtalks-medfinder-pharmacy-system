export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type Pharmacy = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
};

export type SearchResult = {
  id: string;
  medicineName: string;
  medicineCode: string;
  pharmacy: Pharmacy;
  price: number;
  stock: StockStatus;
  quantity: number;
  distanceKm: number | null;
  description: string;
};

export type SearchState = "idle" | "loading" | "success" | "empty" | "error";

export type SortOption = "distance" | "price_asc" | "price_desc";

export type FilterState = {
  maxDistance: number | null;
  maxPrice: number | null;
  availability: StockStatus | "all";
};

export type SearchParams = {
  query: string;
  nearMe: boolean;
  lat?: number;
  lng?: number;
};

export type Suggestion = {
  text: string;
  type: "medicine" | "pharmacy";
};
