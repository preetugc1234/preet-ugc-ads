import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Statistics from "@/components/landing/Statistics";
import VideoCreationProcess from "@/components/landing/VideoCreationProcess";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import Pricing from "@/components/landing/Pricing";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Statistics />
      <VideoCreationProcess />
      <FeaturesSection />
      <TestimonialsSection />
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
