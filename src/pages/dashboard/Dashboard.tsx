import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api, apiHelpers } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Image,
  Video,
  AudioLines,
  Music,
  Film,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  Play,
  Download,
  MoreVertical,
  Eye
} from "lucide-react";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: api.getUserStats,
    enabled: isAuthenticated
  });

  // Fetch credit balance
  const { data: creditBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['creditBalance'],
    queryFn: api.getCreditBalance,
    enabled: isAuthenticated,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch recent generations
  const { data: userHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['userHistory'],
    queryFn: () => api.getUserHistory(8), // Get last 8 items for dashboard
    enabled: isAuthenticated
  });

  // Compute stats from real data
  const stats = {
    totalGenerations: userStats?.total_generations || 0,
    creditsUsed: userStats?.credits_used_total || 0,
    creditsRemaining: creditBalance?.credits || user?.credits || 0,
    generationsToday: userHistory?.generations?.filter(gen => {
      const genDate = new Date(gen.created_at).toDateString();
      const today = new Date().toDateString();
      return genDate === today;
    }).length || 0
  };

  // Format recent generations for display
  const recentGenerations = userHistory?.generations?.slice(0, 4).map(gen => ({
    id: gen.id,
    type: gen.type,
    title: `${gen.type.charAt(0).toUpperCase() + gen.type.slice(1)} Generation`,
    thumbnail: gen.preview_url,
    createdAt: new Date(gen.created_at).toLocaleDateString(),
    credits: gen.credit_cost || 0,
    status: gen.status || "completed"
  })) || [];

  const quickActions = [
    {
      name: "Chat",
      description: "Generate text & get AI assistance",
      icon: MessageSquare,
      href: "/dashboard/chat",
      credits: "Free",
      color: "from-blue-500 to-blue-600",
      popular: false
    },
    {
      name: "Image Generation",
      description: "Create images from text prompts",
      icon: Image,
      href: "/dashboard/image",
      credits: "Free",
      color: "from-green-500 to-green-600",
      popular: true
    },
    {
      name: "Image→Video",
      description: "Convert images to videos (no audio)",
      icon: Video,
      href: "/dashboard/image-to-video",
      credits: "100/5s",
      color: "from-purple-500 to-purple-600",
      popular: false
    },
    {
      name: "Text→Speech",
      description: "Convert text to natural speech",
      icon: AudioLines,
      href: "/dashboard/text-to-speech",
      credits: "Free (Testing)",
      color: "from-orange-500 to-orange-600",
      popular: false
    },
    {
      name: "UGC Video Gen",
      description: "Audio→Video & Image→Video+Audio",
      icon: Film,
      href: "/dashboard/ugc-video",
      credits: "Varies",
      color: "from-red-500 to-red-600",
      popular: false
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return AudioLines;
      case 'chat': return MessageSquare;
      default: return MessageSquare;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'chat': return 'Chat';
      default: return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100 px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.name || 'Creator'}! 👋
            </h1>
            <p className="text-xl text-gray-600">
              Ready to create something amazing? Choose a tool below to get started.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Generations
                  </CardTitle>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      stats.totalGenerations.toLocaleString()
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    All-time creations
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Credits Remaining
                  </CardTitle>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {balanceLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      stats.creditsRemaining.toLocaleString()
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {user?.plan?.toUpperCase() || 'FREE'} plan active
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Credits Used
                  </CardTitle>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      stats.creditsUsed.toLocaleString()
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    All-time usage
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Today's Generations
                  </CardTitle>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {historyLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      stats.generationsToday
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Created today
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span>Monthly Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Credits Used: {stats.creditsUsed.toLocaleString()} / {(stats.creditsUsed + stats.creditsRemaining).toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round((stats.creditsUsed / (stats.creditsUsed + stats.creditsRemaining)) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(stats.creditsUsed / (stats.creditsUsed + stats.creditsRemaining)) * 100}
                    className="h-3"
                  />
                  <p className="text-sm text-gray-500">
                    Pro plan renews in 18 days. <Link to="/dashboard/billing" className="text-blue-600 hover:text-blue-700 font-medium">Manage subscription</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                AI Tools
              </h2>
              <Link to="/dashboard/history">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">
                  View All History
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.name}
                    className="relative bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden"
                  >
                    {action.popular && (
                      <div className="absolute top-6 right-6 z-10">
                        <Badge className="bg-blue-600 text-white border-0 rounded-full px-3 py-1">
                          Popular
                        </Badge>
                      </div>
                    )}
                    <Link to={action.href} className="block p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-0 rounded-full">
                          {action.credits}
                        </Badge>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                        {action.name}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {action.description}
                      </p>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Generations */}
        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Recent Generations
              </h2>
              <Link to="/dashboard/history">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentGenerations.map((generation) => {
                const TypeIcon = getTypeIcon(generation.type);
                return (
                  <Card key={generation.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="aspect-square bg-gray-100 rounded-xl mb-4 relative overflow-hidden">
                        {generation.thumbnail ? (
                          <img
                            src={generation.thumbnail}
                            alt={generation.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TypeIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                            {generation.type === 'video' || generation.type === 'audio' ? (
                              <Button size="sm" className="bg-white/90 hover:bg-white text-gray-900 rounded-lg">
                                <Play className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button size="sm" className="bg-white/90 hover:bg-white text-gray-900 rounded-lg">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" className="bg-white/90 hover:bg-white text-gray-900 rounded-lg">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className="text-xs capitalize bg-blue-100 text-blue-600 border-0 rounded-full">
                            {getTypeName(generation.type)}
                          </Badge>
                          <Button variant="ghost" size="sm" className="p-1 h-auto hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>

                        <h4 className="font-bold text-gray-900 truncate">
                          {generation.title}
                        </h4>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{generation.createdAt}</span>
                          <span className="flex items-center">
                            {generation.credits > 0 ? (
                              <>
                                <Zap className="w-3 h-3 mr-1" />
                                {generation.credits}
                              </>
                            ) : (
                              "Free"
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
};

export default Dashboard;