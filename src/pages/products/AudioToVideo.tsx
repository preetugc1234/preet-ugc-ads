import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Headphones, Video, Upload, Radio, ArrowRight, CheckCircle, Clock, FileAudio, User } from "lucide-react";

const AudioToVideo = () => {
  const features = [
    {
      icon: <User className="h-8 w-8 text-primary" />,
      title: "AI Avatars",
      description: "Choose from 26 diverse AI avatars that speak your audio content"
    },
    {
      icon: <Video className="h-8 w-8 text-primary" />,
      title: "Veed Integration",
      description: "Powered by veed/avatars/audio-to-video via Fal AI platform"
    },
    {
      icon: <Radio className="h-8 w-8 text-primary" />,
      title: "Realistic Speech",
      description: "AI avatars with natural lip-sync and human-like expressions"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Reliable Processing",
      description: "~200 seconds processing time for 30 seconds of audio with buffer"
    }
  ];

  const avatars = [
    { name: "Emily (Vertical)", style: "Professional female avatar in vertical format" },
    { name: "Marcus (Vertical)", style: "Professional male avatar in vertical format" },
    { name: "Mira (Vertical)", style: "Elegant female avatar in vertical format" },
    { name: "Jasmine (Walking)", style: "Dynamic walking female avatar" },
    { name: "Elena (Horizontal)", style: "Sophisticated female avatar in horizontal format" },
    { name: "Generic Avatars", style: "Various gender and style options available" },
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Audio File",
      description: "Support for MP3, WAV, AAC, and other common audio formats"
    },
    {
      number: "02",
      title: "Select Avatar",
      description: "Choose from 26 diverse AI avatars with different styles and orientations"
    },
    {
      number: "03",
      title: "Process Video",
      description: "AI generates realistic lip-sync and natural avatar movements"
    },
    {
      number: "04",
      title: "Generate Video",
      description: "Create and download your audio-visual content in HD"
    }
  ];

  const useCases = [
    "Podcast Video Episodes",
    "Music Visualizations",
    "Audiobook Promotions",
    "Voice-over Presentations",
    "Educational Content",
    "Social Media Posts",
    "Radio Show Videos",
    "Meditation & Wellness"
  ];

  const specifications = [
    {
      category: "Audio Support",
      details: ["MP3, WAV, AAC, M4A", "Up to 5 minutes length", "Mono & Stereo", "Variable bitrates"]
    },
    {
      category: "Video Output",
      details: ["1080p HD Quality", "16:9, 9:16, 1:1 ratios", "MP4 format", "30 FPS smooth playback"]
    },
    {
      category: "Customization",
      details: ["Brand colors & logos", "Text overlays", "Animated elements", "Audio waveforms"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-slate-900 dark:via-violet-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200">
                <Headphones className="h-4 w-4 mr-1" />
                Audio to Video UGC
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Transform Audio into AI Avatar Videos
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Convert your podcasts, voiceovers, and audio content into engaging videos with
                realistic AI avatars that speak your content with natural lip-sync and expressions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
                  Upload Audio & Start
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  Browse Avatars
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileAudio className="h-6 w-6 text-violet-600" />
                    <span className="font-medium">Audio Input</span>
                    <Badge variant="secondary">MP3</Badge>
                  </div>
                  <div className="bg-violet-50 dark:bg-violet-900/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Headphones className="h-8 w-8 text-violet-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-2">my-podcast-episode.mp3</div>
                        <div className="flex space-x-1 h-6">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className={`w-1 bg-violet-400 ${Math.random() > 0.3 ? 'h-full' : 'h-2'} ${i < 15 ? 'opacity-100' : 'opacity-40'}`}></div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">12:34 / 25:41</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-violet-600" />
                  </div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Video className="h-6 w-6 text-fuchsia-600" />
                    <span className="font-medium">Video Output</span>
                    <Badge className="bg-green-500">HD</Badge>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-fuchsia-100 to-violet-100 dark:from-fuchsia-900 dark:to-violet-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-12 w-12 text-fuchsia-600 dark:text-fuchsia-300" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent flex items-end p-2">
                      <div className="flex space-x-1 flex-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className="w-1 bg-white/60" style={{ height: `${Math.random() * 20 + 5}px` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full blur-xl opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-full blur-xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Audio to Avatar Video in 4 Steps</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI system creates realistic avatar videos that speak your audio content with natural lip-sync and expressions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional AI Avatar Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transform any audio content into captivating avatar videos with our advanced AI technology.
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

      {/* Templates Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Diverse AI Avatar Collection</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from 26 unique AI avatars with different genders, styles, and orientations for your content.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avatars.map((avatar, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900 dark:to-fuchsia-900 rounded-lg mb-4 flex items-center justify-center">
                    <User className="h-8 w-8 text-violet-600 dark:text-violet-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{avatar.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{avatar.style}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases & Specifications */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Use Cases */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Perfect for Content Creators</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Whether you're a podcaster, musician, educator, or marketer, transform your audio into engaging video content.
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

            {/* Specifications */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Technical Specifications</h3>
              <div className="space-y-6">
                {specifications.map((spec, index) => (
                  <Card key={index} className="p-6 border-0 bg-white dark:bg-slate-800">
                    <CardContent className="p-0">
                      <h4 className="font-semibold mb-3 text-violet-600">{spec.category}</h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {spec.details.map((detail, i) => (
                          <div key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {detail}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Simple 30-Second Increment Pricing</h2>
          <Card className="p-8 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-slate-800 dark:to-slate-700 border-0 shadow-xl">
            <CardContent className="p-0">
              <div className="text-4xl font-bold text-violet-600 mb-2">100 Credits</div>
              <div className="text-lg text-gray-600 dark:text-gray-300 mb-6">Per 30 seconds of audio (rounded up)</div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-white/60 dark:bg-slate-700/60 rounded-lg">
                  <div className="font-semibold">45-second audio</div>
                  <div className="text-violet-600">200 credits</div>
                </div>
                <div className="p-3 bg-white/60 dark:bg-slate-700/60 rounded-lg">
                  <div className="font-semibold">2-minute audio</div>
                  <div className="text-violet-600">400 credits</div>
                </div>
                <div className="p-3 bg-white/60 dark:bg-slate-700/60 rounded-lg">
                  <div className="font-semibold">5-minute audio</div>
                  <div className="text-violet-600">1,000 credits</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Processing time: ~200 seconds for 30 seconds of audio with 4-minute buffer for reliability.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-violet-600 to-fuchsia-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Turn Your Audio into AI Avatar Videos
          </h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Join thousands of content creators who are maximizing their reach by transforming audio into engaging AI avatar videos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-violet-600 hover:bg-violet-50">
              Upload Audio & Create
              <Upload className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Explore Avatars
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AudioToVideo;