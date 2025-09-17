import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Star, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <Badge 
                variant="secondary" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              >
                🎯 AD CREATION
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
                Create, Test, and Launch
                <br />
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Winning Ads with AI
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
                Generate multiple variants and let AI testing surface the top performer—fast.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-4 h-auto text-lg shadow-glow transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5 mr-2" />
                START TESTING FREE
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 h-auto text-lg transition-all duration-300 hover:scale-105"
              >
                See Plans
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>Rated 4.7/5 on G2</span>
              </div>
            </div>
          </div>

          {/* Right Content - Video Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {/* Video placeholders with proper aspect ratios */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[9/16] bg-gradient-card rounded-2xl overflow-hidden shadow-glass backdrop-blur-sm border border-white/10 group hover:scale-105 transition-transform duration-300"
                >
                  <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Video caption */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1">
                      <p className="text-white text-xs font-medium">
                        {i === 0 && "Product Demo"}
                        {i === 1 && "UGC Style"}
                        {i === 2 && "Testimonial"}
                        {i === 3 && "Brand Story"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating metrics */}
            <div className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-glass rounded-2xl p-4 border border-white/20 shadow-glass">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">97%</div>
                <div className="text-sm opacity-80">Time Saved</div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-glass rounded-2xl p-4 border border-white/20 shadow-glass">
              <div className="text-white text-center">
                <div className="text-2xl font-bold">2.7x</div>
                <div className="text-sm opacity-80">Better ROI</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}