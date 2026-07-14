import { inventory } from "../../../lib/data/inventory";

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