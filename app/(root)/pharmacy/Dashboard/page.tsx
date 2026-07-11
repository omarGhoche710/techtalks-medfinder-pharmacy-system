"use client"
import { useRouter } from "next/navigation"
import Dashboard from "@/components/Dashboard"
import { medications } from "@/data/medications"

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const today = new Date()
  const nearExpiryThresholdDays = 30
  const outOfStockItems = medications.filter((m) => m.stock === 0)
    .map((m) => ({ id: m.code, name: m.name }))

  const expiredCount = medications.filter((m) => new Date(m.expiry) < today).length
  const medicines = medications.length

  const nearExpiryCount = medications.filter((m) => {
    const expiryDate = new Date(m.expiry)
    const daysUntilExpiry = (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry > 0 && daysUntilExpiry <= nearExpiryThresholdDays
  }).length

  const handleNavigate = (page: "pharmacy/Inventory" | "pharmacy/NearExpiry" | "pharmacy/Expired") => {
    router.push(`/${page}`)}

  return (
    <div>
      <Dashboard
        pharmacyName={""} /* still need to wire this up from your session/cookie */
        totalMedications={medications.length}
        nearExpiryCount={nearExpiryCount}
        expiredCount={expiredCount}
        outOfStockItems={outOfStockItems}
        onNavigate={handleNavigate}
      />
    </div>
  )
}