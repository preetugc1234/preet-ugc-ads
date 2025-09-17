import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeadphonesIcon, MessageSquare, Mail, Phone, Search, Clock, CheckCircle, AlertCircle, ArrowRight, HelpCircle, FileText, Zap } from "lucide-react";

const Support = () => {
  const supportChannels = [
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "24/7",
      responseTime: "< 2 minutes",
      action: "Start Chat"
    },
    {
      icon: <Mail className="h-8 w-8 text-primary" />,
      title: "Email Support",
      description: "Send us detailed questions and get comprehensive answers",
      availability: "24/7",
      responseTime: "< 4 hours",
      action: "Send Email"
    },
    {
      icon: <Phone className="h-8 w-8 text-primary" />,
      title: "Phone Support",
      description: "Talk directly with our technical experts",
      availability: "Mon-Fri, 9AM-6PM PST",
      responseTime: "Immediate",
      action: "Call Now"
    },
    {
      icon: <HelpCircle className="h-8 w-8 text-primary" />,
      title: "Help Center",
      description: "Browse our comprehensive knowledge base",
      availability: "Always",
      responseTime: "Self-service",
      action: "Browse Articles"
    }
  ];

  const faqCategories = [
    {
      title: "Getting Started",
      icon: <Zap className="h-5 w-5" />,
      questions: [
        "How do I create my first AI generation?",
        "What are credits and how do they work?",
        "How to set up my account and profile?",
        "What file formats are supported?"
      ]
    },
    {
      title: "Billing & Credits",
      icon: <FileText className="h-5 w-5" />,
      questions: [
        "How does the credit system work?",
        "Can I get a refund for unused credits?",
        "How to upgrade or downgrade my plan?",
        "What payment methods do you accept?"
      ]
    },
    {
      title: "Technical Issues",
      icon: <AlertCircle className="h-5 w-5" />,
      questions: [
        "Why is my generation taking so long?",
        "Upload failed - what should I do?",
        "How to troubleshoot poor quality results?",
        "API integration problems"
      ]
    },
    {
      title: "Account & Security",
      icon: <CheckCircle className="h-5 w-5" />,
      questions: [
        "How to reset my password?",
        "Can I change my email address?",
        "How to delete my account?",
        "Two-factor authentication setup"
      ]
    }
  ];

  const popularArticles = [
    {
      title: "Complete Guide to Writing Effective AI Prompts",
      category: "Best Practices",
      readTime: "8 min",
      helpful: 1247
    },
    {
      title: "Understanding Credit Usage and Optimization",
      category: "Billing",
      readTime: "5 min",
      helpful: 892
    },
    {
      title: "Troubleshooting Common Generation Issues",
      category: "Technical",
      readTime: "12 min",
      helpful: 756
    },
    {
      title: "API Rate Limits and Best Practices",
      category: "Developers",
      readTime: "6 min",
      helpful: 634
    },
    {
      title: "Account Security and Privacy Settings",
      category: "Security",
      readTime: "4 min",
      helpful: 543
    }
  ];

  const supportStats = [
    { label: "Average Response Time", value: "< 2 hours", icon: <Clock className="h-6 w-6" /> },
    { label: "Customer Satisfaction", value: "98.5%", icon: <CheckCircle className="h-6 w-6" /> },
    { label: "Issues Resolved", value: "99.2%", icon: <CheckCircle className="h-6 w-6" /> },
    { label: "Support Articles", value: "500+", icon: <FileText className="h-6 w-6" /> }
  ];

  const statusUpdates = [
    {
      service: "Image Generation API",
      status: "Operational",
      statusColor: "bg-green-500",
      lastUpdate: "2 minutes ago"
    },
    {
      service: "Video Generation",
      status: "Operational",
      statusColor: "bg-green-500",
      lastUpdate: "5 minutes ago"
    },
    {
      service: "Text-to-Speech",
      status: "Operational",
      statusColor: "bg-green-500",
      lastUpdate: "1 minute ago"
    },
    {
      service: "Payment Processing",
      status: "Operational",
      statusColor: "bg-green-500",
      lastUpdate: "3 minutes ago"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-cyan-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
              <HeadphonesIcon className="h-4 w-4 mr-1" />
              24/7 Support Available
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              How Can We Help?
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Get the support you need, when you need it. Our dedicated team is here to help you
              succeed with our AI tools, whether you're a beginner or an expert.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search help articles, FAQs, or describe your issue..."
                className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-cyan-500 dark:focus:border-cyan-400"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700">
                Search
              </Button>
            </div>
          </div>

          {/* Support Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportStats.map((stat, index) => (
              <Card key={index} className="p-6 text-center border-0 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="mb-4 flex justify-center text-cyan-600">{stat.icon}</div>
                  <div className="text-2xl font-bold mb-2">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Support Your Way</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the support channel that works best for you. We're here to help through multiple channels.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800 group">
                <CardContent className="p-0">
                  <div className="mb-4 flex justify-center">{channel.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{channel.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                    {channel.description}
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Available:</strong> {channel.availability}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Response:</strong> {channel.responseTime}
                    </div>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 group-hover:shadow-md transition-all">
                    {channel.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Find quick answers to the most common questions from our users.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {faqCategories.map((category, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{category.title}</h3>
                  </div>
                  <div className="space-y-3">
                    {category.questions.map((question, qIndex) => (
                      <div key={qIndex} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group">
                        <span className="text-sm">{question}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles & System Status */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Popular Articles */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Popular Help Articles</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Our most helpful articles based on community feedback and usage.
              </p>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow border-0 bg-white dark:bg-slate-800 cursor-pointer group">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {article.title}
                        </h4>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <Badge variant="outline" className="text-xs">{article.category}</Badge>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.readTime}
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {article.helpful} helpful
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* System Status & Contact Form */}
            <div className="space-y-8">
              {/* System Status */}
              <div>
                <h3 className="text-2xl font-bold mb-6">System Status</h3>
                <Card className="p-6 border-0 bg-white dark:bg-slate-800">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-semibold text-green-600 dark:text-green-400">All Systems Operational</span>
                    </div>
                    <div className="space-y-3">
                      {statusUpdates.map((service, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 ${service.statusColor} rounded-full`}></div>
                            <span className="text-sm font-medium">{service.service}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-green-600 dark:text-green-400">{service.status}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{service.lastUpdate}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      View Detailed Status
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Contact Form */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Quick Contact</h3>
                <Card className="p-6 border-0 bg-white dark:bg-slate-800">
                  <CardContent className="p-0">
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="First Name" />
                        <Input placeholder="Last Name" />
                      </div>
                      <Input type="email" placeholder="Email Address" />
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Issue Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="account">Account Problem</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="Describe your issue or question..."
                        className="min-h-[100px]"
                      />
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                        Send Message
                      </Button>
                    </form>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                      We typically respond within 4 hours during business hours.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            Our support team is standing by to help you succeed. Don't hesitate to reach out with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-cyan-600 hover:bg-cyan-50">
              Start Live Chat
              <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Browse Help Center
              <HelpCircle className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Support;