import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Brain, Zap, Shield, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

const Chat = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "Advanced AI Models",
      description: "Powered by GPT-4o-mini for intelligent, context-aware conversations"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Real-time Streaming",
      description: "See responses appear instantly with token-by-token streaming"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure & Private",
      description: "Your conversations are encrypted and never stored permanently"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Smart Context",
      description: "Maintains conversation context for natural, flowing dialogue"
    }
  ];

  const useCases = [
    "Content Creation & Copywriting",
    "Code Review & Programming Help",
    "Research & Analysis",
    "Creative Writing & Storytelling",
    "Business Strategy & Planning",
    "Educational Tutoring",
    "Brainstorming & Ideation",
    "Email & Document Drafting"
  ];

  const benefits = [
    {
      title: "Free to Use",
      description: "0 credits charged - counts toward daily free quota",
      highlight: true
    },
    {
      title: "Instant Response",
      description: "Near-instant responses with streaming technology"
    },
    {
      title: "Export Options",
      description: "Copy conversations or download as DOCX files"
    },
    {
      title: "30-Day History",
      description: "Access your last 30 conversations anytime"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <MessageSquare className="h-4 w-4 mr-1" />
                AI Chat Assistant
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Intelligent AI Chat
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Experience natural conversations with our advanced AI assistant. Get instant help with writing,
                coding, research, and creative projects - all powered by cutting-edge language models.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Start Chatting Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg">
                  View Examples
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="p-6 shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">You</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Help me write a marketing email for a new product launch</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Assistant</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">I'd be happy to help you craft a compelling marketing email! Let me create a structure with an attention-grabbing subject line, engaging opening, clear value proposition...</p>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-xl opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful AI Chat Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of AI conversation with advanced features designed for productivity and creativity.
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

      {/* Use Cases Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Perfect for Every Use Case</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                From creative writing to technical analysis, our AI chat assistant adapts to your specific needs and expertise level.
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
            <Card className="p-8 shadow-2xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
              <h3 className="text-2xl font-bold mb-6 text-center">Why Choose Our AI Chat?</h3>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className={`p-4 rounded-lg ${benefit.highlight ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-white/60 dark:bg-slate-700/60'}`}>
                    <h4 className="font-semibold mb-2 flex items-center">
                      {benefit.title}
                      {benefit.highlight && <Badge className="ml-2 bg-green-500">FREE</Badge>}
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
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your AI Conversation?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already boosting their productivity with intelligent AI chat assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
              Try Chat Now - Free
              <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              View Pricing Plans
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Chat;