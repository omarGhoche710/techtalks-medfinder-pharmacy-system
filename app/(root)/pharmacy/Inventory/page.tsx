import { columns} from "@/components/columns"
import { Inventory } from "@/components/Inventory"
import { medications, Medication } from "@/data/medications"

interface SearchCriteria{
    status: string
}

export async function getActiveMedicine(criteria: SearchCriteria): Promise<Medication[]> {
  // search medicines in data/medications.ts whose status="active"
  return medications.filter((item) => item.status === criteria.status);
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const data = await getActiveMedicine({ status: "active" });

  if (data?.length===0){
    return <p>No active medicine found! Add medicine to create new entry</p>;
  }

  return (
    <div className="container mx-auto pb-10 pt-0">
      <Inventory data={data} />
    </div>
  );
}
