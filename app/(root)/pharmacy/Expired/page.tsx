import { columns} from "@/components/columns"
import { Expired } from "@/components/Expired"
import { medications, Medication } from "@/data/medications"

interface SearchCriteria{
    status: string
}

export async function getActiveMedicine(criteria: SearchCriteria): Promise<Medication[]> {
  // search medicines in data/medications.ts whose status="active"
  return medications.filter((item) => item.status === criteria.status);
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const data = await getActiveMedicine({ status: "expired" });

  if (data?.length===0){
    return <p>No medicine near expiry found!</p>;
  }

  return (
    <div className="container mx-auto py-10 bg-[#EAF3ED]">
      <Expired data={data} />
    </div>
  );
}