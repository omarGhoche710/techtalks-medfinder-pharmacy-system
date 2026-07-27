import { inventory } from "../../../lib/data/inventory";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pharmacyId = searchParams.get("pharmacyId");

  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  let result = inventory.filter((item) => {
    const expiryDate = new Date(item.expiryDate);
    return expiryDate <= thirtyDaysFromNow;
  });

  if (pharmacyId) {
    result = result.filter((item) => item.pharmacyId === pharmacyId);
  }

  return Response.json(result);
}