import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, BookOpen, Clock, Star, Search, Filter, ArrowRight, CheckCircle, Users, Video } from "lucide-react";

const Tutorials = () => {
  const categories = [
    { name: "Getting Started", count: 12, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    { name: "Image Generation", count: 18, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
    { name: "Video Creation", count: 24, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    { name: "Audio & Voice", count: 16, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
    { name: "API Integration", count: 10, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
    { name: "Best Practices", count: 14, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" }
  ];

  const featuredTutorials = [
    {
      title: "Complete Beginner's Guide to AI Image Generation",
      description: "Learn the fundamentals of creating stunning images with AI, from basic prompts to advanced techniques.",
      instructor: "Sarah Chen",
      duration: "45 min",
      level: "Beginner",
      rating: 4.9,
      students: 12500,
      thumbnail: "beginner-guide",
      category: "Getting Started"
    },
    {
      title: "Creating Professional Marketing Videos",
      description: "Master the art of turning static images into compelling marketing videos for social media and ads.",
      instructor: "Mike Rodriguez",
      duration: "38 min",
      level: "Intermediate",
      rating: 4.8,
      students: 8300,
      thumbnail: "marketing-videos",
      category: "Video Creation"
    },
    {
      title: "Advanced Prompt Engineering Techniques",
      description: "Unlock the full potential of AI with sophisticated prompting strategies and insider tips.",
      instructor: "Dr. Emily Watson",
      duration: "52 min",
      level: "Advanced",
      rating: 4.9,
      students: 5600,
      thumbnail: "prompt-engineering",
      category: "Best Practices"
    }
  ];

  const tutorialSeries = [
    {
      title: "AI Content Creator Bootcamp",
      description: "Complete 8-part series covering all aspects of AI content creation",
      episodes: 8,
      totalDuration: "4h 30m",
      level: "Beginner to Intermediate",
      category: "Series"
    },
    {
      title: "Business Automation with AI",
      description: "Learn how to automate your business processes with our AI tools",
      episodes: 6,
      totalDuration: "3h 15m",
      level: "Intermediate",
      category: "Business"
    },
    {
      title: "API Developer Workshop",
      description: "Hands-on coding workshop for integrating our API into applications",
      episodes: 5,
      totalDuration: "2h 45m",
      level: "Advanced",
      category: "Technical"
    }
  ];

  const popularTutorials = [
    {
      title: "Writing Perfect Image Prompts",
      duration: "12 min",
      views: "45K",
      rating: 4.8
    },
    {
      title: "Text-to-Speech Voice Selection",
      duration: "8 min",
      views: "32K",
      rating: 4.7
    },
    {
      title: "Optimizing Video Generation Quality",
      duration: "15 min",
      views: "28K",
      rating: 4.9
    },
    {
      title: "Understanding Credit Usage",
      duration: "6 min",
      views: "51K",
      rating: 4.6
    },
    {
      title: "Batch Processing Techniques",
      duration: "18 min",
      views: "19K",
      rating: 4.8
    }
  ];

  const features = [
    {
      icon: <Video className="h-8 w-8 text-primary" />,
      title: "HD Video Tutorials",
      description: "Professional quality video lessons with clear explanations"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Expert Instructors",
      description: "Learn from AI specialists and industry professionals"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Step-by-Step Guides",
      description: "Detailed written guides to complement video content"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Practical Examples",
      description: "Real-world projects and use cases you can apply immediately"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 dark:from-slate-900 dark:via-green-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Play className="h-4 w-4 mr-1" />
              Video Tutorials
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Learn with Video Tutorials
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Master our AI tools with comprehensive video tutorials, step-by-step guides, and hands-on projects.
              From beginner basics to advanced techniques, we've got you covered.
            </p>

            {/* Search & Filter */}
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search tutorials, topics, or instructors..."
                  className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-green-500 dark:focus:border-green-400"
                />
              </div>
              <Button variant="outline" size="lg" className="px-6">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Find tutorials organized by topic and skill level.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all border-0 bg-white dark:bg-slate-800 cursor-pointer group">
                <CardContent className="p-0">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {category.name}
                    </h3>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={category.color}>
                      {category.count} tutorials
                    </Badge>
                    <Play className="h-4 w-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Tutorials</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our most popular and comprehensive tutorials, perfect for getting started.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {featuredTutorials.map((tutorial, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow border-0 bg-white dark:bg-slate-800 group">
                <div className="aspect-video bg-gradient-to-br from-green-200 to-blue-200 dark:from-green-800 dark:to-blue-800 relative flex items-center justify-center">
                  <Play className="h-16 w-16 text-white bg-black/50 rounded-full p-4 group-hover:scale-110 transition-transform cursor-pointer" />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-black/70 text-white">
                      <Clock className="h-3 w-3 mr-1" />
                      {tutorial.duration}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {tutorial.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                    {tutorial.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>by {tutorial.instructor}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {tutorial.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {tutorial.rating}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {tutorial.students.toLocaleString()}
                      </div>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Watch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorial Series */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tutorial Series</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive multi-part series for deep learning and skill development.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {tutorialSeries.map((series, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="mb-4">
                    <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                      SERIES
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{series.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                    {series.description}
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Episodes:</span>
                      <span className="font-medium">{series.episodes}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Duration:</span>
                      <span className="font-medium">{series.totalDuration}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Level:</span>
                      <Badge variant="outline" className="text-xs">{series.level}</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-green-600 hover:bg-green-700">
                    Start Series
                    <Play className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tutorials & Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Popular Tutorials */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Most Watched</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Quick tutorials that our community loves most.
              </p>
              <div className="space-y-4">
                {popularTutorials.map((tutorial, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow border-0 bg-white dark:bg-slate-800 cursor-pointer group">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-blue-200 dark:from-green-800 dark:to-blue-800 rounded-lg flex items-center justify-center">
                            <Play className="h-5 w-5 text-green-600 dark:text-green-300" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {tutorial.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {tutorial.duration}
                            </span>
                            <span>{tutorial.views} views</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 mr-1" />
                              {tutorial.rating}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Why Choose Our Tutorials?</h3>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-0">
                <CardContent className="p-0">
                  <h4 className="text-lg font-semibold mb-4">Learning Benefits</h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Learn at your own pace</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Community support</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Regular updates</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-green-600 hover:bg-green-700">
                    Start Learning Today
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Master AI Tools?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Start your learning journey today with our comprehensive video tutorials and hands-on guides.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
              Browse All Tutorials
              <BookOpen className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Join Free Course
              <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tutorials;