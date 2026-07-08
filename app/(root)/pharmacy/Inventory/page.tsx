import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { columns, medicine } from "@/components/columns"
import { InventoryTable } from "@/components/InventoryTable"
import { AddProductButton } from "@/components/PharmaHeader"
import { SiteFooter } from "@/components/PharmaFooter"

async function getData(): Promise<medicine[]> {
  // Fetch data from your API here.
  return [
    {
      code: 1234,
      image: '',
      name: "Paracetamol",
      stock: 12,
      expiry: new Date("2026-01-10"),
      description: "enter link 'more' to view ingredients)",
      price: 1.50,
      discount_percentage: 0,
      discounted_price: 1.50,
    },
    // ...
  ]
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const data = await getData()
  return (
    <div className="container mx-auto py-10">
      <AddProductButton />
      <InventoryTable data={data} />
      <SiteFooter />
    </div>
  )
}
