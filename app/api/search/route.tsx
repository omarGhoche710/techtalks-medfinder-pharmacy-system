import { inventory } from "../../../lib/data/inventory";
import { getDistanceKm } from "../../../lib/utils/distance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");

  // Validate required parameters
  if (!name || !lat || !lng) {
    return Response.json(
      { error: "name, lat and lng are required" },
      { status: 400 }
    );
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const searchRadius = radius ? parseFloat(radius) : 10;

  // Step 1: Filter by medication name (case-insensitive)
  let results = inventory.filter((item) =>
    item.medicationName.toLowerCase().includes(name.toLowerCase())
  );

  // Step 2: Filter out items with no stock
  results = results.filter((item) => item.quantity > 0);

  // Step 3: Calculate distance and filter by radius
  const resultsWithDistance = results
    .map((item) => ({
      pharmacyId: item.pharmacyId,
      pharmacyName: item.pharmacyName,
      pharmacyAddress: item.pharmacyAddress,
      medicationId: item.medicationId,
      medicationName: item.medicationName,
      price: item.price,
      stock: item.quantity,
      expiryDate: item.expiryDate,
      distanceKm: getDistanceKm(
        userLat,
        userLng,
        item.pharmacyLat,
        item.pharmacyLng
      ),
    }))
    .filter((item) => item.distanceKm <= searchRadius);

  // Step 4: Sort by distance (nearest first)
  resultsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  return Response.json(resultsWithDistance);
}