import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background with blur */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #e0f2fe 0%, #81d4fa 25%, #42a5f5 50%, #1976d2 75%, #0d47a1 100%)',
          filter: 'blur(2px)'
        }}
      ></div>

      {/* Gradient blur effects for seamless merge */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent z-10 pointer-events-none"></div>

      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-15"></div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            MakeUGC <span className="text-blue-500">VS</span> Everyone Else
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
            Everyone's talking about it. MakeUGC just made creators optional.
          </p>

          {/* Comparison Grid */}
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12 px-6">
            {/* MakeUGC Side */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-black rounded-2xl p-5 text-white aspect-[4/3]">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-sm">M</span>
                </div>
                <span className="text-lg font-bold">makeugc</span>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Prompt → talking product-in-hand video</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">AI writes hooks, CTAs, and full scripts</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">300+ avatars with speech-to-speech in 35+ languages</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">All UGC for under $6/video</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Bulk variation engine (100+ per input)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Consistent, high-performing results</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Rapid A-B testing</span>
                </div>
              </div>
            </div>

            {/* Others Side */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 aspect-[4/3]">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Others</h3>

              <div className="space-y-2 text-left">
                <div className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Expensive freelancers, creators & editors</span>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Slow shoots, edits, and approvals</span>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Inconsistent tone & quality</span>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">$300+ per UGC video</span>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Manual content splicing</span>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Guesswork, delays, and fatigue</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-12 py-4 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Started →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}