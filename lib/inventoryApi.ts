import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export type InventoryItem = {
  id: string
  code: string
  medicationId: string
  medicationName: string
  pharmacyId: string
  pharmacyName: string
  pharmacyAddress: string
  pharmacyLat: number
  pharmacyLng: number
  quantity: number
  price: number
  expiryDate: string
  status: string
  discountPercentage: number | null
  discountedPrice: number | null
}

export type InventoryCreatePayload = {
  code: string
  medicationName: string
  description?: string | null
  pharmacyId?: string
  quantity: number
  price: number
  expiryDate: string
}

export type InventoryUpdatePayload = {
  code?: string
  medicationName?: string
  description?: string | null
  quantity?: number
  price?: number
  expiryDate?: string
  stock_delta?: number
  discount_percentage?: number
}

export function fetchInventory(pharmacyId?: string) {
  const url = pharmacyId ? `/api/inventory?pharmacyId=${encodeURIComponent(pharmacyId)}` : '/api/inventory'
  return apiGet<InventoryItem[]>(url)
}

export function createInventoryItem(payload: InventoryCreatePayload) {
  return apiPost<InventoryItem>('/api/inventory', payload)
}

export function updateInventoryItem(id: string, payload: InventoryUpdatePayload) {
  return apiPatch<InventoryItem>(`/api/inventory/${id}`, payload)
}

export function deleteInventoryItem(id: string) {
  return apiDelete<InventoryItem>(`/api/inventory/${id}`)
}
