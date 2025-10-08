import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chrome } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ImageSlider } from '@/components/ui/image-slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SimpleSignup() {
  const { signUpWithEmail, signInWithGoogle, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const images = ['placeholder1', 'placeholder2', 'placeholder3', 'placeholder4'];

  useEffect(() => {
    console.log('🔍 SimpleSignup: Auth state changed', { isAuthenticated, loading });
    if (isAuthenticated && !loading) {
      console.log('✅ SimpleSignup: Redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUpWithEmail(formData.email, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName
    });
  };

  const handleGoogleSignup = async () => {
    console.log('🔘 Google signup button clicked');
    try {
      await signInWithGoogle();
      console.log('🔄 Google OAuth initiated from signup page');
    } catch (error) {
      console.error('❌ Google signup error in SimpleSignup:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="w-full h-screen min-h-[700px] flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        className="w-full max-w-5xl h-[700px] grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Left side: Image Slider */}
        <div className="hidden lg:block">
          <ImageSlider images={images} interval={4000} />
        </div>

        {/* Right side: Signup Form */}
        <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8 md:p-12 overflow-y-auto">
          <motion.div
            className="w-full max-w-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="text-4xl font-bold tracking-tight mb-2 text-gray-900">
              Create Account
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-gray-600 mb-8">
              Sign up to start creating amazing UGC videos.
            </motion.p>

            <motion.div variants={itemVariants} className="mb-6">
              <Button
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-105 font-semibold"
                onClick={handleGoogleSignup}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">
                  Or continue with email
                </span>
              </div>
            </motion.div>

            <motion.form variants={itemVariants} className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-900 font-medium">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-900 font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all duration-300 hover:scale-105"
              >
                Create Account
              </Button>
            </motion.form>

            <motion.p variants={itemVariants} className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/simple-login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Log in
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default SimpleSignup;
