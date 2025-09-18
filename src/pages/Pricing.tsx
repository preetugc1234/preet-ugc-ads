import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Check, Star, Zap, Crown, ArrowRight, Calculator, Clock, Shield, HeadphonesIcon, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedCredits, setSelectedCredits] = useState("1000");
  const [customCredits, setCustomCredits] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  const creditOptions = [
    { credits: "1000", monthlyPrice: 19, label: "1,000 credits" },
    { credits: "2000", monthlyPrice: 39, label: "2,000 credits" },
    { credits: "4000", monthlyPrice: 79, label: "4,000 credits" },
    { credits: "8000", monthlyPrice: 159, label: "8,000 credits" },
    { credits: "16000", monthlyPrice: 319, label: "16,000 credits" },
    { credits: "32000", monthlyPrice: 639, label: "32,000 credits" },
    { credits: "64000", monthlyPrice: 1279, label: "64,000 credits" }
  ];

  // Individual credits calculation (from prompt.md)
  const calculatePriceFromCredits = (credits: number) => {
    return Number((credits * 0.0275).toFixed(2));
  };

  const calculateCreditsFromPrice = (price: number) => {
    const rawCredits = price / 0.0275;
    const fractionalPart = rawCredits % 1;
    return fractionalPart < 0.5 ? Math.floor(rawCredits) : Math.ceil(rawCredits);
  };

  const getProPricing = () => {
    const selectedOption = creditOptions.find(option => option.credits === selectedCredits);
    if (!selectedOption) return { monthlyPrice: 19, annualPrice: 228, credits: "1,000" };

    const monthlyPrice = isAnnual ? selectedOption.monthlyPrice : Math.round(selectedOption.monthlyPrice * 1.24);
    const annualPrice = selectedOption.monthlyPrice * 12;
    const credits = isAnnual ? `${parseInt(selectedCredits) * 12}` : selectedCredits;

    return { monthlyPrice, annualPrice, credits };
  };

  const proPricing = getProPricing();

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
      monthlyPrice: proPricing.monthlyPrice,
      annualPrice: proPricing.annualPrice,
      credits: isAnnual ? `${proPricing.credits} credits/year` : `${proPricing.credits} credits/month`,
      dailyLimits: "Unlimited generations",
      icon: <Star className="h-6 w-6" />,
      color: "border-blue-200 dark:border-blue-700 ring-2 ring-blue-500",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      popular: true,
      features: [
        "Everything in Free",
        "Flexible credit packages",
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
                Save 24%
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
                        ${plan.name === 'Pro' ? proPricing.monthlyPrice : (isAnnual ? plan.annualPrice : plan.monthlyPrice)}
                        <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
                          /{plan.name === 'Pro' ? 'month' : (isAnnual ? 'year' : 'month')}
                        </span>
                      </div>
                      {isAnnual && plan.monthlyPrice > 0 && plan.name !== 'Pro' && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Save ${(plan.monthlyPrice * 12) - plan.annualPrice}/year
                        </div>
                      )}
                      {plan.name === 'Pro' && isAnnual && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Billed annually - Save 24%
                        </div>
                      )}
                      {plan.name === 'Pro' && !isAnnual && (
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          Monthly billing - 24% higher
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

                  {plan.name === 'Pro' && (
                    <div className="mb-4">
                      <label className="text-sm font-medium mb-2 block">Select Credits:</label>
                      <Select value={selectedCredits} onValueChange={setSelectedCredits}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {creditOptions.map((option) => {
                            const displayPrice = isAnnual ? option.monthlyPrice : Math.round(option.monthlyPrice * 1.24);
                            return (
                              <SelectItem key={option.credits} value={option.credits}>
                                {option.label} - ${displayPrice}/month
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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

      {/* Individual Credits Purchase */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Gift className="h-4 w-4 mr-1" />
              Buy Individual Credits
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Purchase Credits On-Demand
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No subscription required. Buy exactly what you need when you need it.
              Credits never expire and work across all AI tools.
            </p>
          </div>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Credits to Amount Calculator */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Buy Credits</h3>
                  <div>
                    <Label htmlFor="credits-input">Number of Credits</Label>
                    <Input
                      id="credits-input"
                      type="number"
                      min="100"
                      max="90000"
                      value={customCredits}
                      onChange={(e) => {
                        const credits = parseInt(e.target.value) || 0;
                        setCustomCredits(e.target.value);
                        if (credits >= 100 && credits <= 90000) {
                          setCustomAmount(calculatePriceFromCredits(credits).toString());
                        } else {
                          setCustomAmount("");
                        }
                      }}
                      placeholder="Enter credits (100 - 90,000)"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: 100 credits | Maximum: 90,000 credits
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="amount-display">Total Amount</Label>
                    <div className="text-3xl font-bold text-green-600 mt-2">
                      ${customCredits ? calculatePriceFromCredits(parseInt(customCredits) || 0).toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>

                {/* Amount to Credits Calculator */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Or Enter Amount</h3>
                  <div>
                    <Label htmlFor="amount-input">Amount ($)</Label>
                    <Input
                      id="amount-input"
                      type="number"
                      min="2.75"
                      max="2475"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value) || 0;
                        setCustomAmount(e.target.value);
                        if (amount >= 2.75 && amount <= 2475) {
                          setCustomCredits(calculateCreditsFromPrice(amount).toString());
                        } else {
                          setCustomCredits("");
                        }
                      }}
                      placeholder="Enter amount ($2.75 - $2,475)"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Rate: $0.0275 per credit
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="credits-display">Credits You'll Get</Label>
                    <div className="text-3xl font-bold text-blue-600 mt-2">
                      {customAmount ? calculateCreditsFromPrice(parseFloat(customAmount) || 0).toLocaleString() : '0'} credits
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t mt-8 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Credit Usage Guide</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Chat Generation: Free</li>
                      <li>• Image Generation: Free</li>
                      <li>• Image→Video (5s): 100 credits</li>
                      <li>• Image→Video (10s): 200 credits</li>
                      <li>• Text→Speech: 100 credits</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">UGC Video Generation</h4>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>• Audio→Video: 100 credits/minute</li>
                      <li>• Image→Video+Audio (5s): 200 credits</li>
                      <li>• Image→Video+Audio (10s): 400 credits</li>
                      <li>• Custom UGC content varies by length</li>
                    </ul>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
                  disabled={!customCredits || parseInt(customCredits) < 100 || parseInt(customCredits) > 90000}
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Purchase {customCredits ? parseInt(customCredits).toLocaleString() : '0'} Credits for ${customCredits ? calculatePriceFromCredits(parseInt(customCredits) || 0).toFixed(2) : '0.00'}
                </Button>
              </div>
            </CardContent>
          </Card>
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