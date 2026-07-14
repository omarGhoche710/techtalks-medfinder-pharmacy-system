import { inventory } from "../../../lib/data/inventory";
import { getDistanceKm } from "../../../lib/utils/distance";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");

  // Validate — only name is required
  if (!name) {
    return Response.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const hasLocation = lat !== null && lng !== null;
  const userLat = hasLocation ? parseFloat(lat!) : null;
  const userLng = hasLocation ? parseFloat(lng!) : null;
  const searchRadius = radius ? parseFloat(radius) : 10;

  // Step 1: Filter by medication name (case-insensitive)
  const matchedByName = inventory.filter((item) =>
    item.medicationName.toLowerCase().includes(name.toLowerCase())
  );

  // No medication found at all
  if (matchedByName.length === 0) {
    return Response.json({
      results: [],
      message: `No pharmacies found carrying "${name}". Try a different medication name.`,
    });
  }

  // Step 2: Filter out items with no stock
  const inStock = matchedByName.filter((item) => item.quantity > 0);

  // Medication exists but no stock anywhere
  if (inStock.length === 0) {
    return Response.json({
      results: [],
      message: `"${name}" was found but is currently out of stock at all pharmacies.`,
    });
  }

  // Step 3: Map to response shape
  const mapped = inStock.map((item) => {
    const distanceKm = hasLocation
      ? getDistanceKm(userLat!, userLng!, item.pharmacyLat, item.pharmacyLng)
      : null;

    return {
      pharmacyId: item.pharmacyId,
      pharmacyName: item.pharmacyName,
      pharmacyAddress: item.pharmacyAddress,
      medicationId: item.medicationId,
      medicationName: item.medicationName,
      price: item.price,
      stock: item.quantity,
      expiryDate: item.expiryDate,
      distanceKm,
    };
  });

  // Step 4: If location provided, filter by radius and sort by distance
  if (hasLocation) {
    const filtered = mapped.filter(
      (item) => item.distanceKm !== null && item.distanceKm <= searchRadius
    );

    // Medication in stock but no pharmacies within radius
    if (filtered.length === 0) {
      return Response.json({
        results: [],
        message: `"${name}" is available but no pharmacies with stock were found within ${searchRadius}km of your location.`,
      });
    }

    filtered.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

    return Response.json({
      results: filtered,
      message: `Found ${filtered.length} pharmacy${filtered.length > 1 ? "s" : ""} with "${name}" in stock near you.`,
    });
  }

  // Step 5: General search — return all matches
  return Response.json({
    results: mapped,
    message: `Found ${mapped.length} pharmacy${mapped.length > 1 ? "s" : ""} with "${name}" in stock.`,
  });
}