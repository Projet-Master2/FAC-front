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

  uploadAvatar: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<{ data: AuthUser }>(`/api/users/${id}/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteUser: (id: string) =>
    apiClient.delete(`/api/users/${id}`),

  getFavorites: (id: string) =>
    apiClient.get<{ data: RecipeSummary[] }>(`/api/users/${id}/favorites`),
}
