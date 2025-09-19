/**
 * API service layer for communicating with the FastAPI backend
 * Handles authentication, user management, and all backend operations
 */

import { supabase, API_BASE_URL } from './supabase'

// Types for API responses
export interface User {
  id: string
  email: string
  name: string
  plan: string
  credits: number
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface UserStats {
  total_generations: number
  credits_used_total: number
  credits_remaining: number
  plan: string
  member_since: string
}

export interface CreditTransaction {
  id: string
  change: number
  balance_after: number
  reason: string
  created_at: string
  job_id?: string
  admin_id?: string
}

export interface CreditHistory {
  current_balance: number
  transactions: CreditTransaction[]
  total_earned: number
  total_spent: number
}

export interface GenerationItem {
  id: string
  type: string
  preview_url?: string
  final_urls: string[]
  size_bytes: number
  created_at: string
  credit_cost?: number
  status?: string
}

export interface UserHistory {
  generations: GenerationItem[]
  total_count: number
  limit: number
}

export interface JobCreateRequest {
  client_job_id: string
  module: 'chat' | 'image' | 'img2vid_noaudio' | 'tts' | 'img2vid_audio' | 'audio2vid'
  params: Record<string, any>
}

export interface JobResponse {
  id: string
  client_job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  estimated_cost: number
  preview_url?: string
  final_urls?: string[]
  created_at: string
  estimated_time?: number
}

export interface JobStatus {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  preview_url?: string
  final_urls?: string[]
  progress?: number
  error_message?: string
  created_at: string
  updated_at: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    timestamp: string
    details?: any
  }
  status_code: number
}

