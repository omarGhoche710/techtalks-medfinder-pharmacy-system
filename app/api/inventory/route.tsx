import { inventory } from "../../../lib/data/inventory";

// GET — list inventory with optional filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pharmacyId = searchParams.get("pharmacyId");
  const medicationId = searchParams.get("medicationId");

  let result = inventory;

  if (pharmacyId) {
    result = result.filter((item: (typeof inventory)[number]) => item.pharmacyId === pharmacyId);
  }

  if (medicationId) {
    result = result.filter((item: (typeof inventory)[number]) => item.medicationId === medicationId);
  }

  return Response.json(result);
}

// POST — add a new medication batch to inventory
export async function POST(request: Request) {
  const body = await request.json();

  const {
    code,
    medicationId,
    medicationName,
    pharmacyId,
    pharmacyName,
    pharmacyAddress,
    pharmacyLat,
    pharmacyLng,
    quantity,
    price,
    expiryDate,
  } = body;

  // Validate required fields
  if (
    !code ||
    !medicationId ||
    !medicationName ||
    !pharmacyId ||
    !pharmacyName ||
    !pharmacyAddress ||
    !pharmacyLat ||
    !pharmacyLng ||
    !quantity ||
    !price ||
    !expiryDate
  ) {
    return Response.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  // Create new inventory item
  const newItem = {
    id: String(inventory.length + 1),
    code,
    medicationId,
    medicationName,
    pharmacyId,
    pharmacyName,
    pharmacyAddress,
    pharmacyLat,
    pharmacyLng,
    quantity,
    price,
    expiryDate,
  };

  // Add to inventory array
  inventory.push(newItem);

  return Response.json(newItem, { status: 201 });
}