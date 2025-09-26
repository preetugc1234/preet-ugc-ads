import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Zap, Star, Crown } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Startup",
    icon: Zap,
    price: { monthly: 0, annual: 0 },
    credits: "5 Videos",
    description: "Best option if you are starting with ads",
    features: [
      "5 Videos",
      "300+ realistic AI creators",
      "35+ language available",
      "Processed in 2 minutes",
      "Custom AI hooks",
      "Create content in bulk",
      "B-roll generator"
    ],
    limitations: [],
    cta: "Get Started",
    popular: false,
    bgColor: "bg-white",
    textColor: "text-gray-900",
    border: "border border-gray-200"
  },
  {
    name: "Growth",
    icon: Star,
    price: { monthly: 19, annual: 19 },
    credits: "Variable Credits",
    description: "Testing many creatives a month",
    features: [
      "Variable Videos (1000-64000 credits)",
      "300+ realistic AI creators",
      "35+ language available",
      "Processed in 2 minutes",
      "Custom AI hooks",
      "Create content in bulk",
      "B-roll generator"
    ],
    limitations: [],
    cta: "Get Started",
    popular: true,
    bgColor: "bg-white",
    textColor: "text-gray-900",
    border: "border border-gray-200",
    hasCreditsSelector: true
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: { monthly: "Custom", annual: "Custom" },
    credits: "Custom Videos",
    description: "Advertisers ready to scale their campaigns",
    features: [
      "Custom Videos",
      "300+ realistic AI creators",
      "35+ language available",
      "Processed in 2 minutes",
      "Custom AI hooks",
      "Create content in bulk",
      "Image to product in hand video",
      "Custom AI avatar",
      "Add 3 users to your workspace for free",
      "Custom voice",
      "B-roll generator"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    bgColor: "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900",
    textColor: "text-white",
    border: ""
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true); // Default to annual
  const [selectedCredits, setSelectedCredits] = useState("1000");
  const [customCredits, setCustomCredits] = useState(100);

  const creditOptions = [
    { credits: "1000", annualPrice: 19, label: "1,000 credits" },
    { credits: "2000", annualPrice: 39, label: "2,000 credits" },
    { credits: "4000", annualPrice: 79, label: "4,000 credits" },
    { credits: "8000", annualPrice: 159, label: "8,000 credits" },
    { credits: "16000", annualPrice: 319, label: "16,000 credits" },
    { credits: "32000", annualPrice: 639, label: "32,000 credits" },
    { credits: "64000", annualPrice: 1279, label: "64,000 credits" }
  ];

  const getGrowthPricing = () => {
    const selectedOption = creditOptions.find(option => option.credits === selectedCredits);
    if (!selectedOption) return { displayPrice: 19, credits: "1,000" };

    const displayPrice = isAnnual
      ? selectedOption.annualPrice
      : Math.round(selectedOption.annualPrice * 1.24); // 24% increase for monthly

    return { displayPrice, credits: selectedCredits };
  };

  const growthPricing = getGrowthPricing();

  const calculateCustomCost = () => {
    // Cost: $2.75 per 100 credits
    const costPer100 = 2.75;
    return (customCredits / 100) * costPer100;
  };

  const handleCustomCreditsChange = (value) => {
    const numValue = parseInt(value) || 100;
    const clampedValue = Math.max(100, Math.min(90000, numValue));
    setCustomCredits(clampedValue);
  };

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
            Start creating <span className="text-blue-500">UGC today</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            One-Time purchase for lifetime access and all features included
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <button
              className={`px-6 py-2 rounded-full transition-all ${
                !isAnnual
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full transition-all ${
                isAnnual
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setIsAnnual(true)}
            >
              Annually
            </button>
            <span className="ml-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-full">
              Save 30%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan, index) => {
            let price;
            let displayCredits = plan.credits;

            if (plan.name === 'Startup') {
              price = 0;
            } else if (plan.name === 'Growth') {
              price = growthPricing.displayPrice;
              displayCredits = `${growthPricing.credits} credits`;
            } else {
              price = plan.price.monthly;
            }

            return (
              <div
                key={index}
                className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${plan.bgColor} ${plan.border} ${plan.textColor}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.name === 'Enterprise' ? 'text-blue-400' : 'text-blue-500'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.name === 'Enterprise' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${plan.textColor}`}>
                      {typeof price === 'string' ? price : `$${price}`}
                    </span>
                    {typeof price === 'number' && (
                      <span className={`text-sm ml-1 ${plan.name === 'Enterprise' ? 'text-gray-400' : 'text-gray-500'}`}>
                        /month
                      </span>
                    )}
                  </div>

                  {plan.name === 'Growth' && !isAnnual && (
                    <div className="text-xs text-orange-600 mb-2">
                      Monthly billing (+24% surcharge)
                    </div>
                  )}
                </div>

                {/* Growth Plan Credit Selector */}
                {plan.hasCreditsSelector && (
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block text-gray-700">Select Credits:</label>
                    <Select value={selectedCredits} onValueChange={setSelectedCredits}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {creditOptions.map((option) => {
                          const displayPrice = isAnnual ? option.annualPrice : Math.round(option.annualPrice * 1.24);
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

                <div className="mb-8">
                  <p className={`text-sm font-medium mb-4 ${plan.textColor}`}>Includes</p>
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          plan.name === 'Enterprise' ? 'bg-blue-500' : 'bg-blue-500'
                        }`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className={`text-sm ${plan.textColor}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className={`w-full py-3 rounded-xl transition-all duration-300 ${
                    plan.name === 'Enterprise'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : plan.name === 'Startup'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-transparent border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {plan.cta} →
                </Button>
              </div>
            );
          })}
        </div>

        {/* Individual Credits Card */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-3xl p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-blue-500 mb-2">
                Purchase Individual Credits
              </h3>
              <p className="text-gray-600 text-sm">
                Need specific amount of credits? Purchase exactly what you need with our flexible credit system.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-8">
              <div className="flex-1 max-w-xs">
                <input
                  type="number"
                  min="100"
                  max="90000"
                  value={customCredits}
                  onChange={(e) => handleCustomCreditsChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center"
                  placeholder="Enter credits"
                />
              </div>

              <div className="text-center">
                <span className="text-2xl font-bold text-blue-600">
                  ${calculateCustomCost().toFixed(2)}
                </span>
              </div>

              <Button className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl">
                Buy Now
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}