// API client class
class ApiClient {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: response.status === 503
            ? 'Backend is starting up, please wait a moment and try again...'
            : `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        },
        status_code: response.status
      }))

      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    })

    return this.handleResponse<T>(response)
  }

  // Authentication endpoints
  async getAuthStatus() {
    return this.request<{ status: string; supabase_configured: boolean; message: string }>('/api/auth/status')
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me')
  }

  async updateProfile(data: { name?: string }): Promise<User> {
    return this.request<User>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getCreditHistory(limit: number = 20): Promise<CreditHistory> {
    return this.request<CreditHistory>(`/api/auth/me/credits?limit=${limit}`)
  }

  // User management endpoints
  async getUserProfile(): Promise<User> {
    return this.request<User>('/api/user/profile')
  }

  async getUserStats(): Promise<UserStats> {
    return this.request<UserStats>('/api/user/stats')
  }

  async getCreditBalance(): Promise<{ credits: number; plan: string; updated_at: string }> {
    return this.request('/api/user/credits/balance')
  }

  async getUserHistory(limit: number = 30): Promise<UserHistory> {
    return this.request<UserHistory>(`/api/user/history?limit=${limit}`)
  }

  async deleteGeneration(generationId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/user/history/${generationId}`, {
      method: 'DELETE'
    })
  }

  async cleanupHistory(): Promise<{ success: boolean; message: string }> {
    return this.request('/api/user/history/cleanup', {
      method: 'DELETE'
    })
  }

  async changePlan(plan: string): Promise<User> {
    return this.request<User>('/api/user/plan', {
      method: 'PUT',
      body: JSON.stringify({ plan })
    })
  }

  // Health and monitoring
  async getHealthStatus() {
    return this.request<{
      status: string
      timestamp: string
      services: Record<string, string>
    }>('/api/health/')
  }

  async getDetailedHealth() {
    return this.request('/api/health/detailed')
  }

  // Admin endpoints (if user is admin)
  async getAllUsers(skip: number = 0, limit: number = 50) {
    return this.request(`/api/auth/users?skip=${skip}&limit=${limit}`)
  }

  async getUserById(userId: string): Promise<User> {
    return this.request<User>(`/api/auth/users/${userId}`)
  }

  async updateUser(userId: string, data: { name?: string; plan?: string; is_admin?: boolean }): Promise<User> {
    return this.request<User>(`/api/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async giftCredits(userId: string, credits: number, reason?: string): Promise<{
    success: boolean
    credits_added: number
    new_balance: number
    reason: string
  }> {
    return this.request(`/api/auth/users/${userId}/gift-credits`, {
      method: 'POST',
      body: JSON.stringify({ credits, reason })
    })
  }

  async getAdminStats() {
    return this.request('/api/auth/admin/stats')
  }

  // Job management endpoints (as per prompt.md)
  async createJob(jobData: JobCreateRequest): Promise<JobResponse> {
    return this.request<JobResponse>('/api/jobs/create', {
      method: 'POST',
      body: JSON.stringify(jobData)
    })
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    return this.request<JobStatus>(`/api/jobs/${jobId}/status`)
  }

  async cancelJob(jobId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/jobs/${jobId}/cancel`, {
      method: 'POST'
    })
  }

  // Cost estimation endpoint
  async estimateJobCost(module: string, params: Record<string, any>): Promise<{
    estimated_cost: number
    estimated_time: number
    credits_required: number
  }> {
    return this.request('/api/jobs/estimate-cost', {
      method: 'POST',
      body: JSON.stringify({ module, params })
    })
  }

  // Billing endpoints (Razorpay integration as per prompt.md)
  async createRazorpayOrder(data: {
    credits: number
    amount: number
    currency?: string
  }): Promise<{
    order_id: string
    razorpay_key: string
    amount: number
    currency: string
  }> {
    return this.request('/api/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async createRazorpaySubscription(planId: string): Promise<{
    subscription_id: string
    razorpay_key: string
    plan_id: string
  }> {
    return this.request('/api/razorpay/create-subscription', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId })
    })
  }

  async verifyRazorpayPayment(data: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }): Promise<{ success: boolean; credits_added: number; new_balance: number }> {
    return this.request('/api/razorpay/verify-payment', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// Export singleton instance
export const api = new ApiClient()

// Export helper functions
export const apiHelpers = {
  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const { session } = await supabase.auth.getSession()
      return !!session?.access_token
    } catch {
      return false
    }
  },

  // Handle API errors gracefully
  handleApiError: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    return 'An unexpected error occurred'
  },

  // Format credit amount for display
  formatCredits: (credits: number): string => {
    return new Intl.NumberFormat().format(credits)
  },

  // Format date for display
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  },

  // Format datetime for display
  formatDateTime: (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  },

  // Credit calculation helpers (as per prompt.md)
  calculateCreditsFromPrice: (price: number): number => {
    const rawCredits = price / 0.0275
    const fractionalPart = rawCredits % 1
    return fractionalPart < 0.5 ? Math.floor(rawCredits) : Math.ceil(rawCredits)
  },

  calculatePriceFromCredits: (credits: number): number => {
    return Math.round(credits * 0.0275 * 100) / 100 // Round to 2 decimals
  },

  // Job cost estimation (as per prompt.md)
  estimateJobCost: (module: string, params: any): number => {
    switch (module) {
      case 'chat':
        return 0 // Free but counts toward daily quota
      case 'image':
        return 0 // Free but counts toward daily quota
      case 'img2vid_noaudio':
        const duration1 = params.duration || 5
        return 100 * (duration1 / 5) // 100 credits per 5 seconds
      case 'tts':
        return 100 // 100 credits per generation
      case 'img2vid_audio':
        const duration2 = params.duration || 5
        return duration2 <= 5 ? 200 : 400 // 200/5s or 400/10s
      case 'audio2vid':
        const durationMin = Math.ceil((params.duration || 60) / 60)
        return 100 * durationMin // 100 per minute, rounded up
      default:
        return 0
    }
  },

  // Generate unique client job ID
  generateClientJobId: (): string => {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Check if user has sufficient credits
  hasSufficientCredits: (userCredits: number, requiredCredits: number): boolean => {
    return userCredits >= requiredCredits
  }
}

export default api