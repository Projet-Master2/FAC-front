import apiClient from './client'

export interface RegisterPayload {
  email:    string
  name:     string
  pseudo?:  string
  password: string
}

export interface LoginPayload {
  email:    string
  password: string
}

export interface AuthUser {
  id:        string
  email:     string
  name:      string
  pseudo:    string | null
  avatar:    string | null
  bio?:      string | null
  createdAt?: string
}

export interface AuthResponse {
  user:         AuthUser
  accessToken:  string
  refreshToken: string
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<{ data: AuthResponse }>('/api/auth/register', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<{ data: AuthResponse }>('/api/auth/login', payload),

  logout: (refreshToken: string) =>
    apiClient.post('/api/auth/logout', { refreshToken }),

  getMe: () =>
    apiClient.get<{ data: AuthUser }>('/api/auth/me'),

  forgotPassword: (email: string) =>
    apiClient.post('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/api/auth/reset-password', { token, password }),
}
