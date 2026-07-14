import { transfers } from "../../../lib/data/transfers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const fromPharmacyId = searchParams.get("fromPharmacyId");
  const toPharmacyId = searchParams.get("toPharmacyId");
  const medicationId = searchParams.get("medicationId");

  let result = transfers;

  if (status) {
    result = result.filter((t) => t.status === status);
  }

  if (fromPharmacyId) {
    result = result.filter((t) => t.fromPharmacyId === fromPharmacyId);
  }

  if (toPharmacyId) {
    result = result.filter((t) => t.toPharmacyId === toPharmacyId);
  }

  if (medicationId) {
    result = result.filter((t) => t.medicationId === medicationId);
  }

  return Response.json(result);
}