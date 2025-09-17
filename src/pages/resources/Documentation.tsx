import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Book, Search, ArrowRight, FileText, Video, Code, Lightbulb, CheckCircle, Clock } from "lucide-react";

const Documentation = () => {
  const quickStart = [
    {
      step: "1",
      title: "Create Account",
      description: "Sign up with Google or email to get started",
      time: "1 min"
    },
    {
      step: "2",
      title: "Choose Your Tool",
      description: "Select from 6 AI-powered creative tools",
      time: "30 sec"
    },
    {
      step: "3",
      title: "Generate Content",
      description: "Create your first AI-generated content",
      time: "2-5 min"
    },
    {
      step: "4",
      title: "Download & Use",
      description: "Export and use your creations anywhere",
      time: "Instant"
    }
  ];

  const sections = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Getting Started",
      description: "Account setup, first steps, and basic concepts",
      articles: 12,
      category: "beginner"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "API Reference",
      description: "Complete API documentation for developers",
      articles: 8,
      category: "developer"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Video Guides",
      description: "Step-by-step video tutorials for each tool",
      articles: 24,
      category: "tutorial"
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Best Practices",
      description: "Tips and tricks for optimal results",
      articles: 16,
      category: "advanced"
    }
  ];

  const popularGuides = [
    {
      title: "Writing Effective Prompts for Image Generation",
      category: "Image Generation",
      readTime: "5 min",
      difficulty: "Beginner"
    },
    {
      title: "Understanding Credit System & Pricing",
      category: "Billing",
      readTime: "3 min",
      difficulty: "Beginner"
    },
    {
      title: "Optimizing Audio Quality for TTS",
      category: "Text to Speech",
      readTime: "7 min",
      difficulty: "Intermediate"
    },
    {
      title: "Advanced Image-to-Video Techniques",
      category: "Video Generation",
      readTime: "10 min",
      difficulty: "Advanced"
    },
    {
      title: "Batch Processing & Automation",
      category: "API",
      readTime: "12 min",
      difficulty: "Advanced"
    }
  ];

  const features = [
    {
      icon: <Book className="h-8 w-8 text-primary" />,
      title: "Comprehensive Guides",
      description: "In-depth documentation covering every feature and use case"
    },
    {
      icon: <Video className="h-8 w-8 text-primary" />,
      title: "Video Tutorials",
      description: "Visual walkthroughs and step-by-step video guides"
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "API Documentation",
      description: "Complete technical reference for developers and integrators"
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: "Best Practices",
      description: "Expert tips and proven strategies for optimal results"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Book className="h-4 w-4 mr-1" />
              Documentation Hub
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Complete Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Everything you need to master our AI tools. From beginner guides to advanced techniques,
              find answers to all your questions in our comprehensive documentation.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search documentation, guides, and tutorials..."
                className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Start Guide</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get up and running in under 5 minutes with our streamlined onboarding process.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickStart.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all border-0 bg-white dark:bg-slate-800 relative">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{step.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {step.time}
                  </Badge>
                </CardContent>
                {index < quickStart.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 hidden lg:block" />
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Documentation</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Organized by skill level and topic for easy navigation and learning.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sections.map((section, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800 group cursor-pointer">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      {section.icon}
                    </div>
                    <Badge variant="secondary">{section.articles} articles</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{section.description}</p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    <span className="text-sm font-medium">Explore Section</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Popular Guides</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Most helpful articles based on community engagement and feedback.
              </p>
              <div className="space-y-4">
                {popularGuides.map((guide, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow border-0 bg-white dark:bg-slate-800 cursor-pointer group">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {guide.title}
                        </h4>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <Badge variant="outline" className="text-xs">{guide.category}</Badge>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {guide.readTime}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          guide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {guide.difficulty}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6">Documentation Features</h3>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-0">
                <CardContent className="p-0">
                  <h4 className="text-lg font-semibold mb-4">Need Help?</h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>24/7 documentation access</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Regular updates and new guides</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Community-driven improvements</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Dive into our comprehensive documentation and unlock the full potential of our AI tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
              Browse All Guides
              <Book className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Watch Video Tutorials
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Documentation;