import { transactions } from "../../../../lib/data/transactions";

// GET — get a single transaction by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const transaction = transactions.find((t) => t.id === id);

  if (!transaction) {
    return Response.json(
      { error: "Transaction not found" },
      { status: 404 }
    );
  }

  return Response.json(transaction);
=======
import { transactions } from "@/lib/data/transactions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const pharmacyId = searchParams.get("pharmacyId");
  const medicationId = searchParams.get("medicationId");

  let result = transactions;

  if (type) {
    result = result.filter((t: (typeof transactions)[number]) => t.type === type);
  }

  if (pharmacyId) {
    result = result.filter(
      (t: (typeof transactions)[number]) =>
        t.pharmacyId === pharmacyId ||
        t.fromPharmacyId === pharmacyId ||
        t.toPharmacyId === pharmacyId
    );
  }

  if (medicationId) {
    result = result.filter((t: (typeof transactions)[number]) => t.medicationId === medicationId);
  }

  return Response.json(result);
}