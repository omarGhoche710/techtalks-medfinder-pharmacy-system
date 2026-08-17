import { apiGet, apiPost } from './apiClient'

export type Invitation = {
  id: string
  token: string
  pharmacy_id: string
  invited_email: string
  role: string
  invited_by: string
  status: string
  created_at: string
  expires_at: string
}

export type SendInvitationPayload = {
  pharmacy_id: string
  invited_email: string
  role: string
  invited_by: string
}

export function sendInvitation(payload: SendInvitationPayload) {
  return apiPost<Invitation>('/api/invitations', payload)
}

export function acceptInvitation(token: string) {
  return apiPost(`/api/invitations/${encodeURIComponent(token)}/accept`, {})
}

export function fetchInvitations(pharmacyId: string) {
  return apiGet<Invitation[]>(`/api/invitations?pharmacy_id=${encodeURIComponent(pharmacyId)}`)
}
