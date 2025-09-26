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
    price: { monthly: 49, annual: 49 },
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
    price: { monthly: 69, annual: 69 },
    credits: "10 Videos",
    description: "Testing many creatives a month",
    features: [
      "10 Videos",
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
    name: "Pro",
    icon: Crown,
    price: { monthly: 119, annual: 119 },
    credits: "20 Videos",
    description: "Advertisers ready to scale their campaigns",
    features: [
      "20 Videos",
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
    cta: "Get Started",
    popular: true,
    bgColor: "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900",
    textColor: "text-white",
    border: ""
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

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
            const price = plan.price.monthly;

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
                  <h3 className={`text-2xl font-bold mb-2 ${plan.name === 'Pro' ? 'text-blue-400' : 'text-blue-500'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.name === 'Pro' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${plan.textColor}`}>
                      ${price}
                    </span>
                    <span className={`text-sm ml-1 ${plan.name === 'Pro' ? 'text-gray-400' : 'text-gray-500'}`}>
                      /month
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <p className={`text-sm font-medium mb-4 ${plan.textColor}`}>Includes</p>
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          plan.name === 'Pro' ? 'bg-blue-500' : 'bg-blue-500'
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
                    plan.name === 'Pro'
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
          <div className="bg-white border border-gray-200 rounded-3xl p-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-blue-500 mb-2">
                Enterprise (20+ Videos)
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Need more than 20+ UGC ads per month?<br />
                Contact us to give your organization the exact control, and the support you need.
              </p>

              <div className="flex items-center justify-center space-x-8 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-800">Custom Videos</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-800">Month Enterprise-Level Support</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-800">Payment Via Invoice</span>
                </div>
              </div>

              <Button className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-xl">
                Book A Call →
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}