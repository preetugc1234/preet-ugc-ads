/**
 * Signup Page Component
 * Handles user registration with both Google OAuth and email/password
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { clearAllBrowserStorage } from '../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Separator } from '../../components/ui/separator'
import { Checkbox } from '../../components/ui/checkbox'
import { Loader2, Chrome, ArrowLeft, AlertCircle, RefreshCw, Trash2, Eye, EyeOff, User, Mail, Lock, Shield } from 'lucide-react'

export function SignupPage() {
  const navigate = useNavigate()
  const { signInWithGoogle, signUpWithEmail, loading, isAuthenticated } = useAuth()
  const [isClearing, setIsClearing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  const [forceReset, setForceReset] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Email signup clicked', { email: formData.email, loading, localLoading })

    if (!validateForm()) {
      console.log('❌ Form validation failed')
      return
    }

    setLocalLoading(true)
    console.log('📧 Starting email signup...')
    try {
      await signUpWithEmail(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName
      })
      console.log('✅ Email signup completed')
    } catch (error) {
      console.error('❌ Email signup error:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    console.log('🔐 Google signup clicked', { loading, localLoading })

    setLocalLoading(true)
    try {
      console.log('🔄 Starting Google OAuth signup...')
      await signInWithGoogle()
      console.log('✅ Google signup completed')
    } catch (error) {
      console.error('❌ Google signup error:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  const handleEmergencyReset = () => {
    console.log('🚨 EMERGENCY RESET clicked')
    setLocalLoading(false)
    setIsClearing(false)
    setForceReset(true)
    // Force reload after 1 second
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleNuclearClear = async () => {
    setIsClearing(true)
    try {
      await clearAllBrowserStorage()
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Failed to clear storage:', error)
      setIsClearing(false)
    }
  }

  const isCurrentlyLoading = forceReset ? false : (loading || localLoading)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900 flex items-center justify-center p-4">
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
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription>
              Join UGC AI to start creating amazing content with AI
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Debug Info */}
            <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <strong>DEBUG:</strong> AuthContext loading: {loading.toString()}, Local loading: {localLoading.toString()},
              Currently loading: {isCurrentlyLoading.toString()}
            </div>

            {/* Emergency Reset Button */}
            {(loading || localLoading) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
                <div className="text-sm text-red-700 dark:text-red-300 mb-2">
                  Buttons stuck loading? Use emergency reset:
                </div>
                <Button
                  onClick={handleEmergencyReset}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  🚨 EMERGENCY RESET & RELOAD
                </Button>
              </div>
            )}

            {/* Google Sign Up Button */}
            <Button
              onClick={handleGoogleSignup}
              disabled={isCurrentlyLoading}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {isCurrentlyLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing up...
                </>
              ) : (
                <>
                  <Chrome className="h-5 w-5 mr-2" />
                  Sign up with Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="John"
                      disabled={isCurrentlyLoading}
                    />
                  </div>
                  {formErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Doe"
                      disabled={isCurrentlyLoading}
                    />
                  </div>
                  {formErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="john.doe@example.com"
                    disabled={isCurrentlyLoading}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    placeholder="Create a strong password"
                    disabled={isCurrentlyLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    placeholder="Confirm your password"
                    disabled={isCurrentlyLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                    disabled={isCurrentlyLoading}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I agree to the{' '}
                    <Link to="/resources/terms-conditions" className="text-primary hover:underline">
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/resources/privacy-policy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {formErrors.agreeToTerms && (
                  <p className="text-sm text-red-600">{formErrors.agreeToTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isCurrentlyLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

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
                  1000 free credits to start
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
                Having browser issues?
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
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Shield className="h-4 w-4" />
                <span>Your data is secure and encrypted</span>
              </div>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardContent>
        </Card>

        {/* Already have account */}
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignupPage