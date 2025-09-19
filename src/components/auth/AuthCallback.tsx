/**
 * Authentication Callback Component
 * Handles the redirect after OAuth authentication
 */

import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // Wait for auth state to settle
    const timer = setTimeout(() => {
      if (!loading) {
        if (isAuthenticated) {
          // Success - redirect to dashboard
          const redirectTo = searchParams.get('redirect_to') || '/dashboard'
          navigate(redirectTo, { replace: true })
        } else {
          // Failed - redirect to login with error
          navigate('/login?error=auth_failed', { replace: true })
        }
      }
    }, 2000) // Give some time for auth state to update

    return () => clearTimeout(timer)
  }, [isAuthenticated, loading, navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {loading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Authenticating...</h2>
                  <p className="text-muted-foreground">
                    Please wait while we sign you in
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