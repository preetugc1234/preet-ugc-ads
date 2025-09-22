import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { History as HistoryIcon, Grid3X3, List, Play, Download, Eye, Trash2, MoreVertical, Search, Calendar, Zap, Filter } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Generation {
  id: string;
  type: 'chat' | 'image' | 'img2vid_noaudio' | 'tts' | 'img2vid_audio' | 'audio2vid';
  title: string;
  prompt?: string;
  thumbnail?: string;
  previewUrl?: string;
  finalUrl: string;
  credits: number;
  timestamp: Date;
  status: 'completed' | 'processing' | 'failed';
  metadata?: {
    duration?: number;
    dimensions?: string;
    fileSize?: string;
    model?: string;
  };
}

const History = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch user history from API
  const { data: userHistory, isLoading, error, refetch } = useQuery({
    queryKey: ['userHistory', 100], // Fetch more items for history page
    queryFn: () => api.getUserHistory(100),
    enabled: isAuthenticated,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false
  });

  // Transform API data to match our Generation interface
  const generations: Generation[] = userHistory?.generations?.map(gen => ({
    id: gen.id,
    type: mapApiTypeToDisplayType(gen.type),
    title: generateDisplayTitle(gen.type, gen.preview_url),
    prompt: undefined, // API doesn't store prompts currently
    thumbnail: gen.preview_url,
    previewUrl: gen.preview_url,
    finalUrl: gen.final_urls?.[0] || gen.preview_url || "#",
    credits: gen.credit_cost || 0,
    timestamp: new Date(gen.created_at),
    status: (gen.status as 'completed' | 'processing' | 'failed') || 'completed',
    metadata: {
      fileSize: `${(gen.size_bytes / (1024 * 1024)).toFixed(1)} MB`,
      dimensions: gen.type.includes('video') ? "1920×1080" : undefined
    }
  })) || [];

  // Map API module types to display types
  function mapApiTypeToDisplayType(apiType: string): Generation['type'] {
    switch (apiType) {
      case 'chat': return 'chat';
      case 'image': return 'image';
      case 'img2vid_noaudio': return 'img2vid_noaudio';
      case 'img2vid_audio': return 'img2vid_audio';
      case 'audio2vid': return 'audio2vid';
      case 'tts': return 'tts';
      default: return 'image';
    }
  }

  // Generate display titles based on type
  function generateDisplayTitle(type: string, previewUrl?: string): string {
    const typeNames = {
      'chat': 'AI Chat Response',
      'image': 'AI Generated Image',
      'img2vid_noaudio': 'Image to Video',
      'img2vid_audio': 'Image to Video with Audio',
      'audio2vid': 'Audio to Video',
      'tts': 'Text to Speech'
    };
    return typeNames[type as keyof typeof typeNames] || 'Generated Content';
  }

  const filterGenerations = () => {
    let filtered = generations;

    // Filter by type (map old types to new API types)
    if (activeTab !== "all") {
      const typeMapping: Record<string, string[]> = {
        'chat': ['chat'],
        'image': ['image'],
        'audio': ['tts', 'audio2vid'],
        'video': ['img2vid_noaudio', 'img2vid_audio'],
        'ugc': ['audio2vid'] // UGC is mainly audio-to-video
      };

      const allowedTypes = typeMapping[activeTab] || [activeTab];
      filtered = filtered.filter(gen => allowedTypes.includes(gen.type));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(gen =>
        gen.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (gen.prompt && gen.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.timestamp.getTime() - a.timestamp.getTime();
        case "oldest":
          return a.timestamp.getTime() - b.timestamp.getTime();
        case "credits-high":
          return b.credits - a.credits;
        case "credits-low":
          return a.credits - b.credits;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredGenerations = filterGenerations();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return "🖼️";
      case 'img2vid_noaudio':
      case 'img2vid_audio': return "🎬";
      case 'tts':
      case 'audio2vid': return "🎵";
      case 'chat': return "💬";
      default: return "📄";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'image': return 'Image';
      case 'img2vid_noaudio': return 'Image→Video';
      case 'img2vid_audio': return 'Image→Video+Audio';
      case 'tts': return 'Text-to-Speech';
      case 'audio2vid': return 'Audio→Video';
      case 'chat': return 'Chat';
      default: return 'Unknown';
    }
  };

  const handlePlay = (generation: Generation) => {
    if (generation.type === 'video' || generation.type === 'audio' || generation.type === 'ugc') {
      console.log("Playing:", generation.title);
      toast.info(`Playing: ${generation.title}`);
    } else {
      handleView(generation);
    }
  };

  const handleView = (generation: Generation) => {
    console.log("Viewing:", generation.title);
    toast.info(`Viewing: ${generation.title}`);
  };

  const handleDownload = (generation: Generation) => {
    console.log("Downloading:", generation.title);
    toast.success(`Downloading: ${generation.title}`);
  };

  const handleDelete = (generation: Generation) => {
    setSelectedGeneration(generation);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedGeneration) {
      try {
        await api.deleteGeneration(selectedGeneration.id);
        toast.success(`Deleted: ${selectedGeneration.title}`);

        // Refetch the history to update the UI
        refetch();
      } catch (error) {
        console.error('Failed to delete generation:', error);
        toast.error(`Failed to delete: ${selectedGeneration.title}`);
      }
    }
    setShowDeleteDialog(false);
    setSelectedGeneration(null);
  };

  const getTabCount = (type: string) => {
    if (type === "all") return generations.length;

    const typeMapping: Record<string, string[]> = {
      'chat': ['chat'],
      'image': ['image'],
      'audio': ['tts', 'audio2vid'],
      'video': ['img2vid_noaudio', 'img2vid_audio'],
      'ugc': ['audio2vid']
    };

    const allowedTypes = typeMapping[type] || [type];
    return generations.filter(gen => allowedTypes.includes(gen.type)).length;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <HistoryIcon className="w-8 h-8 mr-3" />
              Generation History
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              View and manage your AI-generated content
            </p>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <HistoryIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{generations.length}/30</p>
                  <p className="text-xs text-gray-500">Items saved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{generations.reduce((sum, gen) => sum + gen.credits, 0)}</p>
                  <p className="text-xs text-gray-500">Credits used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{generations.filter(g => {
                    const today = new Date();
                    return g.timestamp.toDateString() === today.toDateString();
                  }).length}</p>
                  <p className="text-xs text-gray-500">Created today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Storage</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${(generations.length / 30) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {30 - generations.length} slots remaining
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search generations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="credits-high">Credits (High)</SelectItem>
              <SelectItem value="credits-low">Credits (Low)</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <span>All</span>
              <Badge variant="secondary" className="text-xs">
                {getTabCount("all")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <span>💬</span>
              <span>Chat</span>
              <Badge variant="secondary" className="text-xs">
                {getTabCount("chat")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center space-x-2">
              <span>🖼️</span>
              <span>Images</span>
              <Badge variant="secondary" className="text-xs">
                {getTabCount("image")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center space-x-2">
              <span>🎵</span>
              <span>Audio</span>
              <Badge variant="secondary" className="text-xs">
                {getTabCount("audio")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center space-x-2">
              <span>🎬</span>
              <span>Video</span>
              <Badge variant="secondary" className="text-xs">
                {getTabCount("video")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ugc" className="flex items-center space-x-2">
              <span>🎨</span>
              <span>UGC</span>
              <Badge variant="secondary" className="text-xs">
                {getTabCount("ugc")}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="w-full h-32 mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <HistoryIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Failed to load history</h3>
                  <p className="text-gray-500 mb-4">
                    There was an error loading your generation history.
                  </p>
                  <Button onClick={() => refetch()} variant="outline">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : filteredGenerations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <HistoryIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No generations found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? "Try adjusting your search terms" : "Start creating content to see your history"}
                  </p>
                  {searchTerm && (
                    <Button onClick={() => setSearchTerm("")} variant="outline">
                      Clear search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === "grid" ?
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" :
                "space-y-4"
              }>
                {filteredGenerations.map((generation) => (
                  <Card key={generation.id} className="group hover:shadow-lg transition-all duration-200">
                    <CardContent className={viewMode === "grid" ? "p-4" : "p-4"}>
                      {viewMode === "grid" ? (
                        // Grid View
                        <div className="space-y-3">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                            {generation.thumbnail ? (
                              <img
                                src={generation.thumbnail}
                                alt={generation.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">
                                {getTypeIcon(generation.type)}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                <Button size="sm" variant="secondary" onClick={() => handlePlay(generation)}>
                                  {generation.type === 'video' || generation.type === 'audio' || generation.type === 'ugc' ?
                                    <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />
                                  }
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => handleDownload(generation)}>
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {getTypeName(generation.type)}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handlePlay(generation)}>
                                    {generation.type === 'video' || generation.type === 'audio' || generation.type === 'ugc' ?
                                      <>Play<Play className="w-4 h-4 ml-2" /></> :
                                      <>View<Eye className="w-4 h-4 ml-2" /></>
                                    }
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(generation)}>
                                    Download<Download className="w-4 h-4 ml-2" />
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(generation)}
                                    className="text-red-600"
                                  >
                                    Delete<Trash2 className="w-4 h-4 ml-2" />
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <h4 className="font-medium text-sm line-clamp-2">{generation.title}</h4>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatTimeAgo(generation.timestamp)}</span>
                              {generation.credits > 0 && (
                                <span className="flex items-center">
                                  <Zap className="w-3 h-3 mr-1" />
                                  {generation.credits}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // List View
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                            {generation.thumbnail ? (
                              <img
                                src={generation.thumbnail}
                                alt={generation.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                {getTypeIcon(generation.type)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {getTypeName(generation.type)}
                              </Badge>
                              {generation.metadata?.duration && (
                                <span className="text-xs text-gray-500">
                                  {Math.floor(generation.metadata.duration / 60)}:{(generation.metadata.duration % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium truncate">{generation.title}</h4>
                            <p className="text-sm text-gray-500 truncate">{generation.prompt}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{formatTimeAgo(generation.timestamp)}</span>
                              {generation.credits > 0 && (
                                <span className="flex items-center">
                                  <Zap className="w-3 h-3 mr-1" />
                                  {generation.credits} credits
                                </span>
                              )}
                              {generation.metadata?.fileSize && (
                                <span>{generation.metadata.fileSize}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handlePlay(generation)}>
                              {generation.type === 'video' || generation.type === 'audio' || generation.type === 'ugc' ?
                                <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />
                              }
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownload(generation)}>
                              <Download className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDelete(generation)} className="text-red-600">
                                  Delete<Trash2 className="w-4 h-4 ml-2" />
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        {generations.length >= 25 && (
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 dark:text-amber-400">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Approaching storage limit
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    You have {30 - generations.length} slots remaining. When full, oldest items will be automatically removed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Generation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedGeneration?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default History;