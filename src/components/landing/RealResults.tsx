import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, DollarSign } from "lucide-react";

const metrics = [
  {
    value: "2.7x",
    label: "More leads vs. static image ads",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500"
  },
  {
    value: "1.7x",
    label: "Higher ROI*",
    icon: DollarSign,
    color: "from-blue-500 to-cyan-500"
  },
  {
    value: "90%",
    label: "Lower production cost",
    icon: Clock,
    color: "from-purple-500 to-pink-500"
  }
];

export default function RealResults() {
  return (
    <section id="results" className="py-24 bg-gradient-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - 3D Visual */}
          <div className="relative">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Real Results
              </h2>
              
              {/* 3D Chart Visualization */}
              <div className="relative w-80 h-80 mx-auto">
                <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-20 blur-xl" />
                <div className="relative bg-gradient-card backdrop-blur-sm rounded-2xl p-8 shadow-glass border border-white/10 h-full flex items-center justify-center">
                  {/* Isometric bars */}
                  <div className="relative">
                    <div className="flex items-end space-x-4">
                      {/* Bar 1 */}
                      <div className="relative">
                        <div 
                          className="w-12 bg-gradient-to-t from-primary to-accent rounded-t-lg"
                          style={{ height: '120px' }}
                        />
                        <div className="absolute -top-2 -right-2 w-12 h-3 bg-gradient-to-r from-accent to-primary rounded-full transform rotate-45 opacity-80" />
                        <div className="absolute top-0 -right-2 w-3 bg-gradient-to-b from-accent to-primary rounded-r-lg" style={{ height: '120px' }} />
                      </div>
                      
                      {/* Bar 2 */}
                      <div className="relative">
                        <div 
                          className="w-12 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg"
                          style={{ height: '80px' }}
                        />
                        <div className="absolute -top-2 -right-2 w-12 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transform rotate-45 opacity-80" />
                        <div className="absolute top-0 -right-2 w-3 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-r-lg" style={{ height: '80px' }} />
                      </div>
                      
                      {/* Bar 3 */}
                      <div className="relative">
                        <div 
                          className="w-12 bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg"
                          style={{ height: '100px' }}
                        />
                        <div className="absolute -top-2 -right-2 w-12 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transform rotate-45 opacity-80" />
                        <div className="absolute top-0 -right-2 w-3 bg-gradient-to-b from-emerald-500 to-green-500 rounded-r-lg" style={{ height: '100px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                *Sources: Meta, Wistia, HubSpot, AdMax benchmarks
              </p>
            </div>
          </div>

          {/* Right - Metrics */}
          <div className="space-y-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card 
                  key={index}
                  className="group border-0 bg-gradient-card backdrop-blur-sm shadow-glass hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${metric.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-4xl font-bold mb-1 group-hover:text-primary transition-colors">
                          {metric.value}
                        </div>
                        <div className="text-muted-foreground">
                          {metric.label}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Additional context */}
            <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary">
                💡 INSIGHT
              </Badge>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Video ads consistently outperform static images across all major platforms. 
                Our AI-powered optimization ensures you get maximum ROI from every campaign.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}