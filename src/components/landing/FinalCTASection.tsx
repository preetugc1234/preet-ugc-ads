import { Button } from "@/components/ui/button";

export default function FinalCTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Container */}
        <div className="max-w-5xl mx-auto">
          {/* Black Rounded Container */}
          <div
            className="relative bg-black rounded-[3rem] overflow-hidden p-16 text-center"
            style={{
              backgroundImage: 'url(/assets/framer-background.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Background Blur Overlay */}
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: 'blur(5px)',
                background: 'rgba(0, 0, 0, 0.7)'
              }}
            ></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Main Heading */}
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Make your video in seconds.
              </h2>

              {/* Subheading */}
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                The fastest way to create AI videos
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 h-auto text-lg rounded-xl shadow-lg transition-all duration-300"
                >
                  Get Started →
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10 font-semibold px-8 py-4 h-auto text-lg rounded-xl transition-all duration-300"
                >
                  Watch Demo →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}