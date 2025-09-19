/**
 * Login Page Component
 * Handles user authentication with Google OAuth
 */

import React, { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Chrome, ArrowLeft, AlertCircle } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signInWithGoogle, loading, isAuthenticated } = useAuth()

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

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'auth_failed':
        return 'Authentication failed. Please try again.'
      case 'access_denied':
        return 'Access was denied. Please try again.'
      case 'timeout':
        return 'Authentication timed out. Please try again.'
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
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your UGC AI account to continue creating amazing content
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
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
                  Continue with Google
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
                What you'll get access to:
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  AI-powered content generation
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Credit-based usage system
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

            {/* Privacy note */}
            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your data is secure and never shared with third parties.
            </div>
          </CardContent>
        </Card>

        {/* Additional help */}
        <div className="text-center text-sm text-muted-foreground">
          Having trouble signing in?{' '}
          <Link to="/help" className="text-primary hover:underline">
            Get help
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage