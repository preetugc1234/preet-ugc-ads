import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Sparkles, User, Target, Mic, Palette, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    bio: "",
    primaryUse: "",
    experienceLevel: "",
    preferredVoice: "",
    imageStyle: "",
    videoStyle: "",
    goals: [] as string[]
  });

  const totalSteps = 5;

  // Step 1: Personal Info
  const personalInfo = (
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
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="company">Company (Optional)</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            placeholder="Your company or organization"
          />
        </div>

        <div>
          <Label htmlFor="bio">Tell us about yourself (Optional)</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="What do you do? What interests you about AI?"
            className="min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Usage & Experience
  const usageAndExperience = (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">How will you use our platform?</h2>
        <p className="text-gray-600 dark:text-gray-400">Help us customize your experience</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-3 block">Primary use case *</Label>
          <RadioGroup value={formData.primaryUse} onValueChange={(value) => setFormData({...formData, primaryUse: value})}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="content-creation" id="content-creation" />
                <Label htmlFor="content-creation" className="flex-1 cursor-pointer">
                  <div className="font-medium">Content Creation</div>
                  <div className="text-sm text-gray-500">Social media, marketing, YouTube videos</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business" className="flex-1 cursor-pointer">
                  <div className="font-medium">Business & Professional</div>
                  <div className="text-sm text-gray-500">Presentations, training, corporate content</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="education" id="education" />
                <Label htmlFor="education" className="flex-1 cursor-pointer">
                  <div className="font-medium">Education & Learning</div>
                  <div className="text-sm text-gray-500">Teaching materials, courses, tutorials</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex-1 cursor-pointer">
                  <div className="font-medium">Personal Projects</div>
                  <div className="text-sm text-gray-500">Hobbies, family memories, creative experiments</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="flex-1 cursor-pointer">
                  <div className="font-medium">Other</div>
                  <div className="text-sm text-gray-500">Something else entirely</div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Experience with AI tools *</Label>
          <RadioGroup value={formData.experienceLevel} onValueChange={(value) => setFormData({...formData, experienceLevel: value})}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner" className="cursor-pointer">
                  <div className="font-medium">Beginner</div>
                  <div className="text-xs text-gray-500">New to AI</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="cursor-pointer">
                  <div className="font-medium">Intermediate</div>
                  <div className="text-xs text-gray-500">Some experience</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="cursor-pointer">
                  <div className="font-medium">Advanced</div>
                  <div className="text-xs text-gray-500">Very experienced</div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  // Step 3: Voice Preferences
  const voicePreferences = (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Choose your default voice</h2>
        <p className="text-gray-600 dark:text-gray-400">You can change this later in any text-to-speech generation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: "sarah", name: "Sarah", accent: "American", gender: "Female", description: "Professional and clear" },
          { id: "alex", name: "Alex", accent: "British", gender: "Male", description: "Sophisticated and articulate" },
          { id: "maria", name: "Maria", accent: "Spanish", gender: "Female", description: "Warm and friendly" },
          { id: "david", name: "David", accent: "American", gender: "Male", description: "Deep and authoritative" },
          { id: "emma", name: "Emma", accent: "Australian", gender: "Female", description: "Energetic and engaging" },
          { id: "james", name: "James", accent: "Canadian", gender: "Male", description: "Natural and conversational" }
        ].map((voice) => (
          <div
            key={voice.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              formData.preferredVoice === voice.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => setFormData({...formData, preferredVoice: voice.id})}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{voice.name}</h3>
              <div className="flex space-x-1">
                <Badge variant="secondary" className="text-xs">{voice.gender}</Badge>
                <Badge variant="outline" className="text-xs">{voice.accent}</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{voice.description}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-8"
              onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: "Voice Preview",
                  description: `Playing ${voice.name} voice sample...`,
                });
              }}
            >
              🔊 Preview
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 4: Style Preferences
  const stylePreferences = (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Palette className="w-8 h-8 text-pink-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Set your creative style</h2>
        <p className="text-gray-600 dark:text-gray-400">Choose default styles for images and videos</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-3 block">Default image style</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: "photorealistic", name: "Photorealistic", preview: "📸" },
              { id: "artistic", name: "Artistic", preview: "🎨" },
              { id: "cartoon", name: "Cartoon", preview: "🎭" },
              { id: "minimalist", name: "Minimalist", preview: "⚪" },
              { id: "vintage", name: "Vintage", preview: "📽️" },
              { id: "futuristic", name: "Futuristic", preview: "🚀" },
              { id: "nature", name: "Nature", preview: "🌿" },
              { id: "abstract", name: "Abstract", preview: "🌀" }
            ].map((style) => (
              <div
                key={style.id}
                className={`p-3 border rounded-lg cursor-pointer text-center transition-all hover:shadow-md ${
                  formData.imageStyle === style.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setFormData({...formData, imageStyle: style.id})}
              >
                <div className="text-2xl mb-1">{style.preview}</div>
                <div className="text-sm font-medium">{style.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-3 block">Default video style</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: "cinematic", name: "Cinematic", description: "Movie-like quality" },
              { id: "documentary", name: "Documentary", description: "Real and authentic" },
              { id: "commercial", name: "Commercial", description: "Polished and professional" },
              { id: "social", name: "Social Media", description: "Trendy and engaging" },
              { id: "educational", name: "Educational", description: "Clear and informative" },
              { id: "creative", name: "Creative", description: "Artistic and unique" }
            ].map((style) => (
              <div
                key={style.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  formData.videoStyle === style.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setFormData({...formData, videoStyle: style.id})}
              >
                <div className="font-medium">{style.name}</div>
                <div className="text-xs text-gray-500">{style.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 5: Goals & Completion
  const goalsAndCompletion = (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">What are your goals?</h2>
        <p className="text-gray-600 dark:text-gray-400">Select all that apply - we'll personalize your experience</p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">I want to... (select multiple)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: "increase-engagement", text: "Increase social media engagement" },
            { id: "save-time", text: "Save time on content creation" },
            { id: "improve-quality", text: "Improve content quality" },
            { id: "learn-ai", text: "Learn about AI tools" },
            { id: "scale-business", text: "Scale my business" },
            { id: "creative-projects", text: "Work on creative projects" },
            { id: "professional-growth", text: "Advance my career" },
            { id: "automate-tasks", text: "Automate repetitive tasks" }
          ].map((goal) => (
            <div
              key={goal.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                formData.goals.includes(goal.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => {
                const newGoals = formData.goals.includes(goal.id)
                  ? formData.goals.filter(g => g !== goal.id)
                  : [...formData.goals, goal.id];
                setFormData({...formData, goals: newGoals});
              }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  formData.goals.includes(goal.id)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}>
                  {formData.goals.includes(goal.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm">{goal.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border">
        <div className="flex items-center space-x-3 mb-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium">You're almost ready!</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          We'll use your preferences to customize your dashboard and provide personalized recommendations.
        </p>
        <div className="flex items-center space-x-2 text-sm">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-green-600 dark:text-green-400">Free starter credits included</span>
        </div>
      </div>
    </div>
  );

  const steps = [
    personalInfo,
    usageAndExperience,
    voicePreferences,
    stylePreferences,
    goalsAndCompletion
  ];

  const stepTitles = [
    "Personal Info",
    "Usage & Experience",
    "Voice Preferences",
    "Style Preferences",
    "Goals & Completion"
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName.trim() && formData.lastName.trim();
      case 2:
        return formData.primaryUse && formData.experienceLevel;
      case 3:
        return formData.preferredVoice;
      case 4:
        return formData.imageStyle && formData.videoStyle;
      case 5:
        return true; // Goals are optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call to save onboarding data
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Welcome aboard! 🎉",
        description: "Your profile has been set up successfully.",
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Setup Your Account</h1>
              <span className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between text-xs">
              {stepTitles.map((title, index) => (
                <div
                  key={index}
                  className={`text-center ${
                    index + 1 <= currentStep
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto mb-1 ${
                    index + 1 < currentStep
                      ? 'bg-blue-600 border-blue-600'
                      : index + 1 === currentStep
                      ? 'border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {index + 1 < currentStep ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <span className={index + 1 === currentStep ? 'text-blue-600 font-bold' : 'text-gray-400'}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block">{title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <Card>
            <CardContent className="p-8">
              {steps[currentStep - 1]}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Setting up...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;