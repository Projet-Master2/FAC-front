import apiClient from './client'

export interface Comment {
  id:        string
  content:   string
  createdAt: string
  updatedAt: string
  user: {
    id:     string
    name:   string
    pseudo: string | null
    avatar: string | null
  }
  _count: { reactions: number }
}

export interface PaginatedComments {
  comments:   Comment[]
  total:      number
  page:       number
  totalPages: number
}

export const commentsApi = {
  getComments: (recipeId: string, page = 1) =>
    apiClient.get<{ data: PaginatedComments }>(`/api/recipes/${recipeId}/comments`, {
      params: { page },
    }),

  addComment: (recipeId: string, content: string) =>
    apiClient.post<{ data: Comment }>(`/api/recipes/${recipeId}/comments`, { content }),

  deleteComment: (commentId: string) =>
    apiClient.delete(`/api/comments/${commentId}`),
}
