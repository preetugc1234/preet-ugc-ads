import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";

// Other Pages
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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

          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/*" element={<Dashboard />} />

          {/* Other Routes */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
