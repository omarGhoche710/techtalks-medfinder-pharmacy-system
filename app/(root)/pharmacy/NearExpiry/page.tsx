import { columns} from "@/components/columns"
import { NearExpiry } from "@/components/NearExpiry"
import { medications, Medication } from "@/data/medications"

interface SearchCriteria{
    status: string
}

export async function getActiveMedicine(criteria: SearchCriteria): Promise<Medication[]> {
  // search medicines in data/medications.ts whose status="active"
  return medications.filter((item) => item.status === criteria.status);
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const data = await getActiveMedicine({ status: "near expiry" });

  if (data?.length===0){
    return <p>No medicine near expiry found!</p>;
  }

  return (
    <div className="container mx-auto pb-10 pt-0">
      <NearExpiry data={data} />
    </div>
  );
}