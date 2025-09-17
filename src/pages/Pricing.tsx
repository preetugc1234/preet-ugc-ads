import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Check, Star, Zap, Crown, ArrowRight, Calculator, Clock, Shield, HeadphonesIcon } from "lucide-react";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      description: "Perfect for exploring our AI tools",
      monthlyPrice: 0,
      annualPrice: 0,
      credits: "500 credits/month",
      dailyLimits: "5 text + 2 images daily",
      icon: <Zap className="h-6 w-6" />,
      color: "border-gray-200 dark:border-gray-700",
      buttonColor: "bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",
      popular: false,
      features: [
        "Access to all 6 AI tools",
        "500 free credits monthly",
        "Daily free allowances",
        "30-item history storage",
        "Community support",
        "Basic tutorials access",
        "Standard processing speed"
      ]
    },
    {
      name: "Pro",
      description: "Ideal for creators and small businesses",
      monthlyPrice: 19,
      annualPrice: 190,
      credits: "2,000-60,000 credits",
      dailyLimits: "Unlimited generations",
      icon: <Star className="h-6 w-6" />,
      color: "border-blue-200 dark:border-blue-700 ring-2 ring-blue-500",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      popular: true,
      features: [
        "Everything in Free",
        "Choose credit packages (2K-60K)",
        "No daily generation limits",
        "Priority processing speed",
        "Advanced tutorials access",
        "Email support",
        "Custom export options",
        "API access included",
        "Commercial usage rights"
      ]
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      monthlyPrice: null,
      annualPrice: null,
      credits: "Custom credit allocation",
      dailyLimits: "Unlimited everything",
      icon: <Crown className="h-6 w-6" />,
      color: "border-purple-200 dark:border-purple-700",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      popular: false,
      features: [
        "Everything in Pro",
        "Custom credit packages",
        "Dedicated account manager",
        "SLA guarantees",
        "Priority support & phone",
        "Custom integrations",
        "Volume discounts",
        "Advanced analytics",
        "White-label options",
        "Custom training & onboarding"
      ]
    }
  ];

  const proPricing = [
    { credits: "2,000", monthlyPrice: 19, annualPrice: 190, popular: false },
    { credits: "5,000", monthlyPrice: 39, annualPrice: 390, popular: false },
    { credits: "10,000", monthlyPrice: 69, annualPrice: 690, popular: true },
    { credits: "25,000", monthlyPrice: 149, annualPrice: 1490, popular: false },
    { credits: "50,000", monthlyPrice: 279, annualPrice: 2790, popular: false },
    { credits: "60,000", monthlyPrice: 329, annualPrice: 3290, popular: false }
  ];

  const creditUsage = [
    { tool: "AI Chat", cost: "Free", description: "Unlimited conversations" },
    { tool: "Image Generation", cost: "Free", description: "2 images/day, then 50 credits each" },
    { tool: "Image → Video (5s)", cost: "100 credits", description: "Short animated videos" },
    { tool: "Image → Video (10s)", cost: "200 credits", description: "Extended animations" },
    { tool: "Text to Speech", cost: "100 credits", description: "Up to 5,000 characters" },
    { tool: "Image → Video + Audio (5s)", cost: "200 credits", description: "Video with custom audio" },
    { tool: "Image → Video + Audio (10s)", cost: "400 credits", description: "Extended audio-video" },
    { tool: "Audio → Video", cost: "100/minute", description: "Rounded up per minute" }
  ];

  const features = [
    {
      icon: <Calculator className="h-8 w-8 text-primary" />,
      title: "Transparent Pricing",
      description: "Clear credit system with no hidden fees or surprise charges"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Flexible Usage",
      description: "Credits never expire and can be used across all AI tools"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Payments",
      description: "Razorpay integration with multiple payment options"
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8 text-primary" />,
      title: "Premium Support",
      description: "Priority support for Pro users, dedicated support for Enterprise"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <Star className="h-4 w-4 mr-1" />
            Simple & Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Start free, upgrade when you need more. Our credit-based system gives you complete control
            over your AI generation costs with transparent, pay-as-you-use pricing.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Save 17%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative overflow-hidden ${plan.color} ${plan.popular ? 'shadow-2xl scale-105' : 'shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className={`text-center ${plan.popular ? 'pt-8' : 'pt-6'}`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.name === 'Free' ? 'bg-gray-100 dark:bg-gray-800' :
                      plan.name === 'Pro' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      {plan.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{plan.description}</p>

                  {plan.monthlyPrice !== null ? (
                    <div className="mb-4">
                      <div className="text-4xl font-bold mb-1">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      </div>
                      {isAnnual && plan.monthlyPrice > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Save ${(plan.monthlyPrice * 12) - plan.annualPrice}/year
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold mb-4">Custom Pricing</div>
                  )}

                  <div className="text-center mb-4">
                    <Badge variant="secondary" className="text-xs px-3 py-1">
                      {plan.credits}
                    </Badge>
                  </div>

                  <Button className={`w-full mb-6 ${plan.buttonColor}`}>
                    {plan.name === 'Free' ? 'Get Started Free' :
                     plan.name === 'Enterprise' ? 'Contact Sales' : 'Choose Pro Plan'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Plan Pricing Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pro Plan Pricing Options</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the credit package that fits your usage. All Pro plans include the same features,
              just different credit allocations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proPricing.map((option, index) => (
              <Card key={index} className={`p-6 hover:shadow-lg transition-shadow ${
                option.popular ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-800'
              }`}>
                <CardContent className="p-0 text-center">
                  {option.popular && (
                    <Badge className="mb-4 bg-blue-500">Most Popular</Badge>
                  )}
                  <div className="text-3xl font-bold mb-2">{option.credits}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">Credits included</div>
                  <div className="text-2xl font-bold mb-1">
                    ${isAnnual ? option.annualPrice : option.monthlyPrice}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  {isAnnual && (
                    <div className="text-sm text-green-600 dark:text-green-400 mb-4">
                      Save ${(option.monthlyPrice * 12) - option.annualPrice}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                    ~${(isAnnual ? option.annualPrice : option.monthlyPrice * 12) / parseInt(option.credits.replace(',', ''))} per 100 credits
                  </div>
                  <Button className={`w-full ${option.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200'}`}>
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Usage Guide */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Credit Usage Guide</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Understand exactly how credits are used across our AI tools. No surprises, complete transparency.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-0 bg-white dark:bg-slate-800 shadow-xl">
              <CardContent className="p-0">
                <div className="space-y-6">
                  {creditUsage.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{item.tool}</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.cost === 'Free' ? 'default' : 'secondary'}
                               className={item.cost === 'Free' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}>
                          {item.cost}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    <strong>Note:</strong> Credits are deducted only when you generate content. Previews are included,
                    and downloading final results is always free. Credits never expire.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Pricing?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Fair, transparent, and designed to grow with your needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white dark:bg-slate-800">
                <CardContent className="p-0">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <Card className="p-6 border-0 bg-white dark:bg-slate-800">
              <h4 className="font-semibold mb-2">Can I change my plan anytime?</h4>
              <p className="text-gray-600 dark:text-gray-300">Yes, you can upgrade or downgrade your plan at any time. Credits from your current plan will be preserved.</p>
            </Card>
            <Card className="p-6 border-0 bg-white dark:bg-slate-800">
              <h4 className="font-semibold mb-2">Do credits expire?</h4>
              <p className="text-gray-600 dark:text-gray-300">No, credits never expire. You can use them whenever you need, at your own pace.</p>
            </Card>
            <Card className="p-6 border-0 bg-white dark:bg-slate-800">
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 dark:text-gray-300">We accept all major credit cards, debit cards, net banking, UPI, and digital wallets through Razorpay.</p>
            </Card>
            <Card className="p-6 border-0 bg-white dark:bg-slate-800">
              <h4 className="font-semibold mb-2">Is there a free trial for Pro features?</h4>
              <p className="text-gray-600 dark:text-gray-300">Our Free plan gives you access to all tools with daily limits. You can experience everything before upgrading.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and businesses who trust our AI tools for their content creation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
              Start Free Today
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Sales
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;