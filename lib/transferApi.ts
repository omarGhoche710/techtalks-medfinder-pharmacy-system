import { apiGet, apiPost } from './apiClient'

export type TransferRecommendation = {
  pharmacy_id: string
  pharmacy_name: string
  distance_km: number
  current_stock: number
  has_same_medication: boolean
  score: number
}

export type TransferPayload = {
  from_pharmacy_id: string
  to_pharmacy_id: string
  medication_id: string
  quantity: number
  reason?: string
  discount_percentage?: number
  discounted_price?: number
}

export function fetchTransferRecommendations(pharmacyId: string, medicationId: string) {
  return apiGet<TransferRecommendation[]>(
    `/api/transfers/matching?pharmacy_id=${encodeURIComponent(pharmacyId)}&medication_id=${encodeURIComponent(medicationId)}`,
  )
}

export function createTransfer(payload: TransferPayload) {
  return apiPost('/api/transfers', payload)
}
