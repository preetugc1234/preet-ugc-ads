import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Image, Music, Video, Headphones, ArrowRight, CheckCircle, Upload, Settings, Clock } from "lucide-react";

const ImageToVideoWithAudio = () => {
  const features = [
    {
      icon: <Video className="h-8 w-8 text-primary" />,
      title: "Kling v1 Pro Engine",
      description: "Advanced video generation with embedded audio synchronization"
    },
    {
      icon: <Music className="h-8 w-8 text-primary" />,
      title: "Custom Audio Upload",
      description: "Upload your own audio tracks or integrate with our TTS system"
    },
    {
      icon: <Settings className="h-8 w-8 text-primary" />,
      title: "Sync Controls",
      description: "Fine-tune audio-video synchronization and timing"
    },
    {
      icon: <Headphones className="h-8 w-8 text-primary" />,
      title: "Professional Quality",
      description: "Broadcast-ready output with crisp audio and smooth visuals"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Image & Audio",
      description: "Select your image and upload audio file or use TTS integration"
    },
    {
      number: "02",
      title: "Configure Settings",
      description: "Set duration, adjust sync timing, and animation parameters"
    },
    {
      number: "03",
      title: "Preview with Audio",
      description: "Review preview with embedded audio to ensure perfect sync"
    },
    {
      number: "04",
      title: "Generate Final Video",
      description: "Create and download high-quality video with synchronized audio"
    }
  ];

  const useCases = [
    "Music Videos & Visualizers",
    "Podcast Video Episodes",
    "Educational Content",
    "Marketing Presentations",
    "Social Media Stories",
    "Product Demonstrations",
    "Animated Advertisements",
    "Artistic Projects"
  ];

  const audioOptions = [
    {
      type: "Upload Your Audio",
      description: "Support for MP3, WAV, AAC formats up to 10MB",
      formats: ["MP3", "WAV", "AAC", "M4A"]
    },
    {
      type: "TTS Integration",
      description: "Generate speech directly with our Text-to-Speech system",
      formats: ["11Labs Voices", "Multiple Languages", "Custom Timing"]
    },
    {
      type: "Background Music",
      description: "Choose from our royalty-free music library",
      formats: ["Ambient", "Corporate", "Upbeat", "Cinematic"]
    }
  ];

  const pricing = [
    {
      duration: "5 Seconds",
      credits: "200 Credits",
      description: "Perfect for social media posts and short clips",
      popular: false
    },
    {
      duration: "10 Seconds",
      credits: "400 Credits",
      description: "Ideal for detailed presentations and marketing content",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-rose-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                <Music className="h-4 w-4 mr-1" />
                Image to Video with Audio
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                Cinematic Videos with Sound
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Create engaging videos by combining your images with custom audio tracks.
                Perfect for music videos, presentations, and multimedia storytelling with synchronized audio-visual experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700">
                  Create Your Video
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  Watch Examples
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-gradient-to-br from-rose-200 to-pink-200 dark:from-rose-800 dark:to-pink-800 rounded-lg flex items-center justify-center">
                      <Image className="h-8 w-8 text-rose-600 dark:text-rose-300" />
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-pink-200 to-orange-200 dark:from-pink-800 dark:to-orange-800 rounded-lg flex items-center justify-center">
                      <Music className="h-8 w-8 text-pink-600 dark:text-pink-300" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-rose-600" />
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-orange-200 to-rose-200 dark:from-orange-800 dark:to-rose-800 rounded-lg flex items-center justify-center relative">
                    <Play className="h-12 w-12 text-orange-600 dark:text-orange-300" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full h-1">
                        <div className="bg-white h-1 rounded-full w-1/3"></div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-green-500">Audio + Video Synced</Badge>
                  </div>
                </div>
              </Card>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-rose-400 to-orange-400 rounded-full blur-xl opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional Audio-Video Creation</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our advanced AI ensures perfect synchronization between your visuals and audio for professional results.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-rose-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Audio-Video Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powered by Kling v1 Pro for professional-grade video creation with perfect audio synchronization.
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

      {/* Audio Options */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Flexible Audio Options</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from multiple audio input methods to perfectly match your creative vision.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {audioOptions.map((option, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-4">{option.type}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{option.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {option.formats.map((format, i) => (
                      <Badge key={i} variant="secondary">{format}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases & Pricing */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Use Cases */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Perfect for Creative Projects</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Whether you're creating music videos, educational content, or marketing materials,
                our audio-video AI delivers professional results.
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
              <h3 className="text-2xl font-bold mb-6">Premium Audio-Video Pricing</h3>
              <div className="space-y-4">
                {pricing.map((plan, index) => (
                  <Card key={index} className={`p-6 ${plan.popular ? 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-900/20' : 'bg-white dark:bg-slate-800'}`}>
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-xl font-semibold">{plan.duration}</h4>
                          <p className="text-2xl font-bold text-rose-600">{plan.credits}</p>
                        </div>
                        {plan.popular && (
                          <Badge className="bg-rose-500">Most Popular</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <Clock className="h-4 w-4 inline mr-1" />
                    <strong>ETA:</strong> Preview ready in ~45 seconds, final video in 3-7 minutes
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Audio Quality:</strong> Maintains original audio fidelity with perfect sync
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-rose-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Create Stunning Audio-Visual Content
          </h2>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            Join creators, marketers, and storytellers who are bringing their visions to life with synchronized audio-video content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-rose-600 hover:bg-rose-50">
              Upload & Create Now
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

export default ImageToVideoWithAudio;