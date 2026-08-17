import { apiGet, apiPatch, apiPost, apiDelete } from './apiClient'

export type User = {
  id: string
  clerkId: string
  username: string
  firstName?: string | null
  lastName?: string | null
  photo: string
}

export function fetchUsers() {
  return apiGet<User[]>('/api/users')
}

export function fetchUser(id: string) {
  return apiGet<User>(`/api/users/${encodeURIComponent(id)}`)
}

export function createUser(payload: { username: string; photo: string; firstName?: string; lastName?: string }) {
  return apiPost<User>('/api/users', payload)
}

export function updateUser(id: string, payload: { username?: string; photo?: string; firstName?: string; lastName?: string }) {
  return apiPatch<User>(`/api/users/${encodeURIComponent(id)}`, payload)
}

export function deleteUser(id: string) {
  return apiDelete<{ message: string; user: User }>(`/api/users/${encodeURIComponent(id)}`)
}
