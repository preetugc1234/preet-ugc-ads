import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Palette, Settings, Download, Sparkles, ArrowRight, CheckCircle, Clock } from "lucide-react";

const ImageGeneration = () => {
  const features = [
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: "Advanced AI Models",
      description: "Powered by Gemini 2.5 Flash for stunning, high-quality image generation"
    },
    {
      icon: <Settings className="h-8 w-8 text-primary" />,
      title: "Customizable Styles",
      description: "Choose from various artistic styles, aspect ratios, and quality settings"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Preview First",
      description: "See 720p previews instantly, then generate high-resolution finals"
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: "Multiple Formats",
      description: "Download in PNG, JPG, or WEBP formats with various resolutions"
    }
  ];

  const styles = [
    "Photorealistic", "Digital Art", "Oil Painting", "Watercolor",
    "Anime/Manga", "3D Render", "Sketch/Drawing", "Abstract",
    "Minimalist", "Vintage", "Cyberpunk", "Fantasy"
  ];

  const benefits = [
    {
      title: "Free Daily Images",
      description: "2 free image generations per day - no credits required",
      highlight: true
    },
    {
      title: "HD Quality",
      description: "Generate images up to 4K resolution with crisp details"
    },
    {
      title: "Commercial License",
      description: "Use generated images for commercial projects"
    },
    {
      title: "Batch Generation",
      description: "Create multiple variations with different seeds"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Describe Your Vision",
      description: "Enter a detailed prompt describing the image you want to create"
    },
    {
      number: "02",
      title: "Choose Style & Settings",
      description: "Select artistic style, aspect ratio, and quality preferences"
    },
    {
      number: "03",
      title: "Preview Generation",
      description: "Get a 720p preview in seconds to review your concept"
    },
    {
      number: "04",
      title: "Download Final",
      description: "Generate and download high-resolution final image"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Image className="h-4 w-4 mr-1" />
                AI Image Generator
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create Stunning Images with AI
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Transform your ideas into beautiful visuals with our advanced AI image generator.
                From concept art to marketing materials, create professional-quality images in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Generate Your First Image
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  View Gallery
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <div className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-lg flex items-center justify-center">
                    <Image className="h-12 w-12 text-purple-600 dark:text-purple-300" />
                  </div>
                </Card>
                <Card className="p-4 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm mt-8">
                  <div className="aspect-square bg-gradient-to-br from-pink-200 to-orange-200 dark:from-pink-800 dark:to-orange-800 rounded-lg flex items-center justify-center">
                    <Palette className="h-12 w-12 text-pink-600 dark:text-pink-300" />
                  </div>
                </Card>
                <Card className="p-4 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm -mt-4">
                  <div className="aspect-square bg-gradient-to-br from-orange-200 to-yellow-200 dark:from-orange-800 dark:to-yellow-800 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-orange-600 dark:text-orange-300" />
                  </div>
                </Card>
                <Card className="p-4 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm mt-4">
                  <div className="aspect-square bg-gradient-to-br from-yellow-200 to-green-200 dark:from-yellow-800 dark:to-green-800 rounded-lg flex items-center justify-center">
                    <Settings className="h-12 w-12 text-yellow-600 dark:text-yellow-300" />
                  </div>
                </Card>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full blur-xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Image Generation Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our streamlined process gets you from concept to final image in just four simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Image Generation Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Advanced AI technology meets intuitive design for professional-quality image creation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0 text-center">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Styles Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Choose from 12+ Artistic Styles</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                From photorealistic renders to abstract art, our AI can adapt to any artistic style you envision.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {styles.map((style, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{style}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="p-8 shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700">
              <h3 className="text-2xl font-bold mb-6 text-center">Image Generation Benefits</h3>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className={`p-4 rounded-lg ${benefit.highlight ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-white/60 dark:bg-slate-700/60'}`}>
                    <h4 className="font-semibold mb-2 flex items-center">
                      {benefit.title}
                      {benefit.highlight && <Badge className="ml-2 bg-green-500">2 FREE/DAY</Badge>}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Creating Amazing Images Today
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators, marketers, and artists who are bringing their visions to life with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
              Generate Free Images
              <Image className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Explore All Plans
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ImageGeneration;