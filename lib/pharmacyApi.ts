import { apiPost } from './apiClient'

export type PharmacyCreatePayload = {
  name: string
  address: string
  phone: string
  lat: number
  lng: number
  hours?: string
}

export type PharmacyResponse = {
  id: string
  name: string
  address: string
  phone: string
  lat: number
  lng: number
  hours: string | null
  // additional fields may be present depending on backend shape
}

export function createPharmacy(payload: PharmacyCreatePayload) {
  return apiPost<PharmacyResponse>('/api/pharmacies', payload)
}
