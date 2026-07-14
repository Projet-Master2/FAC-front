import apiClient from './client'
import type { AuthUser } from './auth'
import type { RecipeSummary } from './recipes'

export interface UpdateUserPayload {
  name?:     string
  pseudo?:   string
  bio?:      string
  avatar?:   string
  password?: string
}

export const usersApi = {
  getUser: (id: string) =>
    apiClient.get<{ data: AuthUser }>(`/api/users/${id}`),

  updateUser: (id: string, payload: UpdateUserPayload) =>
    apiClient.patch<{ data: AuthUser }>(`/api/users/${id}`, payload),

  deleteUser: (id: string) =>
    apiClient.delete(`/api/users/${id}`),

  getFavorites: (id: string) =>
    apiClient.get<{ data: RecipeSummary[] }>(`/api/users/${id}/favorites`),
}
