import { medications } from "@/lib/data/medications";

export async function GET() {
  return Response.json(medications);
}