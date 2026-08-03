import { NearExpiry } from "@/components/NearExpiry";
import { db } from "@/lib/db";
import { getCurrentPharmacyId, mapMedication } from "@/lib/getCurrentPharmacy";
import { medications as mockData } from "@/data/medications";

export default async function NearExpiryPage() {
  const pharmacyId = await getCurrentPharmacyId();

  // Fall back to mock data when DB isn't connected yet
  if (!pharmacyId) {
    const today = new Date();
    const data = mockData.filter((m) => {
      const days = (new Date(m.expiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 30;
    });
    return (
      <div className="container mx-auto pb-10 pt-0">
        <NearExpiry data={data} allMedications={data} pharmacyId="" />
      </div>
    );
  }

  const raw = await db.medication.findMany({
    where: { pharmacy_id: pharmacyId, status: "NEAR_EXPIRY" },
    orderBy: { date_expired: "asc" },
  });

  const data = raw.map(mapMedication);

  return (
    <div className="container mx-auto pb-10 pt-0">
      <NearExpiry data={data} allMedications={data} pharmacyId={pharmacyId} />
    </div>
  );
}
