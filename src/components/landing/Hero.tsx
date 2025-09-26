import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Star, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
      backgroundImage: 'url(/assets/hero-background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-6">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200 backdrop-blur-sm inline-flex items-center gap-2"
            >
              ✨ DTC
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight max-w-4xl mx-auto">
              The fastest way to
              <br />
              create <span className="text-blue-600">AI videos</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Write your script → Pick an avatar → Generate video
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gray-900 text-white hover:bg-gray-800 font-semibold px-8 py-4 h-auto text-lg transition-all duration-300 hover:scale-105 rounded-lg"
            >
              Create Your First Ad
            </Button>
          </div>

          {/* Video Grid */}
          <div className="relative max-w-6xl mx-auto mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Video placeholders with proper aspect ratios */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden shadow-lg border border-gray-200 group hover:scale-105 transition-transform duration-300"
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}