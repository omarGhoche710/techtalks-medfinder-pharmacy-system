import  Staff  from "@/components/Staff"

export default async function Layout({ children }: { children: React.ReactNode }) {

  return (
    <div className="container mx-auto pb-10 pt-0">
      <Staff />
    </div>
  );
}