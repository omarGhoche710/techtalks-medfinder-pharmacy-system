const medications = [
  { id: "1", name: "Paracetamol", category: "Pain Relief" },
  { id: "2", name: "Amoxicillin", category: "Antibiotic" },
  { id: "3", name: "Ibuprofen", category: "Pain Relief" },
];

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