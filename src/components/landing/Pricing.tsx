import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Zap, Crown, Building } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    icon: Zap,
    price: { monthly: 0, annual: 0 },
    credits: "100 credits/month",
    description: "Perfect for trying out our platform",
    features: [
      "Basic AI chat",
      "5 image generations",
      "Standard templates",
      "Community support",
      "Watermarked exports"
    ],
    limitations: [
      "Limited to 720p resolution",
      "AdMax watermark included"
    ],
    cta: "Get Started",
    popular: false,
    gradient: "from-gray-500 to-gray-600"
  },
  {
    name: "Starter",
    icon: Crown,
    price: { monthly: 19, annual: 15 },
    credits: "1,200 credits/year",
    description: "For individual creators",
    features: [
      "All AI tools included",
      "HD video exports",
      "50+ premium templates",
      "Priority email support",
      "No watermarks",
      "Commercial usage rights"
    ],
    limitations: [],
    cta: "Start Free Trial",
    popular: true,
    gradient: "from-primary to-accent"
  },
  {
    name: "Pro",
    icon: Building,
    price: { monthly: 49, annual: 39 },
    credits: "5,000 credits/year",
    description: "For growing businesses",
    features: [
      "Everything in Starter",
      "4K video exports",
      "Unlimited downloads",
      "Advanced analytics",
      "Team collaboration",
      "Custom branding",
      "API access",
      "Priority support"
    ],
    limitations: [],
    cta: "Start Free Trial",
    popular: false,
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    name: "Enterprise",
    icon: Building,
    price: { monthly: "Custom", annual: "Custom" },
    credits: "Unlimited credits",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantees",
      "Custom training",
      "White-label options",
      "Advanced security",
      "24/7 phone support"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-orange-500 to-red-500"
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

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
        <div className="grid lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = typeof plan.price.monthly === 'number' 
              ? (isAnnual ? plan.price.annual : plan.price.monthly)
              : plan.price.monthly;

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
                        {typeof price === 'string' ? price : `₹${price}`}
                      </span>
                      {typeof price === 'number' && price > 0 && (
                        <span className="text-muted-foreground ml-1">
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{plan.credits}</p>
                  </div>

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
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    } transition-all duration-300 hover:scale-105`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>

                  {plan.name === 'Starter' && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      7-day free trial included
                    </p>
                  )}
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