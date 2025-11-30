import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiError } from '../../types/auth.types'

// API Client Class with Supabase Integration
class ApiClient {
  private client: AxiosInstance
  private baseURL: string
  private anonKey: string

  constructor() {
    this.baseURL = import.meta.env.VITE_SUPABASE_URL
    this.anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!this.baseURL || !this.anonKey) {
      throw new Error('Missing Supabase configuration. Check your .env file.')
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        apikey: this.anonKey,
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            await this.refreshToken()
            const newToken = this.getStoredToken()
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            return this.client(originalRequest)
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens()
            window.location.href = '/auth/login'
            return Promise.reject(refreshError)
          }
        }

        // Transform error to our ApiError format
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          code: error.response?.data?.code || error.code,
          details: error.response?.data,
        }

        return Promise.reject(apiError)
      },
    )
  }

  // Token Management
  private getStoredToken(): string | null {
    return localStorage.getItem('access_token')
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  }

  public setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('expires_at', expiresAt.toString())
  }

  public clearTokens(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('expires_at')
  }

  public isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('expires_at')
    if (!expiresAt) return true
    return Date.now() > parseInt(expiresAt)
  }

  // Token Refresh Logic
  private async refreshToken(): Promise<void> {
    const refreshToken = this.getStoredRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await axios.post(`${this.baseURL}/auth/v1/token?grant_type=refresh_token`, {
      refresh_token: refreshToken,
    })

    const { access_token, refresh_token: new_refresh_token, expires_in } = response.data
    this.setTokens(access_token, new_refresh_token, expires_in)
  }

  // API Method Wrappers
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // Supabase-specific methods
  public async rpc<T = any>(functionName: string, params?: any): Promise<T> {
    return this.post<T>(`/rest/v1/rpc/${functionName}`, params)
  }

  // Auth-specific endpoints
  public getAuthClient() {
    return {
      signup: (data: any) => this.post('/auth/v1/signup', data),
      login: (data: any) => this.post('/auth/v1/token?grant_type=password', data),
      logout: () => this.post('/auth/v1/logout'),
      refreshToken: (refreshToken: string) =>
        this.post('/auth/v1/token?grant_type=refresh_token', { refresh_token: refreshToken }),
    }
  }

  // REST API client
  public getRestClient() {
    return {
      users: {
        get: (params?: string) => this.get(`/rest/v1/users${params ? `?${params}` : ''}`),
        create: (data: any) => this.post('/rest/v1/users', data),
        update: (id: string, data: any) => this.patch(`/rest/v1/users?id=eq.${id}`, data),
        delete: (id: string) => this.delete(`/rest/v1/users?id=eq.${id}`),
      },
      userRoles: {
        get: (params?: string) => this.get(`/rest/v1/user_roles${params ? `?${params}` : ''}`),
        create: (data: any) => this.post('/rest/v1/user_roles', data),
        update: (userId: string, data: any) => this.patch(`/rest/v1/user_roles?user_id=eq.${userId}`, data),
        delete: (userId: string) => this.delete(`/rest/v1/user_roles?user_id=eq.${userId}`),
      },
      rpc: {
        adminCreateUser: (data: any) => this.rpc('admin_create_complete_user', data),
        syncSpecificAuthUser: (data: { target_user_id: string }) => this.rpc('sync_specific_auth_user', data),
        checkDatabase: () => this.rpc('check_database_setup'),
        testEmailDomains: () => this.rpc('test_email_domains'),
      },
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient()

// Export both default and named export for compatibility
export default apiClient
export { apiClient, ApiClient }
