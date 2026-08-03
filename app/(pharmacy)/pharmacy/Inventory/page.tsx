import { Inventory } from "@/components/Inventory";
import { db } from "@/lib/db";
import { getCurrentPharmacyId, mapMedication } from "@/lib/getCurrentPharmacy";
import { medications as mockData } from "@/data/medications";

export default async function InventoryPage() {
  const pharmacyId = await getCurrentPharmacyId();

  // Fall back to mock data when DB isn't connected yet
  if (!pharmacyId) {
    const data = mockData.filter((m) => m.status === "active");
    return (
      <div className="container mx-auto pb-10 pt-0">
        <Inventory data={data} allMedications={data} />
      </div>
    );
  }

  const raw = await db.medication.findMany({
    where: { pharmacy_id: pharmacyId, status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  const data = raw.map(mapMedication);

  if (data.length === 0) {
    return <p className="p-10 text-[#5B6B66]">No active medications found. Add some to get started.</p>;
  }

  return (
    <div className="container mx-auto pb-10 pt-0">
      <Inventory data={data} allMedications={data} />
    </div>
  );
}
