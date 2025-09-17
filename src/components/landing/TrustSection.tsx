import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Users, Shield, TrendingUp } from "lucide-react";

const trustCards = [
  {
    icon: Users,
    title: "Investors",
    description: "We've raised $23M from the best in the industry such as WindCo, Kindred Ventures, and NFDG.",
    cta: "LEARN MORE",
    logos: ["WindCo", "Kindred", "NFDG"]
  },
  {
    icon: Award,
    title: "Industry",
    description: "We've earned 40+ badges and hold a 4.7/5 rating on G2.",
    cta: "LEARN MORE",
    badges: ["Top 50", "Best Results", "Best Usability"]
  },
  {
    icon: Shield,
    title: "Media",
    description: "We've been featured and recognized by leading publications like Fast Company, Bloomberg, and TechCrunch.",
    cta: "LEARN MORE",
    publications: ["FC", "TC", "B"]
  }
];

const platforms = [
  "Compatible with Platforms",
  "Facebook Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "Twitter Ads", "Snapchat Ads"
];

const compliance = [
  "GDPR Compliant", "SOC 2 Certified", "Privacy Shield", "ISO 27001"
];

export default function TrustSection() {
  return (
    <section id="trust" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Trust and compliance
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Trusted by leading brands and backed by industry experts
          </p>
        </div>

        {/* Trust Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {trustCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index} 
                className="group border-0 bg-gradient-card backdrop-blur-sm shadow-glass hover:shadow-glow transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {card.description}
                    </p>
                  </div>

                  {/* Logos/Badges */}
                  <div className="mb-6">
                    {card.logos && (
                      <div className="flex items-center space-x-4">
                        {card.logos.map((logo, logoIndex) => (
                          <div key={logoIndex} className="w-16 h-8 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">{logo}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {card.badges && (
                      <div className="flex flex-wrap gap-2">
                        {card.badges.map((badge, badgeIndex) => (
                          <Badge key={badgeIndex} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {card.publications && (
                      <div className="flex items-center space-x-4">
                        {card.publications.map((pub, pubIndex) => (
                          <div key={pubIndex} className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-bold text-muted-foreground">{pub}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300 p-0 h-auto font-medium text-primary"
                  >
                    {card.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Platform Compatibility & Compliance */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Platform Compatibility */}
          <Card className="border-0 bg-gradient-card backdrop-blur-sm shadow-glass">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-6">Compatible with Platforms</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="font-medium">All Major Ad Platforms</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.slice(1).map((platform, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm text-muted-foreground">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card className="border-0 bg-gradient-card backdrop-blur-sm shadow-glass">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-6">Compliance</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium">Enterprise Security</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {compliance.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}