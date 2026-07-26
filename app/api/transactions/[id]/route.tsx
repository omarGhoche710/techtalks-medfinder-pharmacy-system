import { transactions } from "../../../../lib/data/transactions";

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

}