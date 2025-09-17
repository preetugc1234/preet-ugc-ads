import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Image, Video, Clock, Zap, ArrowRight, CheckCircle, Upload, Settings } from "lucide-react";

const ImageToVideo = () => {
  const features = [
    {
      icon: <Video className="h-8 w-8 text-primary" />,
      title: "Kling v2 Pro Engine",
      description: "Powered by cutting-edge Kling v2 Pro via Fal AI for smooth, realistic animations"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Flexible Duration",
      description: "Choose between 5-second or 10-second video outputs based on your needs"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Preview First",
      description: "See low-bitrate preview instantly, then generate high-quality final video"
    },
    {
      icon: <Settings className="h-8 w-8 text-primary" />,
      title: "Quality Control",
      description: "Fine-tune animation intensity, camera movement, and motion dynamics"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Your Image",
      description: "Upload any image or select from your previous generations"
    },
    {
      number: "02",
      title: "Set Duration & Style",
      description: "Choose 5s or 10s duration and adjust motion parameters"
    },
    {
      number: "03",
      title: "Preview Animation",
      description: "Review low-bitrate preview to ensure desired motion"
    },
    {
      number: "04",
      title: "Generate & Download",
      description: "Create final high-quality video and download in HD"
    }
  ];

  const useCases = [
    "Social Media Content",
    "Marketing Campaigns",
    "Product Demonstrations",
    "Art & Creative Projects",
    "Website Headers",
    "Presentations",
    "Digital Advertisements",
    "Content Creation"
  ];

  const pricing = [
    {
      duration: "5 Seconds",
      credits: "100 Credits",
      description: "Perfect for social media posts and quick animations",
      popular: false
    },
    {
      duration: "10 Seconds",
      credits: "200 Credits",
      description: "Ideal for detailed animations and marketing content",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                <Play className="h-4 w-4 mr-1" />
                Image to Video (No Audio)
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Bring Images to Life
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Transform static images into captivating videos with natural motion and cinematic quality.
                Perfect for social media, marketing, and creative projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  Start Creating Videos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  See Examples
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800 dark:to-teal-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Image className="h-12 w-12 text-emerald-600 dark:text-emerald-300 mx-auto mb-2" />
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">Static Image</p>
                      </div>
                    </div>
                    <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-teal-200 to-cyan-200 dark:from-teal-800 dark:to-cyan-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-12 w-12 text-teal-600 dark:text-teal-300 mx-auto mb-2" />
                        <p className="text-sm text-teal-700 dark:text-teal-300">Animated Video</p>
                      </div>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-green-500">5-10s</Badge>
                  </div>
                </div>
              </Card>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-xl opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From Static to Dynamic in 4 Steps</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our advanced AI analyzes your image and creates natural, realistic motion patterns.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Video Generation Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powered by Kling v2 Pro for professional-quality image-to-video transformation.
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

      {/* Pricing & Use Cases */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Use Cases */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Perfect for Every Project</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Whether you're creating content for social media or professional marketing campaigns,
                our image-to-video AI delivers stunning results.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {useCases.map((useCase, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Simple, Transparent Pricing</h3>
              <div className="space-y-4">
                {pricing.map((plan, index) => (
                  <Card key={index} className={`p-6 ${plan.popular ? 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'bg-white dark:bg-slate-800'}`}>
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-xl font-semibold">{plan.duration}</h4>
                          <p className="text-2xl font-bold text-emerald-600">{plan.credits}</p>
                        </div>
                        {plan.popular && (
                          <Badge className="bg-emerald-500">Most Popular</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>ETA:</strong> Preview ready in ~30 seconds, final video in 2-5 minutes depending on duration and complexity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Animate Your Images?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join creators worldwide who are bringing their static images to life with professional video animations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-emerald-50">
              Upload Image & Start
              <Upload className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              View Sample Videos
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ImageToVideo;