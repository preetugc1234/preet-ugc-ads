import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Handle login logic here - replace with actual auth
      console.log("Login attempt:", formData);

      // Mock successful login - redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      // Simulate Google auth
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Handle Google login logic here
      console.log("Google login attempt");

      // Mock successful login - redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-5 min-h-[600px]">
            {/* Left Side - Image */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">A</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
                    <p className="text-blue-100 text-lg">
                      Sign in to your account and continue your AI-powered content creation journey.
                    </p>
                  </div>
                  <div className="space-y-3 text-sm text-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                      <span>Access to all AI tools</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                      <span>Manage your credits</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                      <span>View your creation history</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
              <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-white/5 rounded-full"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter your credentials to access your account
                  </p>
                </div>

                {/* Google Login */}
                <Button
                  variant="outline"
                  className="w-full h-12 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={handleGoogleLogin}
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

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
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
                          className="pl-10 h-12"
                          placeholder="Enter your email"
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
                          className="pl-10 pr-10 h-12"
                          placeholder="Enter your password"
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
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        Remember me
                      </Label>
                    </div>
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Don't have an account?{" "}
                    <Link
                      to="/auth/signup"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                    >
                      Sign up here
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

export default Login;