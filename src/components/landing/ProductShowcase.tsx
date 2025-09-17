import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Image, Video, Mic, Users, Music } from "lucide-react";

const products = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    description: "Intelligent conversation AI for customer support and engagement",
    badge: "CORE",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Image,
    title: "Image Generation",
    description: "Create stunning visuals and graphics with AI-powered tools",
    badge: "POPULAR",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Video,
    title: "Image to Video",
    description: "Transform static images into dynamic video content",
    badge: "HOT",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Mic,
    title: "Text to Speech",
    description: "Natural voice synthesis with multiple language support",
    badge: "NEW",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Users,
    title: "UGC Video Creator",
    description: "Create authentic user-generated content with AI avatars",
    badge: "TRENDING",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: Music,
    title: "Audio to Video",
    description: "Convert audio content into engaging visual experiences",
    badge: "BETA",
    gradient: "from-teal-500 to-blue-500"
  }
];

export default function ProductShowcase() {
  return (
    <section id="products" className="py-24 bg-gradient-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            🚀 OUR PRODUCTS
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Six Powerful AI Tools
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              One Platform
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create, test, and optimize winning video ads with AI-powered tools
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
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {product.badge}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {product.description}
                  </p>
                  
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