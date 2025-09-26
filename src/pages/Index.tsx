import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Statistics from "@/components/landing/Statistics";
import ProductShowcase from "@/components/landing/ProductShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import RealResults from "@/components/landing/RealResults";
import SupportTeams from "@/components/landing/SupportTeams";
import TrustSection from "@/components/landing/TrustSection";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Statistics />
      <ProductShowcase />
      <HowItWorks />
      <RealResults />
      <SupportTeams />
      <TrustSection />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
