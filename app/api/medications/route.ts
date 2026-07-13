const medications = [
  { id: "1", name: "Paracetamol", category: "Pain Relief" },
  { id: "2", name: "Amoxicillin", category: "Antibiotic" },
  { id: "3", name: "Ibuprofen", category: "Pain Relief" },
];

export async function GET() {
  return Response.json(medications);
}