import { Button } from "@/components/ui/button";

export default function FinalCTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Ready to 10x your
              <br />
              <span className="text-blue-500">ad creative output?</span>
            </h2>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of businesses already creating stunning UGC videos with AI.
              Start generating professional content in minutes, not weeks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 h-auto text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start Creating Now →
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-4 h-auto text-lg rounded-xl transition-all duration-300 hover:scale-105"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span>⭐⭐⭐⭐⭐</span>
                <span>4.9/5 Rating</span>
              </div>
              <div>•</div>
              <div>No Credit Card Required</div>
              <div>•</div>
              <div>Start Free</div>
            </div>
          </div>

          {/* Right Side - Black Square with Background */}
          <div className="relative">
            <div
              className="relative w-full h-96 lg:h-[500px] bg-black rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Background Image with Blur */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'url(/assets/framer-background.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'blur(3px)'
                }}
              ></div>

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40"></div>

              {/* Content Over Background */}
              <div className="relative z-10 h-full flex items-center justify-center p-8">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    See MakeUGC in Action
                  </h3>
                  <p className="text-white/80 mb-6 max-w-xs mx-auto">
                    Watch how our AI creates authentic UGC videos in under 2 minutes
                  </p>
                  <Button
                    className="bg-white/20 backdrop-blur border border-white/30 text-white hover:bg-white/30 px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    ▶ Play Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}