import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Image, Video, AudioLines, Film } from "lucide-react";

const products = [
  {
    icon: MessageSquare,
    title: "Chat",
    description: "AI Chat & Text Generation with streaming responses",
    badge: "FREE",
    gradient: "from-blue-500 to-cyan-500",
    credits: "Free",
    href: "/products/chat"
  },
  {
    icon: Image,
    title: "Image Generation",
    description: "Create stunning visuals from text prompts using advanced AI",
    badge: "FREE",
    gradient: "from-purple-500 to-pink-500",
    credits: "Free",
    href: "/products/image-generation"
  },
  {
    icon: Video,
    title: "Image→Video",
    description: "Transform static images into dynamic video content (no audio)",
    badge: "PREMIUM",
    gradient: "from-orange-500 to-red-500",
    credits: "100/5s",
    href: "/products/image-to-video"
  },
  {
    icon: AudioLines,
    title: "Text→Speech",
    description: "Natural voice synthesis with premium AI voices",
    badge: "PREMIUM",
    gradient: "from-green-500 to-emerald-500",
    credits: "100 credits",
    href: "/products/text-to-speech"
  },
  {
    icon: Film,
    title: "UGC Video Gen",
    description: "Audio→Video & Image→Video+Audio for authentic UGC content",
    badge: "ADVANCED",
    gradient: "from-indigo-500 to-purple-500",
    credits: "100-400",
    href: "/products/audio-to-video",
    subtools: [
      { name: "Audio→Video", description: "Convert audio to engaging video", credits: "100/min" },
      { name: "Image→Video+Audio", description: "Combine image & audio for UGC", credits: "200-400" }
    ]
  }
];

export default function ProductShowcase() {
  return (
    <section id="products" className="py-24 bg-gradient-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            🚀 OUR AI TOOLS
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Five Powerful AI Tools
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              One Platform
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create, test, and optimize winning UGC content with AI-powered tools.
            From chat to video generation - all with transparent credit-based pricing.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <Card
                key={index}
                className="group border-0 bg-gradient-card backdrop-blur-sm shadow-glass hover:shadow-glow transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${product.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          product.badge === 'FREE' ? 'bg-green-100 text-green-800 border-green-200' :
                          product.badge === 'PREMIUM' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-purple-100 text-purple-800 border-purple-200'
                        }`}
                      >
                        {product.badge}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {product.credits}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Subtools for UGC Video Gen */}
                  {product.subtools && (
                    <div className="mb-4 space-y-2">
                      {product.subtools.map((subtool, subIndex) => (
                        <div key={subIndex} className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{subtool.name}</h4>
                            <Badge variant="outline" className="text-xs">{subtool.credits}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{subtool.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300 p-0 h-auto font-medium"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-300 hover:scale-105 px-8"
          >
            Try All Tools Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}