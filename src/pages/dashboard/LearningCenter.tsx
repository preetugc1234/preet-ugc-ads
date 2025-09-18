import { useState } from "react";
import { BookOpen, Play, Clock, User, Star, Search, Filter, ChevronRight, Lightbulb, Video, FileText, Bookmark, Download, Eye } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const LearningCenter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // Tutorial data
  const tutorials = [
    {
      id: "tutorial_001",
      title: "Getting Started with AI Image Generation",
      description: "Learn the basics of creating stunning AI images with effective prompts and settings.",
      category: "image",
      difficulty: "beginner",
      duration: "8 min",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "https://example.com/video1",
      instructor: "Sarah Chen",
      rating: 4.8,
      views: 12500,
      tags: ["prompting", "basics", "creativity"]
    },
    {
      id: "tutorial_002",
      title: "Advanced Video Generation Techniques",
      description: "Master the art of creating professional UGC videos with custom audio and effects.",
      category: "video",
      difficulty: "advanced",
      duration: "15 min",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "https://example.com/video2",
      instructor: "Mike Rodriguez",
      rating: 4.9,
      views: 8900,
      tags: ["ugc", "audio", "effects"]
    },
    {
      id: "tutorial_003",
      title: "Voice Selection and TTS Optimization",
      description: "Choose the perfect voice and optimize text-to-speech settings for your content.",
      category: "audio",
      difficulty: "intermediate",
      duration: "10 min",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "https://example.com/video3",
      instructor: "Emma Watson",
      rating: 4.7,
      views: 6200,
      tags: ["voice", "tts", "optimization"]
    },
    {
      id: "tutorial_004",
      title: "Prompt Engineering Masterclass",
      description: "Learn advanced prompting techniques to get exactly what you want from AI.",
      category: "prompting",
      difficulty: "advanced",
      duration: "20 min",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "https://example.com/video4",
      instructor: "Alex Thompson",
      rating: 4.9,
      views: 15600,
      tags: ["prompts", "advanced", "techniques"]
    },
    {
      id: "tutorial_005",
      title: "Credits Management and Cost Optimization",
      description: "Maximize your credits and optimize costs for different AI generation tasks.",
      category: "tips",
      difficulty: "beginner",
      duration: "6 min",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "https://example.com/video5",
      instructor: "David Park",
      rating: 4.6,
      views: 9300,
      tags: ["credits", "optimization", "budgeting"]
    },
    {
      id: "tutorial_006",
      title: "Creating Cinematic Videos with AI",
      description: "Professional techniques for creating movie-quality videos using our AI tools.",
      category: "video",
      difficulty: "intermediate",
      duration: "18 min",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "https://example.com/video6",
      instructor: "Lisa Chang",
      rating: 4.8,
      views: 7800,
      tags: ["cinematic", "professional", "quality"]
    }
  ];

  // Template data
  const templates = [
    {
      id: "template_001",
      title: "Product Photography Prompts",
      description: "Ready-to-use prompts for stunning product images",
      category: "image",
      prompts: [
        "Professional product photography of [product], clean white background, studio lighting, high resolution, commercial style",
        "Minimalist product shot of [product], soft shadows, elegant composition, premium feel",
        "[Product] on marble surface, natural lighting, lifestyle photography, Instagram worthy"
      ],
      downloads: 2400,
      rating: 4.7
    },
    {
      id: "template_002",
      title: "Social Media Video Scripts",
      description: "Engaging video scripts for different platforms",
      category: "video",
      prompts: [
        "Create a 30-second product demo video showcasing [product features], upbeat music, quick cuts",
        "Generate educational content about [topic], clear narration, visual examples, engaging pace",
        "Lifestyle video featuring [product] in daily use, natural setting, authentic feel"
      ],
      downloads: 1800,
      rating: 4.8
    },
    {
      id: "template_003",
      title: "Professional Voice Scripts",
      description: "Scripts optimized for text-to-speech conversion",
      category: "audio",
      prompts: [
        "Welcome to our presentation about [topic]. Today we'll explore [key points] and discover [benefits].",
        "Thank you for choosing [brand]. This tutorial will guide you through [process] step by step.",
        "Introducing [product name] - the solution that [value proposition]. Let's see how it works."
      ],
      downloads: 1200,
      rating: 4.6
    },
    {
      id: "template_004",
      title: "Creative Art Prompts",
      description: "Artistic and creative image generation prompts",
      category: "image",
      prompts: [
        "Digital art of [subject], vibrant colors, abstract style, modern composition, trending on artstation",
        "Watercolor painting of [scene], soft brush strokes, pastel colors, dreamy atmosphere",
        "Photorealistic portrait of [character], dramatic lighting, cinematic mood, high detail"
      ],
      downloads: 3100,
      rating: 4.9
    }
  ];

  // FAQ data
  const faqs = [
    {
      id: "faq_001",
      question: "How do I write effective prompts for AI image generation?",
      answer: "Start with a clear description of what you want, include style keywords (e.g., 'photorealistic', 'cartoon'), specify lighting and composition, and use descriptive adjectives. Be specific but not overly complex.",
      category: "prompting",
      videoUrl: "https://example.com/faq1"
    },
    {
      id: "faq_002",
      question: "What's the difference between preview and final quality?",
      answer: "Previews are generated quickly at lower resolution to help you review the result before spending credits on the final high-quality version. Finals take longer but provide the best quality for download.",
      category: "basics",
      videoUrl: "https://example.com/faq2"
    },
    {
      id: "faq_003",
      question: "How can I reduce credit usage?",
      answer: "Use lower quality settings for testing, generate shorter videos when possible, take advantage of free tools (chat and image generation), and use previews to validate before final generation.",
      category: "credits",
      videoUrl: "https://example.com/faq3"
    },
    {
      id: "faq_004",
      question: "Which voice should I choose for text-to-speech?",
      answer: "Consider your content type: professional voices for business, natural voices for educational content, and energetic voices for social media. Test different voices with preview to find the best match.",
      category: "audio",
      videoUrl: "https://example.com/faq4"
    },
    {
      id: "faq_005",
      question: "How do I create better UGC videos?",
      answer: "Focus on authentic scenarios, use high-quality source images, keep audio clear and engaging, ensure good pacing, and match the video style to your target platform (TikTok, Instagram, etc.).",
      category: "video",
      videoUrl: "https://example.com/faq5"
    }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "image", label: "Image Generation" },
    { value: "video", label: "Video Creation" },
    { value: "audio", label: "Audio & Voice" },
    { value: "prompting", label: "Prompt Engineering" },
    { value: "tips", label: "Tips & Tricks" }
  ];

  const difficulties = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || tutorial.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || tutorial.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "image": return "🎨";
      case "video": return "🎬";
      case "audio": return "🎵";
      case "prompting": return "✨";
      case "tips": return "💡";
      default: return "📚";
    }
  };

  const handleWatchTutorial = (tutorial: any) => {
    toast({
      title: "Opening Tutorial",
      description: `Starting "${tutorial.title}"...`,
    });
    // In a real app, this would open the video player
  };

  const handleDownloadTemplate = (template: any) => {
    toast({
      title: "Template Downloaded",
      description: `"${template.title}" has been added to your templates.`,
    });
  };

  const handleWatchFAQ = (faq: any) => {
    toast({
      title: "Opening FAQ Video",
      description: `Playing explanation for: "${faq.question}"`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Learning Center</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Master AI content creation with tutorials, templates, and guides
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="text-sm">
              {tutorials.length} Tutorials
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {templates.length} Templates
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tutorials, templates, and guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="tutorials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tutorials">Video Tutorials</TabsTrigger>
            <TabsTrigger value="templates">Prompt Templates</TabsTrigger>
            <TabsTrigger value="faq">FAQ & Guides</TabsTrigger>
          </TabsList>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-6">
            {filteredTutorials.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Video className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No tutorials found
                  </h3>
                  <p className="text-gray-500 text-center">
                    Try adjusting your search terms or filters to find more content.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        className="w-full h-48 object-cover bg-gray-200 dark:bg-gray-700"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          onClick={() => handleWatchTutorial(tutorial)}
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Watch Tutorial
                        </Button>
                      </div>
                      <Badge className={`absolute top-2 right-2 ${getDifficultyColor(tutorial.difficulty)}`}>
                        {tutorial.difficulty}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(tutorial.category)}</span>
                        <Badge variant="outline" className="text-xs">
                          {tutorial.category}
                        </Badge>
                      </div>

                      <h3 className="font-semibold mb-2 line-clamp-2">{tutorial.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {tutorial.description}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {tutorial.instructor.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {tutorial.instructor}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{tutorial.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{tutorial.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{tutorial.views.toLocaleString()} views</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {tutorial.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No templates found
                  </h3>
                  <p className="text-gray-500 text-center">
                    Try adjusting your search terms or category filter.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                          <div>
                            <CardTitle className="text-lg">{template.title}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {template.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDownloadTemplate(template)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Use
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Sample Prompts:</h4>
                        {template.prompts.slice(0, 2).map((prompt, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm italic">"{prompt}"</p>
                          </div>
                        ))}
                        {template.prompts.length > 2 && (
                          <p className="text-sm text-gray-500">
                            +{template.prompts.length - 2} more prompts...
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>{template.downloads.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{template.rating}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Lightbulb className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No FAQs found
                  </h3>
                  <p className="text-gray-500 text-center">
                    Try different search terms to find answers to your questions.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <Card key={faq.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{faq.question}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {faq.answer}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handleWatchFAQ(faq)}
                          size="sm"
                          variant="outline"
                          className="ml-4"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Watch
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LearningCenter;