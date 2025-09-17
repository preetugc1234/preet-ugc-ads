import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, Phone, MapPin, Clock, MessageSquare, ArrowRight, CheckCircle, Users, Briefcase, Zap } from "lucide-react";

const Contact = () => {
  const contactMethods = [
    {
      icon: <Mail className="h-8 w-8 text-primary" />,
      title: "Email Us",
      description: "Get detailed responses to your questions",
      contact: "hello@admax.ai",
      responseTime: "Within 4 hours",
      action: "Send Email"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Live Chat",
      description: "Instant help from our support team",
      contact: "Available 24/7",
      responseTime: "< 2 minutes",
      action: "Start Chat"
    },
    {
      icon: <Phone className="h-8 w-8 text-primary" />,
      title: "Call Us",
      description: "Speak directly with our experts",
      contact: "+1 (555) 123-4567",
      responseTime: "Mon-Fri, 9AM-6PM PST",
      action: "Call Now"
    }
  ];

  const offices = [
    {
      location: "San Francisco, CA",
      address: "123 Tech Street, Suite 100\nSan Francisco, CA 94105",
      timezone: "PST (UTC-8)",
      type: "Headquarters"
    },
    {
      location: "Mumbai, India",
      address: "456 Innovation Hub, Floor 15\nBandra East, Mumbai 400051",
      timezone: "IST (UTC+5:30)",
      type: "Development Center"
    },
    {
      location: "London, UK",
      address: "789 AI District, Level 8\nShoreditch, London E1 6AN",
      timezone: "GMT (UTC+0)",
      type: "European Office"
    }
  ];

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Head of Sales",
      email: "sarah@admax.ai",
      specialty: "Enterprise Solutions"
    },
    {
      name: "David Chen",
      role: "Technical Support Lead",
      email: "david@admax.ai",
      specialty: "API & Integrations"
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Success Manager",
      email: "emily@admax.ai",
      specialty: "User Onboarding"
    }
  ];

  const faqs = [
    {
      question: "How quickly will I hear back?",
      answer: "We respond to all inquiries within 4 hours during business hours, often much sooner."
    },
    {
      question: "Can I schedule a demo?",
      answer: "Absolutely! Select 'Product Demo' as your inquiry type and we'll set up a personalized walkthrough."
    },
    {
      question: "Do you offer custom enterprise solutions?",
      answer: "Yes, we provide custom integrations, white-label solutions, and dedicated support for enterprise clients."
    },
    {
      question: "Is there a phone number for urgent issues?",
      answer: "Yes, Pro and Enterprise customers have access to priority phone support for urgent technical issues."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-teal-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              <MessageSquare className="h-4 w-4 mr-1" />
              Let's Connect
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Have questions about our AI tools? Need help with integration? Looking for custom solutions?
              We're here to help you succeed. Reach out and let's discuss how we can support your goals.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="mb-4 flex justify-center">{method.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{method.description}</p>
                  <div className="text-sm font-medium mb-2">{method.contact}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">{method.responseTime}</div>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Send Us a Message</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Fill out our detailed form and we'll get back to you with personalized assistance.
            </p>
          </div>

          <Card className="p-8 border-0 bg-white dark:bg-slate-800 shadow-xl">
            <CardContent className="p-0">
              <form className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold border-b pb-2">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" placeholder="Your first name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" placeholder="Your last name" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="your.email@company.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                </div>

                {/* Customization Question 1: Company & Role */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold border-b pb-2">About Your Organization</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company/Organization Name</Label>
                      <Input id="company" placeholder="Your company name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Your Role/Job Title</Label>
                      <Input id="jobTitle" placeholder="e.g., Marketing Manager, Developer, CEO" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo entrepreneur/Freelancer</SelectItem>
                        <SelectItem value="startup">Startup (2-10 employees)</SelectItem>
                        <SelectItem value="small">Small business (11-50 employees)</SelectItem>
                        <SelectItem value="medium">Medium business (51-200 employees)</SelectItem>
                        <SelectItem value="large">Large company (201-1000 employees)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Customization Question 2: Use Case & Goals */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold border-b pb-2">Your Use Case & Goals</h3>
                  <div className="space-y-2">
                    <Label>Which AI tools are you most interested in? (Select all that apply)</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        "AI Chat & Text Generation",
                        "Image Generation",
                        "Image to Video (No Audio)",
                        "Text to Speech",
                        "Image to Video with Audio",
                        "Audio to Video (UGC)"
                      ].map((tool, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox id={`tool-${index}`} />
                          <Label htmlFor={`tool-${index}`} className="text-sm">{tool}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryUseCase">What's your primary use case?</Label>
                    <Textarea
                      id="primaryUseCase"
                      placeholder="e.g., Creating marketing content for social media, developing educational materials, automating content production..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Customization Question 3: Volume & Budget */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold border-b pb-2">Usage Requirements</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Expected monthly generation volume</Label>
                      <RadioGroup>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="volume-low" />
                          <Label htmlFor="volume-low">Low (0-100 generations/month)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="volume-medium" />
                          <Label htmlFor="volume-medium">Medium (100-1000 generations/month)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="volume-high" />
                          <Label htmlFor="volume-high">High (1000-10000 generations/month)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="enterprise" id="volume-enterprise" />
                          <Label htmlFor="volume-enterprise">Enterprise (10000+ generations/month)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>Budget range (monthly)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free tier only</SelectItem>
                          <SelectItem value="under-100">Under $100/month</SelectItem>
                          <SelectItem value="100-500">$100 - $500/month</SelectItem>
                          <SelectItem value="500-1000">$500 - $1,000/month</SelectItem>
                          <SelectItem value="1000-5000">$1,000 - $5,000/month</SelectItem>
                          <SelectItem value="5000-plus">$5,000+/month</SelectItem>
                          <SelectItem value="enterprise">Enterprise pricing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Customization Question 4: Technical Requirements */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold border-b pb-2">Technical Requirements</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Do you need API integration?</Label>
                      <RadioGroup>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no-api" id="no-api" />
                          <Label htmlFor="no-api">No, I'll use the web interface only</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="basic-api" id="basic-api" />
                          <Label htmlFor="basic-api">Yes, basic API integration</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="advanced-api" id="advanced-api" />
                          <Label htmlFor="advanced-api">Yes, advanced API with webhooks</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom-integration" id="custom-integration" />
                          <Label htmlFor="custom-integration">Custom integration/white-label solution</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="techStack">What's your current tech stack? (if applicable)</Label>
                      <Input id="techStack" placeholder="e.g., React, Python, WordPress, Shopify..." />
                    </div>
                  </div>
                </div>

                {/* Customization Question 5: Timeline & Support */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold border-b pb-2">Timeline & Support Needs</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>When do you need to get started?</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediately">Immediately</SelectItem>
                          <SelectItem value="within-week">Within a week</SelectItem>
                          <SelectItem value="within-month">Within a month</SelectItem>
                          <SelectItem value="within-quarter">Within this quarter</SelectItem>
                          <SelectItem value="exploring">Just exploring options</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>What type of support do you anticipate needing?</Label>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          "Getting started guidance",
                          "Technical integration help",
                          "Custom training/onboarding",
                          "Dedicated account manager",
                          "Priority support",
                          "Custom feature development"
                        ].map((support, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Checkbox id={`support-${index}`} />
                            <Label htmlFor={`support-${index}`} className="text-sm">{support}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inquiry Type & Message */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold border-b pb-2">Your Inquiry</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>What type of inquiry is this?</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales inquiry</SelectItem>
                          <SelectItem value="demo">Product demo request</SelectItem>
                          <SelectItem value="technical">Technical question</SelectItem>
                          <SelectItem value="partnership">Partnership opportunity</SelectItem>
                          <SelectItem value="enterprise">Enterprise solution</SelectItem>
                          <SelectItem value="support">General support</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Your Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide details about your inquiry, specific questions, or anything else you'd like us to know..."
                        className="min-h-[150px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="newsletter" />
                    <Label htmlFor="newsletter" className="text-sm">
                      Subscribe to our newsletter for product updates and AI tips
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="marketing" />
                    <Label htmlFor="marketing" className="text-sm">
                      I'd like to receive information about special offers and new features
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the Terms of Service and Privacy Policy *
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 py-6 text-lg">
                  Send Message
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  We typically respond within 4 hours during business hours.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team & Offices */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Team */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Meet Our Team</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Connect directly with our specialists for personalized assistance.
              </p>
              <div className="space-y-6">
                {teamMembers.map((member, index) => (
                  <Card key={index} className="p-6 border-0 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{member.role}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.specialty}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Offices */}
            <div>
              <h3 className="text-3xl font-bold mb-6">Our Locations</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                We're a global team with offices around the world.
              </p>
              <div className="space-y-6">
                {offices.map((office, index) => (
                  <Card key={index} className="p-6 border-0 bg-white dark:bg-slate-800">
                    <CardContent className="p-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{office.location}</h4>
                          <Badge variant="secondary" className="text-xs mt-1">{office.type}</Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          {office.timezone}
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                        <address className="text-sm text-gray-600 dark:text-gray-300 not-italic">
                          {office.address.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </address>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Quick answers to common questions about contacting us.
            </p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <h4 className="font-semibold mb-3 flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 ml-7">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Content Creation?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Don't wait – reach out today and discover how our AI tools can revolutionize your creative workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-teal-600 hover:bg-teal-50">
              Start Free Trial
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule Demo
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;