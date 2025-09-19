/**
 * Onboarding Modal Component
 * A wizard-style popup that appears after successful dashboard load for first-time users
 */

import React, { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Check, Sparkles, User, Target, Mic, Palette, Zap } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Badge } from '../ui/badge'
import { useToast } from '../../hooks/use-toast'
import { useAuth } from '../../contexts/AuthContext'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { toast } = useToast()
  const { setShowOnboarding } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    bio: '',
    primaryUse: '',
    experienceLevel: '',
    preferredVoice: '',
    imageStyle: '',
    videoStyle: '',
    goals: [] as string[]
  })

  const totalSteps = 5

  if (!isOpen) return null

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call to save onboarding data
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mark onboarding as completed
      localStorage.setItem('onboarding_completed', 'true')
      localStorage.setItem('onboarding_data', JSON.stringify(formData))

      toast({
        title: "Welcome to UGC AI Platform! 🎉",
        description: "Your account is set up and ready to create amazing content.",
      })

      // Close the modal
      setShowOnboarding(false)
      onClose()
    } catch (error) {
      console.error('Onboarding error:', error)
      toast({
        title: "Something went wrong",
        description: "We couldn't save your preferences. You can update them later in settings.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  // Step components
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to UGC AI Platform!</h2>
              <p className="text-gray-600 dark:text-gray-400">Let's get to know you better</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Company/Organization (Optional)</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="Your company name"
                />
              </div>

              <div>
                <Label htmlFor="bio">Tell us about yourself (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  placeholder="Brief description about you and your work..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">What brings you here?</h2>
              <p className="text-gray-600 dark:text-gray-400">Help us understand your primary use case</p>
            </div>

            <RadioGroup value={formData.primaryUse} onValueChange={(value) => updateFormData('primaryUse', value)}>
              <div className="space-y-3">
                {[
                  { value: 'content_creation', label: 'Content Creation', desc: 'Creating engaging content for social media' },
                  { value: 'marketing', label: 'Marketing & Advertising', desc: 'Promotional content and ad campaigns' },
                  { value: 'education', label: 'Education & Training', desc: 'Educational content and tutorials' },
                  { value: 'entertainment', label: 'Entertainment', desc: 'Fun and engaging entertainment content' },
                  { value: 'business', label: 'Business Presentations', desc: 'Professional presentations and demos' },
                  { value: 'personal', label: 'Personal Projects', desc: 'Personal creative projects and hobbies' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-medium">{option.label}</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Experience Level</h2>
              <p className="text-gray-600 dark:text-gray-400">How familiar are you with AI content creation?</p>
            </div>

            <RadioGroup value={formData.experienceLevel} onValueChange={(value) => updateFormData('experienceLevel', value)}>
              <div className="space-y-3">
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'New to AI content creation' },
                  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience with AI tools' },
                  { value: 'advanced', label: 'Advanced', desc: 'Experienced with various AI platforms' },
                  { value: 'expert', label: 'Expert', desc: 'Professional content creator' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-medium">{option.label}</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Creative Preferences</h2>
              <p className="text-gray-600 dark:text-gray-400">What's your preferred style?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">Preferred Voice Style</Label>
                <RadioGroup value={formData.preferredVoice} onValueChange={(value) => updateFormData('preferredVoice', value)}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'professional', label: 'Professional' },
                      { value: 'casual', label: 'Casual' },
                      { value: 'energetic', label: 'Energetic' },
                      { value: 'calm', label: 'Calm' }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value={option.value} id={`voice-${option.value}`} />
                        <Label htmlFor={`voice-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Image Style Preference</Label>
                <RadioGroup value={formData.imageStyle} onValueChange={(value) => updateFormData('imageStyle', value)}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'realistic', label: 'Realistic' },
                      { value: 'artistic', label: 'Artistic' },
                      { value: 'cartoon', label: 'Cartoon' },
                      { value: 'minimalist', label: 'Minimalist' }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value={option.value} id={`image-${option.value}`} />
                        <Label htmlFor={`image-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Goals</h2>
              <p className="text-gray-600 dark:text-gray-400">What do you want to achieve? (Select all that apply)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                'Increase engagement',
                'Save time',
                'Improve quality',
                'Scale content production',
                'Learn new skills',
                'Grow audience',
                'Boost conversions',
                'Stand out from competition'
              ].map((goal) => (
                <div
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.goals.includes(goal)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{goal}</span>
                    {formData.goals.includes(goal) && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">
            Setup Your Account ({currentStep}/{totalSteps})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <Button
              onClick={nextStep}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </div>
              ) : currentStep === totalSteps ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OnboardingModal