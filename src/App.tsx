import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

// Authentication
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthCallback from "./components/auth/AuthCallback";

// Simple Auth Pages
import SimpleLogin from "./pages/auth/SimpleLogin";
import SimpleSignup from "./pages/auth/SimpleSignup";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Product Pages
import Chat from "./pages/products/Chat";
import ImageGeneration from "./pages/products/ImageGeneration";
import ImageToVideo from "./pages/products/ImageToVideo";
import TextToSpeech from "./pages/products/TextToSpeech";
import ImageToVideoWithAudio from "./pages/products/ImageToVideoWithAudio";
import AudioToVideo from "./pages/products/AudioToVideo";

// Resource Pages
import Documentation from "./pages/resources/Documentation";
import APIReference from "./pages/resources/APIReference";
import Tutorials from "./pages/resources/Tutorials";
import Community from "./pages/resources/Community";
import Support from "./pages/resources/Support";
import PrivacyPolicy from "./pages/resources/PrivacyPolicy";
import TermsConditions from "./pages/resources/TermsConditions";

// Note: Removed duplicate auth pages - using consolidated LoginPage for both login and signup

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import ChatTool from "./pages/dashboard/tools/ChatTool";
import ImageTool from "./pages/dashboard/tools/ImageTool";
import ImageToVideoTool from "./pages/dashboard/tools/ImageToVideoTool";
import TextToSpeechTool from "./pages/dashboard/tools/TextToSpeechTool";
import UGCVideoTool from "./pages/dashboard/tools/UGCVideoTool";
import History from "./pages/dashboard/History";
import Billing from "./pages/dashboard/Billing";
import Credits from "./pages/dashboard/Credits";
import Settings from "./pages/dashboard/Settings";
import Notifications from "./pages/dashboard/Notifications";
import LearningCenter from "./pages/dashboard/LearningCenter";

// Note: Onboarding is now handled via popup modal in dashboard instead of separate page

// Admin Pages
import AdminAuth from "./pages/admin/AdminAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Other Pages
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on auth errors (401, 403)
        if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
          return false
        }
        // Retry up to 2 times for other errors
        return failureCount < 2
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Disable refetch on window focus
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    }
  }
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
          <Route path="/" element={<Index />} />

          {/* Product Routes */}
          <Route path="/products/chat" element={<Chat />} />
          <Route path="/products/image-generation" element={<ImageGeneration />} />
          <Route path="/products/image-to-video" element={<ImageToVideo />} />
          <Route path="/products/text-to-speech" element={<TextToSpeech />} />
          <Route path="/products/image-to-video-with-audio" element={<ImageToVideoWithAudio />} />
          <Route path="/products/audio-to-video" element={<AudioToVideo />} />

          {/* Resource Routes */}
          <Route path="/resources/documentation" element={<Documentation />} />
          <Route path="/resources/api-reference" element={<APIReference />} />
          <Route path="/resources/tutorials" element={<Tutorials />} />
          <Route path="/resources/community" element={<Community />} />
          <Route path="/resources/support" element={<Support />} />
          <Route path="/resources/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/resources/terms-conditions" element={<TermsConditions />} />

          {/* Simple Auth Routes */}
          <Route path="/simple-login" element={<SimpleLogin />} />
          <Route path="/simple-signup" element={<SimpleSignup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Redirect old routes to simple ones */}
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="/signup" element={<SimpleSignup />} />
          <Route path="/auth/login" element={<SimpleLogin />} />
          <Route path="/auth/signup" element={<SimpleSignup />} />

          {/* Legacy onboarding route - now handled via popup modal */}
          <Route path="/onboarding" element={<Dashboard />} />

          {/* Dashboard Routes (Protected) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/chat" element={
            <ProtectedRoute>
              <ChatTool />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/image" element={
            <ProtectedRoute>
              <ImageTool />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/image-to-video" element={
            <ProtectedRoute>
              <ImageToVideoTool />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/text-to-speech" element={
            <ProtectedRoute>
              <TextToSpeechTool />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/ugc-video" element={
            <ProtectedRoute>
              <UGCVideoTool />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/billing" element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/credits" element={
            <ProtectedRoute>
              <Credits />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/learning" element={
            <ProtectedRoute>
              <LearningCenter />
            </ProtectedRoute>
          } />

          {/* Hidden Admin Routes (Protected + Admin Required) */}
          <Route path="/secure-access-portal" element={
            <ProtectedRoute requireAdmin>
              <AdminAuth />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/system-control-panel" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Other Routes */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
