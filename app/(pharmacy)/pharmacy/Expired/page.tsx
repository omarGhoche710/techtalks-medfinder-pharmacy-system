import { Expired } from "@/components/Expired";
import { db } from "@/lib/db";
import { getCurrentPharmacyId, mapMedication } from "@/lib/getCurrentPharmacy";
import { medications as mockData } from "@/data/medications";

export default async function ExpiredPage() {
  const pharmacyId = await getCurrentPharmacyId();

  // Fall back to mock data when DB isn't connected yet
  if (!pharmacyId) {
    const today = new Date();
    const data = mockData.filter((m) => new Date(m.expiry) < today);
    return (
      <div className="container mx-auto pb-10 pt-0">
        <Expired data={data} allMedications={data} />
      </div>
    );
  }

  const today = new Date();
  const raw = await db.medication.findMany({
    where: { pharmacy_id: pharmacyId, date_expired: { lt: today } },
    orderBy: { date_expired: "asc" },
  });

  const data = raw.map(mapMedication);

  return (
    <div className="container mx-auto pb-10 pt-0">
      <Expired data={data} allMedications={data} />
    </div>
  );
}
