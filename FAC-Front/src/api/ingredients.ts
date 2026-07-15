import apiClient from './client'

export interface Ingredient {
  id:       string
  name:     string
  iconName: string | null
}

export const ingredientsApi = {
  search: (q: string) =>
    apiClient.get<{ data: Ingredient[] }>('/api/ingredients', { params: { q } }),

  create: (name: string) =>
    apiClient.post<{ data: Ingredient }>('/api/ingredients', { name }),
}
