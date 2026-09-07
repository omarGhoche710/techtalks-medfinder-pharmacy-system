import { apiGet } from './apiClient'

export type DashboardStats = {
  pharmacyName: string
  totalMedications: number
  nearExpiryCount: number
  expiredCount: number
  outOfStockItems: { id: string; name: string }[]
}

export function fetchDashboardStats() {
  return apiGet<DashboardStats>('/api/pharmacy/dashboard-stats')
}
