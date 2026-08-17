import { apiGet, apiPost } from './apiClient'

export type Transaction = {
  id: string
  type: string
  medicationId: string | null
  medicationName: string | null
  pharmacyId: string | null
  pharmacyName: string | null
  quantity: number
  notes: string | null
  performedBy: string | null
  performedByName: string | null
  date: string
}

export type TransactionPayload = {
  type: 'STOCK_IN' | 'DISPENSE' | 'DAMAGE'
  medicationId: string
  quantity: number
  performedBy: string
}

export function fetchTransactions(params?: { type?: string; medicationId?: string; pharmacyId?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.type) searchParams.set('type', params.type)
  if (params?.medicationId) searchParams.set('medicationId', params.medicationId)
  if (params?.pharmacyId) searchParams.set('pharmacyId', params.pharmacyId)
  const query = searchParams.toString()
  return apiGet<Transaction[]>(`/api/transactions${query ? `?${query}` : ''}`)
}

export function createTransaction(payload: TransactionPayload & { performedBy: string }) {
  return apiPost<{ transaction: Transaction; updatedMedication: { id: string; stock: number } }>('/api/transactions', payload)
}
