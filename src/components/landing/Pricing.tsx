import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Zap, Star, Crown } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    icon: Zap,
    price: { monthly: 0, annual: 0 },
    credits: "500 credits/month",
    description: "Perfect for exploring our AI tools",
    features: [
      "Access to all 6 AI tools",
      "500 free credits monthly",
      "Daily free allowances",
      "30-item history storage",
      "Community support",
      "Basic tutorials access",
      "Standard processing speed"
    ],
    limitations: [
      "5 text + 2 images daily"
    ],
    cta: "Get Started Free",
    popular: false,
    gradient: "from-gray-500 to-gray-600"
  },
  {
    name: "Pro",
    icon: Star,
    price: { monthly: 19, annual: 19 },
    credits: "1,000 credits/month",
    description: "Ideal for creators and small businesses",
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
    ],
    limitations: [],
    cta: "Choose Pro Plan",
    popular: true,
    gradient: "from-primary to-accent"
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: { monthly: "Custom", annual: "Custom" },
    credits: "Custom credit allocation",
    description: "Custom solutions for large organizations",
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
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-purple-500 to-indigo-500"
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState("1000");

  const creditOptions = [
    { credits: "1000", monthlyPrice: 19, label: "1,000 credits" },
    { credits: "2000", monthlyPrice: 39, label: "2,000 credits" },
    { credits: "4000", monthlyPrice: 79, label: "4,000 credits" },
    { credits: "8000", monthlyPrice: 159, label: "8,000 credits" },
    { credits: "16000", monthlyPrice: 319, label: "16,000 credits" },
    { credits: "32000", monthlyPrice: 639, label: "32,000 credits" },
    { credits: "64000", monthlyPrice: 1279, label: "64,000 credits" }
  ];

  const getProPricing = () => {
    const selectedOption = creditOptions.find(option => option.credits === selectedCredits);
    if (!selectedOption) return { monthlyPrice: 19, annualPrice: 228, credits: "1,000" };

    const monthlyPrice = isAnnual ? selectedOption.monthlyPrice : Math.round(selectedOption.monthlyPrice * 1.24);
    const annualPrice = selectedOption.monthlyPrice * 12;
    const credits = isAnnual ? `${parseInt(selectedCredits) * 12}` : selectedCredits;

    return { monthlyPrice, annualPrice, credits };
  };

  const proPricing = getProPricing();

  return (
    <section id="pricing" className="py-24 bg-gradient-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Pick a plan
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              or get started for free
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Plans for creators, marketers, and agencies of all sizes.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border-primary/20"
            >
              💰 SAVE 50% ON ANNUAL PLAN
            </Badge>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Annual
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            let price, credits;

            if (plan.name === 'Pro') {
              price = proPricing.monthlyPrice;
              credits = isAnnual ? `${proPricing.credits} credits/year` : `${proPricing.credits} credits/month`;
            } else {
              price = typeof plan.price.monthly === 'number'
                ? (isAnnual ? plan.price.annual : plan.price.monthly)
                : plan.price.monthly;
              credits = plan.credits;
            }

            return (
              <Card
                key={index}
                className={`relative border-0 bg-gradient-card backdrop-blur-sm shadow-glass transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular
                    ? 'ring-2 ring-primary shadow-glow scale-105'
                    : 'hover:shadow-glow'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-white border-0 shadow-lg">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center shadow-lg mx-auto mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">
                        {typeof price === 'string' ? price : `$${price}`}
                      </span>
                      {typeof price === 'number' && price > 0 && (
                        <span className="text-muted-foreground ml-1">
                          /month
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{credits}</p>

                    {plan.name === 'Pro' && isAnnual && (
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Billed annually - Save 24%
                      </div>
                    )}
                    {plan.name === 'Pro' && !isAnnual && (
                      <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                        Monthly billing - 24% higher
                      </div>
                    )}
                  </div>

                  {/* Pro Plan Credit Selector */}
                  {plan.name === 'Pro' && (
                    <div className="mb-6">
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

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-2 mb-6 p-3 bg-muted/50 rounded-lg">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-primary hover:opacity-90 shadow-glow'
                        : plan.name === 'Enterprise'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    } transition-all duration-300 hover:scale-105`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            All plans include access to our full AI toolkit
          </p>
          <Button variant="outline" size="lg" className="hover:bg-primary/10 hover:text-primary hover:border-primary">
            Compare all features
          </Button>
        </div>
      </div>
    </section>
  );
}