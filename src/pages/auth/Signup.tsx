import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Handle signup logic here - replace with actual auth
      console.log("Signup attempt:", formData);

      // Mock successful signup - redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);

    try {
      // Simulate Google auth
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Handle Google signup logic here
      console.log("Google signup attempt");

      // Mock successful signup - redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Google signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-5 min-h-[700px]">
            {/* Left Side - Image */}
            <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">A</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Join Our Platform!</h1>
                    <p className="text-emerald-100 text-lg">
                      Create your account and unlock the full potential of AI-powered content creation.
                    </p>
                  </div>
                  <div className="space-y-3 text-sm text-emerald-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                      <span>Free credits to get started</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                      <span>Access to 6 powerful AI tools</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                      <span>No setup fees or hidden charges</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                      <span>Start creating in minutes</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <Shield className="h-5 w-5 text-emerald-300" />
                    <span className="text-sm">Your data is secure and encrypted</span>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
              <div className="absolute top-1/4 -right-8 w-24 h-24 bg-white/5 rounded-full"></div>
              <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-white/5 rounded-full"></div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Sign up to start your AI content creation journey
                  </p>
                </div>

                {/* Google Signup */}
                <Button
                  variant="outline"
                  className="w-full h-12 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-gray-500 dark:text-gray-400">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="pl-10 h-11"
                          placeholder="John"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="pl-10 h-11"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="pl-10 h-11"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="pl-10 pr-10 h-11"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="pl-10 pr-10 h-11"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleCheckboxChange("agreeToTerms", checked as boolean)}
                        required
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 dark:text-gray-300">
                        I agree to the{" "}
                        <Link to="/resources/terms-conditions" className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-medium">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link to="/resources/privacy-policy" className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-medium">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="subscribeNewsletter"
                        checked={formData.subscribeNewsletter}
                        onCheckedChange={(checked) => handleCheckboxChange("subscribeNewsletter", checked as boolean)}
                      />
                      <Label htmlFor="subscribeNewsletter" className="text-sm text-gray-600 dark:text-gray-300">
                        Subscribe to our newsletter for updates and tips
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium"
                    disabled={!formData.agreeToTerms || isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Already have an account?{" "}
                    <Link
                      to="/auth/login"
                      className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;