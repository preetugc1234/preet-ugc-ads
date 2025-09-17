import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Wand2, Zap, Target } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Get Inspired",
    description: "Find what wins.",
    detail: "Explore top-performing ads across your category or competitors by hook, selling point, and visuals.",
    step: "01"
  },
  {
    icon: Wand2,
    title: "Create Winning Ads",
    description: "From link to launch - instantly.",
    detail: "Turn any URL or static asset into a scroll-stopping video ads. Customize with music, avatars, or voiceovers.",
    step: "02"
  },
  {
    icon: Zap,
    title: "Test & Optimize",
    description: "AI-powered performance.",
    detail: "Generate multiple variants and let AI testing surface the top performer with real-time analytics.",
    step: "03"
  },
  {
    icon: Target,
    title: "Scale Results",
    description: "Multiply your success.",
    detail: "Take winning creatives and scale them across platforms with automated optimization and performance tracking.",
    step: "04"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            📋 PROCESS
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            How AdMax Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From inspiration to optimization - create winning video ads in minutes with our streamlined process
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="group border-0 bg-gradient-card backdrop-blur-sm shadow-glass hover:shadow-glow transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Step number background */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{step.step}</span>
                </div>

                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-primary font-medium mb-3">
                      {step.description}
                    </p>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.detail}
                  </p>
                </CardContent>

                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-10" />
                )}
              </Card>
            );
          })}
        </div>

        {/* Demo Images Section */}
        <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Get Inspired Demo */}
          <div className="relative">
            <div className="bg-gradient-card backdrop-blur-sm rounded-2xl p-6 shadow-glass border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-center">Get Inspired</h3>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AD</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Create Winning Ads Demo */}
          <div className="relative">
            <div className="bg-gradient-card backdrop-blur-sm rounded-2xl p-6 shadow-glass border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-center">Create Winning Ads</h3>
              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Wand2 className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white text-sm">AI Video Generation</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-white/10 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}