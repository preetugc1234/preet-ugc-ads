import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Volume2, Radio, Download, Languages, ArrowRight, CheckCircle, Play, FileText } from "lucide-react";

const TextToSpeech = () => {
  const features = [
    {
      icon: <Mic className="h-8 w-8 text-primary" />,
      title: "Premium Voices",
      description: "Powered by 11Labs v2.5 for natural, human-like voice synthesis"
    },
    {
      icon: <Languages className="h-8 w-8 text-primary" />,
      title: "Multiple Languages",
      description: "Support for 20+ languages and regional accents"
    },
    {
      icon: <Radio className="h-8 w-8 text-primary" />,
      title: "Voice Controls",
      description: "Adjust pitch, speed, emotion, and pronunciation"
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: "High Quality Audio",
      description: "Export in MP3, WAV formats with various bitrates"
    }
  ];

  const voices = [
    { name: "Sarah", type: "Professional Female", accent: "American" },
    { name: "David", type: "Business Male", accent: "British" },
    { name: "Maria", type: "Warm Female", accent: "Spanish" },
    { name: "James", type: "Narrator Male", accent: "Australian" },
    { name: "Emma", type: "Young Female", accent: "Canadian" },
    { name: "Antonio", type: "Deep Male", accent: "Italian" },
  ];

  const useCases = [
    "Podcast Creation",
    "Audiobook Production",
    "Video Voiceovers",
    "Educational Content",
    "Marketing Materials",
    "Accessibility Features",
    "IVR Systems",
    "Language Learning"
  ];

  const steps = [
    {
      number: "01",
      title: "Input Your Text",
      description: "Paste or type up to 5,000 characters of text content"
    },
    {
      number: "02",
      title: "Choose Voice & Style",
      description: "Select from premium voices and adjust speech parameters"
    },
    {
      number: "03",
      title: "Preview Audio",
      description: "Listen to full-length preview with progressive playback"
    },
    {
      number: "04",
      title: "Download & Use",
      description: "Get high-quality audio file in your preferred format"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                <Volume2 className="h-4 w-4 mr-1" />
                Text to Speech AI
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Natural Voice Synthesis
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Transform written content into professional-quality audio with our advanced AI voices.
                Perfect for podcasts, audiobooks, voiceovers, and accessibility features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
                  Try Text to Speech
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  Listen to Samples
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="h-6 w-6 text-indigo-600" />
                    <span className="font-medium">Text Input</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg text-sm">
                    "Welcome to our podcast. Today we'll explore the fascinating world of artificial intelligence and its impact on creative industries..."
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Volume2 className="h-6 w-6 text-blue-600" />
                    <span className="font-medium">Audio Output</span>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 p-4 rounded-lg flex items-center space-x-4">
                    <Play className="h-8 w-8 text-indigo-600" />
                    <div className="flex-1">
                      <div className="flex space-x-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className={`w-1 bg-indigo-400 ${i < 12 ? 'h-6' : 'h-3'}`}></div>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-indigo-600">2:34</span>
                  </div>
                </div>
              </Card>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full blur-xl opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Text to Speech in 4 Simple Steps</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI analyzes your text for context, emotion, and pronunciation to deliver natural-sounding speech.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Premium Voice Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience broadcast-quality voice synthesis with advanced customization options.
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

      {/* Voices & Use Cases */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Available Voices */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Premium Voice Collection</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Choose from our curated selection of professional voices, each with unique characteristics and regional accents.
              </p>
              <div className="space-y-4">
                {voices.map((voice, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow border-0 bg-white dark:bg-slate-800">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{voice.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{voice.type}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{voice.accent}</Badge>
                          <div className="mt-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h3 className="text-3xl font-bold mb-6">Perfect for Every Project</h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                From professional podcasts to accessibility features, our TTS technology adapts to your specific needs.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {useCases.map((useCase, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{useCase}</span>
                  </div>
                ))}
              </div>
              <Card className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
                <div className="text-center">
                  <h4 className="text-xl font-semibold mb-2">Simple Pricing</h4>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">100 Credits</div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Per generation (up to 5,000 characters)</p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Full-length preview included • Progressive audio playback
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Transform Text into Professional Audio
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join content creators, educators, and businesses using our AI voices to bring their written content to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
              Generate Voice Now
              <Mic className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Explore Voice Library
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TextToSpeech;