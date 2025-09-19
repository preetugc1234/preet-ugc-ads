/**
 * Enhanced notification hook
 * Provides easy-to-use notification functions for different scenarios
 */

import { useToast } from './use-toast'
import { apiHelpers } from '@/lib/api'

export function useNotifications() {
  const { toast } = useToast()

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default'
    })
  }

  const showError = (title: string, error?: unknown, description?: string) => {
    const errorMessage = description || (error ? apiHelpers.handleApiError(error) : 'An error occurred')

    toast({
      title,
      description: errorMessage,
      variant: 'destructive'
    })
  }

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default' // You might want to create a warning variant
    })
  }

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default'
    })
  }

  const showApiError = (error: unknown, fallbackMessage: string = 'An unexpected error occurred') => {
    const errorMessage = apiHelpers.handleApiError(error)

    toast({
      title: 'Error',
      description: errorMessage || fallbackMessage,
      variant: 'destructive'
    })
  }

  const showLoadingError = (action: string = 'load data') => {
    toast({
      title: 'Loading Failed',
      description: `Failed to ${action}. Please try again.`,
      variant: 'destructive'
    })
  }

  const showNetworkError = () => {
    toast({
      title: 'Network Error',
      description: 'Please check your internet connection and try again.',
      variant: 'destructive'
    })
  }

  const showAuthError = () => {
    toast({
      title: 'Authentication Required',
      description: 'Please sign in to continue.',
      variant: 'destructive'
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showApiError,
    showLoadingError,
    showNetworkError,
    showAuthError,
    toast // Still expose the original toast function
  }
}

export default useNotifications