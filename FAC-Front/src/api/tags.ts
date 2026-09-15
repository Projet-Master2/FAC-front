import apiClient from './client'

export interface Tag {
  id:   string
  name: string
  slug: string
}

export const tagsApi = {
  getTags: () =>
    apiClient.get<{ data: Tag[] }>('/api/tags'),

  createTag: (payload: { name: string; slug: string }) =>
    apiClient.post<{ data: Tag }>('/api/tags', payload),
}
