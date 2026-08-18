import apiClient from './client'

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface RecipeAuthor {
  id:     string
  name:   string
  pseudo: string | null
  avatar: string | null
}

export interface RecipeTag {
  id:   string
  name: string
  slug: string
}

export interface RecipeMedia {
  url:  string
  type: 'IMAGE' | 'VIDEO'
}

export interface RecipeSummary {
  id:            string
  title:         string
  description:   string
  difficulty:    Difficulty
  prepTime:      number
  cookTime:      number
  servings:      number
  estimatedCost: number | null
  createdAt:     string
  author:        RecipeAuthor
  tags:          { tag: RecipeTag }[]
  media:         RecipeMedia[]
  _count:        { ratings: number; comments: number; favorites: number }
}

export interface RecipesQuery {
  q?:          string
  difficulty?: Difficulty
  maxTime?:    number
  maxCost?:    number
  tags?:       string
  sort?:       'recent' | 'quickest' | 'cheapest' | 'rating'
  page?:       number
  limit?:      number
}

export interface PaginatedRecipes {
  recipes:    RecipeSummary[]
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

export interface CreateRecipePayload {
  title:         string
  description:   string
  difficulty?:   Difficulty
  prepTime:      number
  cookTime:      number
  servings?:     number
  estimatedCost?: number
}

export const recipesApi = {
  getRecipes: (params?: RecipesQuery) =>
    apiClient.get<{ data: PaginatedRecipes }>('/api/recipes', { params }),

  getRecipe: (id: string) =>
    apiClient.get<{ data: RecipeSummary }>(`/api/recipes/${id}`),

  createRecipe: (payload: CreateRecipePayload) =>
    apiClient.post<{ data: RecipeSummary }>('/api/recipes', payload),

  updateRecipe: (id: string, payload: Partial<CreateRecipePayload & { published: boolean }>) =>
    apiClient.patch<{ data: RecipeSummary }>(`/api/recipes/${id}`, payload),

  deleteRecipe: (id: string) =>
    apiClient.delete(`/api/recipes/${id}`),

  addFavorite: (id: string) =>
    apiClient.post(`/api/recipes/${id}/favorites`),

  removeFavorite: (id: string) =>
    apiClient.delete(`/api/recipes/${id}/favorites`),

  rateRecipe: (id: string, score: number) =>
    apiClient.post(`/api/recipes/${id}/ratings`, { score }),
}
