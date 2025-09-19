/**
 * Login Page Component
 * Handles user authentication with Google OAuth
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { clearAuthData, clearAllBrowserStorage } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Chrome, ArrowLeft, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signInWithGoogle, loading, isAuthenticated } = useAuth()
  const [isClearing, setIsClearing] = useState(false)

  // Check if this is signup mode based on URL path
  const isSignupMode = window.location.pathname.includes('signup')

  const error = searchParams.get('error')
  const from = searchParams.get('from') || '/dashboard'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, from])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      // Auth context will handle the redirect after successful sign in
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleClearCacheAndRetry = () => {
    clearAuthData()
    window.location.reload()
  }

  const handleNuclearClear = async () => {
    setIsClearing(true)
    try {
      await clearAllBrowserStorage()
      // Wait a moment then reload
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Failed to clear storage:', error)
      setIsClearing(false)
    }
  }

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'auth_failed':
        return {
          title: 'Authentication failed',
          message: 'There was a problem signing you in. This is often due to browser cache conflicts.',
          showClearCache: true
        }
      case 'access_denied':
        return {
          title: 'Access denied',
          message: 'Google sign-in was cancelled or denied. Please try again.',
          showClearCache: false
        }
      case 'timeout':
        return {
          title: 'Authentication timed out',
          message: 'The sign-in process took too long. Please try again.',
          showClearCache: true
        }
      default:
        return null
    }
  }

  const errorMessage = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to home link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">
              {isSignupMode ? "Create your account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {isSignupMode
                ? "Join UGC AI to start creating amazing content with AI"
                : "Sign in to your UGC AI account to continue creating amazing content"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div>
                      <strong>{errorMessage.title}</strong>
                      <div className="mt-1">{errorMessage.message}</div>
                    </div>
                    {errorMessage.showClearCache && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearCacheAndRetry}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Clear Cache & Retry
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5 mr-2" />
                  {isSignupMode ? "Sign up with Google" : "Continue with Google"}
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Secure authentication
                </span>
              </div>
            </div>

            {/* Features list */}
            <div className="space-y-3 pt-2">
              <div className="text-sm text-muted-foreground">
                {isSignupMode ? "What you'll get access to:" : "Access your account to:"}
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  AI-powered content generation
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  {isSignupMode ? "1000 free credits to start" : "Use your available credits"}
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Generation history & downloads
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Profile & preference management
                </li>
              </ul>
            </div>

            {/* Nuclear clear option */}
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground text-center mb-3">
                Still having issues? Try the nuclear option:
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNuclearClear}
                disabled={isClearing || loading}
                className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Clearing All Data...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Browser Data & Retry
                  </>
                )}
              </Button>
            </div>

            {/* Privacy note */}
            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your data is secure and never shared with third parties.
            </div>
          </CardContent>
        </Card>

        {/* Additional help */}
        <div className="text-center text-sm text-muted-foreground">
          {isSignupMode ? (
            <>
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in here
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up here
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage