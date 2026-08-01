"use client"
import { useRouter } from "next/navigation"
import Dashboard from "@/components/Dashboard"
import { useEffect, useState } from "react"
import { medications } from "@/data/medications"

type DashboardData = {
  pharmacyName: string
  totalMedications: number
  nearExpiryCount: number
  expiredCount: number
  outOfStockItems: { id: string; name: string }[]
}

// Fallback stats computed from local mock data (used when DB isn't connected yet)
function getMockStats(): DashboardData {
  const today = new Date()
  const nearExpiryThreshold = 30
  return {
    pharmacyName: "My Pharmacy",
    totalMedications: medications.length,
    nearExpiryCount: medications.filter((m) => {
      const days = (new Date(m.expiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      return days > 0 && days <= nearExpiryThreshold
    }).length,
    expiredCount: medications.filter((m) => new Date(m.expiry) < today).length,
    outOfStockItems: medications.filter((m) => m.stock === 0).map((m) => ({ id: m.code, name: m.name })),
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData>(getMockStats())

  useEffect(() => {
    fetch("/api/pharmacy/dashboard-stats")
      .then((r) => {
        if (!r.ok) throw new Error("API not ready")
        return r.json()
      })
      .then((d) => setData(d))
      .catch(() => {
        // DB not connected yet — mock data already showing, nothing to do
      })
  }, [])

  const handleNavigate = (page: "pharmacy/Inventory" | "pharmacy/NearExpiry" | "pharmacy/Expired" | "pharmacy/Staff") => {
    router.push(`/${page}`)
  }

  return (
    <div>
      <Dashboard
        pharmacyName={data.pharmacyName}
        totalMedications={data.totalMedications}
        nearExpiryCount={data.nearExpiryCount}
        expiredCount={data.expiredCount}
        outOfStockItems={data.outOfStockItems}
        onNavigate={handleNavigate}
      />
    </div>
  )
}
