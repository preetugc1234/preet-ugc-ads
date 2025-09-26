import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/background-rotated.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: 'rotate(0deg)',
        filter: 'blur(1px)'
      }}
    >
      {/* Gradient blur effects for seamless merge */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-5"></div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to transform your
            <br />
            <span className="text-blue-300">marketing game?</span>
          </h2>

          {/* Subheading */}
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12">
            Join thousands of businesses already creating stunning UGC videos with AI.
            Start your journey today and see the difference authentic content can make.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-4 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Creating Now
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-semibold px-12 py-4 h-auto text-lg rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-white/80">
            <p className="text-sm mb-4">Trusted by 10,000+ creators worldwide</p>
            <div className="flex justify-center items-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <span>⭐⭐⭐⭐⭐</span>
                <span>4.9/5 Rating</span>
              </div>
              <div>•</div>
              <div>No Credit Card Required</div>
              <div>•</div>
              <div>30-Day Free Trial</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}