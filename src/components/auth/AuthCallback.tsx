/**
 * Authentication Callback Component
 * Handles the redirect after OAuth authentication
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { clearAuthData } from '../../lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, loading } = useAuth()
  const [retryCount, setRetryCount] = useState(0)
  const [hasAuthError, setHasAuthError] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleAuthCallback = async () => {
      try {
        console.log('🔍 AuthCallback: Starting callback handling')
        console.log('🔗 Current URL:', window.location.href)
        console.log('🔗 Hash:', window.location.hash)
        console.log('🔗 Search:', window.location.search)

        // Check if we have URL fragments (Supabase auth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(window.location.search)
        const hasAuthParams = hashParams.get('access_token') || hashParams.get('error') || searchParams.get('code')
        const errorParam = hashParams.get('error') || searchParams.get('error')

        console.log('🔍 Auth params found:', {
          hasAuthParams,
          accessToken: !!hashParams.get('access_token'),
          error: errorParam,
          code: !!searchParams.get('code'),
          isAuthenticated,
          loading
        })

        // Check for errors in the URL
        if (errorParam) {
          console.error('❌ Auth callback error:', errorParam)
          setHasAuthError(true)
          navigate('/simple-login?error=auth_failed', { replace: true })
          return
        }

        if (hasAuthParams) {
          // For Google OAuth, redirect immediately if authenticated (don't wait for profile loading)
          if (isAuthenticated) {
            console.log('✅ User authenticated via OAuth, redirecting to dashboard...')
            const redirectTo = searchParams.get('redirect_to') || '/dashboard'
            navigate(redirectTo, { replace: true })
            return
          }

          // If not authenticated yet, wait a bit and retry
          const waitTime = Math.min(2000 + (retryCount * 1000), 8000) // Increasing wait time with retries

          timeoutId = setTimeout(() => {
            if (isAuthenticated) {
              // Success - redirect to dashboard
              console.log('✅ Authentication completed, redirecting to dashboard')
              const redirectTo = searchParams.get('redirect_to') || '/dashboard'
              navigate(redirectTo, { replace: true })
            } else {
              // If not authenticated after waiting, retry up to 3 times
              if (retryCount < 3) {
                console.log(`🔄 Auth callback retry ${retryCount + 1}`)
                setRetryCount(prev => prev + 1)
              } else {
                // Failed after retries - clear auth data and redirect
                console.error('❌ Auth callback failed after retries')
                clearAuthData()
                setHasAuthError(true)
                navigate('/simple-login?error=auth_failed', { replace: true })
              }
            }
          }, waitTime)
        } else {
          // No auth params, likely a direct visit - redirect immediately
          if (isAuthenticated) {
            const redirectTo = searchParams.get('redirect_to') || '/dashboard'
            navigate(redirectTo, { replace: true })
          } else {
            navigate('/login', { replace: true })
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        clearAuthData()
        setHasAuthError(true)
        navigate('/login?error=auth_failed', { replace: true })
      }
    }

    handleAuthCallback()

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isAuthenticated, loading, navigate, searchParams, retryCount])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {hasAuthError ? (
              <>
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-red-700">Authentication Failed</h2>
                  <p className="text-muted-foreground">
                    Redirecting to login page...
                  </p>
                </div>
              </>
            ) : loading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Authenticating...</h2>
                  <p className="text-muted-foreground">
                    {retryCount > 0
                      ? `Retrying authentication (${retryCount}/3)...`
                      : 'Please wait while we sign you in'
                    }
                  </p>
                </div>
              </>
            ) : isAuthenticated ? (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-green-700">Success!</h2>
                  <p className="text-muted-foreground">
                    Redirecting to your dashboard...
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-red-700">Authentication Failed</h2>
                  <p className="text-muted-foreground">
                    Redirecting to login page...
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthCallback