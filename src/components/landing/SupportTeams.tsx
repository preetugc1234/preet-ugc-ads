import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, TrendingUp, Briefcase } from "lucide-react";

const teams = [
  {
    icon: Palette,
    title: "Creative Teams",
    description: "Skip studio shoots, generate assets instantly",
    gradient: "from-purple-500 to-pink-500",
    features: [
      "AI-powered asset generation",
      "Brand consistency tools",
      "Instant creative variations",
      "Template library access"
    ]
  },
  {
    icon: TrendingUp,
    title: "Performance Marketers",
    description: "Launch 20+ creatives/day, test ROAS quickly",
    gradient: "from-blue-500 to-cyan-500",
    features: [
      "Rapid A/B testing",
      "Performance analytics",
      "ROI optimization",
      "Campaign scaling tools"
    ]
  },
  {
    icon: Briefcase,
    title: "Business Owners",
    description: "Produce ad-ready videos in minutes, without added headcount.",
    gradient: "from-orange-500 to-red-500",
    features: [
      "Cost-effective solutions",
      "No technical expertise needed",
      "Quick turnaround time",
      "Scalable ad production"
    ]
  }
];

export default function SupportTeams() {
  return (
    <section id="teams" className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Support fast-moving teams
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Empower every team in your organization with AI-powered creative tools
          </p>
        </div>

        {/* Teams Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {teams.map((team, index) => {
            const Icon = team.icon;
            return (
              <Card 
                key={index} 
                className="group border-0 bg-white/10 backdrop-blur-glass shadow-glass hover:shadow-glow transition-all duration-500 hover:-translate-y-2 border border-white/20"
              >
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${team.gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-semibold mb-3 text-white group-hover:text-white/90 transition-colors">
                      {team.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed mb-6">
                      {team.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {team.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white/60 rounded-full" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Badge 
            variant="secondary" 
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm mb-6"
          >
            🚀 GET STARTED
          </Badge>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of teams already creating winning ads with AI
          </p>
        </div>
      </div>
    </section>
  );
}