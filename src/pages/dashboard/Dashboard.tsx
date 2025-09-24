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
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name || 'there'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ready to create something amazing? Choose a tool below to get started.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Generations
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  stats.totalGenerations.toLocaleString()
                )}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                All-time creations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Credits Remaining
              </CardTitle>
              <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {balanceLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  stats.creditsRemaining.toLocaleString()
                )}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                {user?.plan?.toUpperCase() || 'FREE'} plan active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Credits Used
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  stats.creditsUsed.toLocaleString()
                )}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                All-time usage
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Today's Generations
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {historyLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  stats.generationsToday
                )}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Created today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Monthly Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Credits Used: {stats.creditsUsed.toLocaleString()} / {(stats.creditsUsed + stats.creditsRemaining).toLocaleString()}
                </span>
                <span className="text-sm font-medium">
                  {Math.round((stats.creditsUsed / (stats.creditsUsed + stats.creditsRemaining)) * 100)}%
                </span>
              </div>
              <Progress
                value={(stats.creditsUsed / (stats.creditsUsed + stats.creditsRemaining)) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pro plan renews in 18 days. <Link to="/dashboard/billing" className="text-blue-600 hover:text-blue-500">Manage subscription</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI Tools
            </h2>
            <Link to="/dashboard/history">
              <Button variant="outline" size="sm">
                View All History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.name}
                  className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                  {action.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                        Popular
                      </Badge>
                    </div>
                  )}
                  <Link to={action.href} className="block">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {action.credits}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {action.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Generations */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Generations
            </h2>
            <Link to="/dashboard/history">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentGenerations.map((generation) => {
              const TypeIcon = getTypeIcon(generation.type);
              return (
                <Card key={generation.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 relative overflow-hidden">
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
                            <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                              <Play className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">
                          {getTypeName(generation.type)}
                        </Badge>
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {generation.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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

    </DashboardLayout>
  );
};

export default Dashboard;