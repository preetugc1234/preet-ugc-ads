import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Coins, Plus, Zap, TrendingUp, Gift, Clock, CreditCard } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import CreditHistory from "@/components/dashboard/CreditHistory";

const Credits = () => {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch credit balance
  const { data: creditBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['creditBalance'],
    queryFn: api.getCreditBalance,
    enabled: isAuthenticated,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: api.getUserStats,
    enabled: isAuthenticated
  });

  const currentCredits = creditBalance?.credits || user?.credits || 0;
  const monthlyAllowance = 2000; // This could come from user plan
  const usedThisMonth = userStats?.credits_used_total || 0;
  const remainingCredits = Math.max(0, monthlyAllowance - usedThisMonth);

  const creditPacks = [
    {
      id: "pack_500",
      credits: 500,
      price: 9.99,
      bonus: 0,
      popular: false,
      description: "Perfect for light usage"
    },
    {
      id: "pack_1000",
      credits: 1000,
      price: 18.99,
      bonus: 100,
      popular: true,
      description: "Most popular choice"
    },
    {
      id: "pack_2500",
      credits: 2500,
      price: 44.99,
      bonus: 300,
      popular: false,
      description: "Great for heavy users"
    },
    {
      id: "pack_5000",
      credits: 5000,
      price: 84.99,
      bonus: 750,
      popular: false,
      description: "Best value for teams"
    }
  ];


  const usageBreakdown = [
    { tool: "UGC Video Gen", used: 579, percentage: 46, color: "bg-purple-500" },
    { tool: "Image to Video", used: 423, percentage: 34, color: "bg-blue-500" },
    { tool: "Text to Speech", used: 245, percentage: 20, color: "bg-green-500" },
    { tool: "Chat Generation", used: 0, percentage: 0, color: "bg-yellow-500" },
    { tool: "Image Generation", used: 0, percentage: 0, color: "bg-pink-500" }
  ];

  const handlePurchase = (packId: string) => {
    const pack = creditPacks.find(p => p.id === packId);
    if (pack) {
      toast({
        title: "Purchase Initiated",
        description: `Purchasing ${pack.credits + pack.bonus} credits for $${pack.price}...`,
      });
      setSelectedPack(packId);
    }
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Credits Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your credits, purchase additional packs, and track usage
          </p>
        </div>

        {/* Credit Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balanceLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  currentCredits.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Allowance</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  remainingCredits.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? (
                  <Skeleton className="h-3 w-24" />
                ) : (
                  `${usedThisMonth.toLocaleString()} of ${monthlyAllowance.toLocaleString()} used`
                )}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${statsLoading ? 0 : (usedThisMonth / monthlyAllowance) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Refill</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">13 days</div>
              <p className="text-xs text-muted-foreground">
                February 15, 2024
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="purchase" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="purchase">Purchase Credits</TabsTrigger>
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>

          {/* Purchase Credits Tab */}
          <TabsContent value="purchase" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Buy Credit Packs
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Purchase additional credits to extend your usage beyond the monthly allowance
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {creditPacks.map((pack) => (
                    <Card key={pack.id} className={`relative cursor-pointer transition-all hover:shadow-lg ${pack.popular ? 'ring-2 ring-blue-500' : ''} ${selectedPack === pack.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      {pack.popular && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          Popular
                        </Badge>
                      )}
                      <CardHeader className="text-center pb-2">
                        <div className="text-3xl font-bold text-blue-600">
                          {pack.credits.toLocaleString()}
                        </div>
                        {pack.bonus > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            +{pack.bonus} bonus credits
                          </div>
                        )}
                        <div className="text-gray-500 text-sm">
                          {pack.description}
                        </div>
                      </CardHeader>
                      <CardContent className="text-center space-y-4">
                        <div className="text-2xl font-bold">
                          ${pack.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${(pack.price / (pack.credits + pack.bonus)).toFixed(3)} per credit
                        </div>
                        <Button
                          onClick={() => handlePurchase(pack.id)}
                          className="w-full"
                          variant={selectedPack === pack.id ? "secondary" : "default"}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          {selectedPack === pack.id ? "Processing..." : "Purchase"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Credit Pack Benefits
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Credits never expire</li>
                    <li>• Use alongside monthly allowance</li>
                    <li>• Larger packs include bonus credits</li>
                    <li>• Instant activation after purchase</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Analytics Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Usage Breakdown
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current billing period: Jan 15 - Feb 15, 2024
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usageBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.tool}</span>
                        <span className="text-sm text-gray-600">
                          {item.used} credits ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credit Cost Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Chat Generation</span>
                      <Badge variant="secondary">Free</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Image Generation</span>
                      <Badge variant="secondary">Free</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Image to Video (5s)</span>
                      <Badge>100 credits</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Image to Video (10s)</span>
                      <Badge>200 credits</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Text to Speech</span>
                      <Badge>100 credits</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">UGC Video (Audio→Video)</span>
                      <Badge>100 credits/min</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">UGC Video (Image→Video+Audio)</span>
                      <Badge>200 credits/5s</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h5 className="font-medium mb-2">Pro Tips</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Use HD quality for testing, 4K for final</li>
                      <li>• Shorter videos cost fewer credits</li>
                      <li>• Batch generate to save time</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="history" className="space-y-6">
            <CreditHistory />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Credits;