import { Button } from "@/components/ui/button";

export default function FeaturesSection() {
  const features = [
    {
      title: "Launch a UGC video in 2 Minutes - No Creator Needed",
      description: "Just describe your product, and let MakeUGC help you choose the most attractive, entertaining, selling, and convert-ready videos. No creativity, no editing, this is solution.",
      price: "$2,000-$10,000/mo",
      comparison: "$2,500-$30,000/mo",
      imageCount: 4
    },
    {
      title: "Create Your Own AI Avatar - Be Everywhere, 24/7",
      description: "Upload seconds of footage and let generative video AI - anything from daily brand videos to full brand short-form content.",
      price: "$3,000/mo",
      comparison: "$500/hour",
      imageCount: 3
    },
    {
      title: "Talking Product in Hand Video",
      description: "Your hand on film speaks about your product thinking, and commenting your product's power screen like letsbon fire machine.",
      price: "$25-$50/video",
      comparison: "Product in hand video",
      imageCount: 3
    },
    {
      title: "300+ Licensed AI Creators - Included",
      description: "Create and test different content and find which one is performing best. No more unlimited spend. Want proof --- see like the content.",
      price: "$1,000/mo",
      comparison: "$200/video",
      imageCount: 4
    },
    {
      title: "Speak 35+ Languages - Instantly",
      description: "Reach global audiences with nativeSpeaking in your audience language automatically with AI so you can increase potential.",
      price: "$500-$1,500/mo",
      comparison: "",
      imageCount: 4
    },
    {
      title: "AI Hook Generator That Captures Attention",
      description: "Generate scroll-stopping openings instantly. No more weird videos --- see right performance hooks on demand.",
      price: "$500-$1,000/mo",
      comparison: "",
      imageCount: 4
    },
    {
      title: "Ad Script Writer That Converts",
      description: "Our AI writes high-performing ad scripts based on your product. After an ad campaign is launched in countries.",
      price: "$300-$2,000/mo",
      comparison: "",
      imageCount: 1
    }
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
        <div
          className="relative rounded-3xl p-8 lg:p-12 min-h-screen"
          style={{
            backgroundImage: 'url(/assets/features-background-aesthetic.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                Our <span className="text-blue-300">features</span>
              </h2>
              <p className="text-xl text-white/90 max-w-4xl mx-auto">
                From concept to finished ad. Make UGC helps you ad creation process in one streamlined flow.
              </p>
            </div>

        {/* Features Grid */}
        <div className="space-y-8 mb-16">
          {/* Row 1 - 2 features */}
          <div className="grid lg:grid-cols-2 gap-8">
            {features.slice(0, 2).map((feature, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                {/* Image placeholder */}
                <div className="mb-6">
                  <div className="grid grid-cols-4 gap-2 h-40">
                    {Array.from({ length: feature.imageCount }).map((_, imgIndex) => (
                      <div key={imgIndex} className="bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">IMG</span>
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {feature.price}
                  </div>
                  {feature.comparison && (
                    <div className="text-gray-500 line-through">
                      {feature.comparison}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 - 2 features */}
          <div className="grid lg:grid-cols-2 gap-8">
            {features.slice(2, 4).map((feature, index) => (
              <div key={index + 2} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                {/* Image placeholder */}
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-2 h-40">
                    {Array.from({ length: feature.imageCount }).map((_, imgIndex) => (
                      <div key={imgIndex} className="bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">IMG</span>
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {feature.price}
                  </div>
                  {feature.comparison && (
                    <div className="text-gray-500 line-through">
                      {feature.comparison}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Row 3 - 3 features */}
          <div className="grid lg:grid-cols-3 gap-8">
            {features.slice(4, 7).map((feature, index) => (
              <div key={index + 4} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                {/* Image placeholder */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-2 h-32">
                    {Array.from({ length: Math.min(feature.imageCount, 4) }).map((_, imgIndex) => (
                      <div key={imgIndex} className="bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">IMG</span>
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  {feature.description}
                </p>

                <div className="text-xl font-bold text-blue-600">
                  {feature.price}
                </div>
              </div>
            ))}
          </div>
        </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button
                size="lg"
                className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-12 py-4 h-auto text-lg rounded-full"
              >
                Try MakeUGC Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}