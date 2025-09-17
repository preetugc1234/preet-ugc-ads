import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageSquare, Trophy, Calendar, ArrowRight, Heart, Share2, BookOpen, Zap, Star, CheckCircle } from "lucide-react";

const Community = () => {
  const stats = [
    { label: "Active Members", value: "25,000+", icon: <Users className="h-6 w-6" /> },
    { label: "Daily Discussions", value: "500+", icon: <MessageSquare className="h-6 w-6" /> },
    { label: "Shared Creations", value: "12,000+", icon: <Share2 className="h-6 w-6" /> },
    { label: "Expert Contributors", value: "150+", icon: <Trophy className="h-6 w-6" /> }
  ];

  const communityHighlights = [
    {
      type: "Discussion",
      title: "Best Prompting Techniques for Realistic Portraits",
      author: "Alex Chen",
      replies: 127,
      likes: 489,
      timeAgo: "2 hours ago",
      category: "Image Generation",
      featured: true
    },
    {
      type: "Showcase",
      title: "My AI-Generated Marketing Campaign Results",
      author: "Marketing Pro",
      replies: 45,
      likes: 234,
      timeAgo: "5 hours ago",
      category: "Business Use Cases",
      featured: false
    },
    {
      type: "Tutorial",
      title: "Step-by-Step: Creating Animated Logos",
      author: "Design Guru",
      replies: 89,
      likes: 567,
      timeAgo: "1 day ago",
      category: "Video Creation",
      featured: true
    },
    {
      type: "Q&A",
      title: "How to optimize credit usage for large projects?",
      author: "Budget Conscious",
      replies: 23,
      likes: 156,
      timeAgo: "3 hours ago",
      category: "Tips & Tricks",
      featured: false
    }
  ];

  const events = [
    {
      title: "AI Art Challenge: Nature Landscapes",
      date: "Dec 15, 2024",
      time: "2:00 PM PST",
      participants: 1200,
      type: "Contest",
      prize: "$500 Credits"
    },
    {
      title: "Live Q&A with Product Team",
      date: "Dec 18, 2024",
      time: "11:00 AM PST",
      participants: 850,
      type: "Live Session",
      prize: null
    },
    {
      title: "Community Showcase & Feedback",
      date: "Dec 22, 2024",
      time: "3:00 PM PST",
      participants: 650,
      type: "Showcase",
      prize: "Feature Spotlight"
    }
  ];

  const featuredMembers = [
    {
      name: "Sarah Mitchell",
      role: "AI Artist",
      contributions: 89,
      badge: "Top Contributor",
      avatar: "/api/placeholder/40/40",
      specialty: "Digital Art"
    },
    {
      name: "David Park",
      role: "Developer",
      contributions: 67,
      badge: "Code Wizard",
      avatar: "/api/placeholder/40/40",
      specialty: "API Integration"
    },
    {
      name: "Emma Rodriguez",
      role: "Content Creator",
      contributions: 154,
      badge: "Community Leader",
      avatar: "/api/placeholder/40/40",
      specialty: "Video Production"
    }
  ];

  const communityBenefits = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Connect & Collaborate",
      description: "Network with creators, developers, and businesses using AI tools"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Learn Together",
      description: "Share knowledge, tips, and techniques with fellow community members"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Get Inspired",
      description: "Discover amazing creations and find inspiration for your next project"
    },
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: "Win Rewards",
      description: "Participate in contests and challenges to win credits and recognition"
    }
  ];

  const guidelines = [
    "Be respectful and constructive in all interactions",
    "Share your creations and help others improve",
    "Search before posting to avoid duplicates",
    "Use clear, descriptive titles for your posts",
    "Credit original sources when sharing content",
    "Report inappropriate content to moderators"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-slate-900 dark:via-orange-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <Users className="h-4 w-4 mr-1" />
              Join Our Community
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Connect with AI Creators
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of creators, developers, and innovators sharing knowledge,
              showcasing amazing work, and pushing the boundaries of AI creativity together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                Join Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Browse Discussions
                <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center border-0 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="mb-4 flex justify-center text-orange-600">{stat.icon}</div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Highlights</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See what's trending in our community. Join the conversation and share your own insights.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {communityHighlights.map((post, index) => (
              <Card key={index} className={`p-6 hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800 ${post.featured ? 'ring-2 ring-orange-200 dark:ring-orange-800' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant={post.featured ? 'default' : 'secondary'} className={post.featured ? 'bg-orange-500' : ''}>
                        {post.type}
                      </Badge>
                      {post.featured && <Star className="h-4 w-4 text-orange-500" />}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{post.timeAgo}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{post.author}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{post.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {post.replies}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Members & Events */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Featured Members */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Featured Members</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Meet some of our most active and helpful community contributors.
              </p>
              <div className="space-y-6">
                {featuredMembers.map((member, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow border-0 bg-white dark:bg-slate-800">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold">{member.name}</h4>
                            <Badge className="bg-orange-500 text-xs">{member.badge}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{member.role} • {member.specialty}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {member.contributions} contributions
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Follow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <h3 className="text-3xl font-bold mb-6">Upcoming Events</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Join our community events, challenges, and live sessions.
              </p>
              <div className="space-y-6">
                {events.map((event, index) => (
                  <Card key={index} className="p-6 border-0 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className={
                          event.type === 'Contest' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          event.type === 'Live Session' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }>
                          {event.type}
                        </Badge>
                        {event.prize && (
                          <Badge variant="outline" className="text-xs">
                            Prize: {event.prize}
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold mb-3">{event.title}</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {event.date} at {event.time}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {event.participants} interested
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                        Join Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Benefits */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join Our Community?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Be part of a vibrant ecosystem of creators, learners, and innovators.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {communityBenefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="mb-4 flex justify-center">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Community Guidelines</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Help us maintain a positive and productive environment for everyone.
            </p>
          </div>
          <Card className="p-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-800 dark:to-slate-700 border-0">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-6">
                {guidelines.map((guideline, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{guideline}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Remember:</strong> Our community thrives on mutual respect, creativity, and collaboration.
                  Together, we can achieve amazing things with AI technology.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Connect with like-minded creators, learn new techniques, and showcase your amazing AI-generated content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
              Create Account & Join
              <Users className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Browse Community
              <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Community;