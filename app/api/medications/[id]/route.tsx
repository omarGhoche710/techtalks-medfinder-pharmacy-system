import { medications } from "../../../../lib/data/medications";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const medication = medications.find((m) => m.id === id);

  if (!medication) {
    return Response.json({ error: "Medication not found" }, { status: 404 });
  }

  return Response.json(medication);
}