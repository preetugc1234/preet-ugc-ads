import { useState } from "react";
import { Image, Download, Sparkles, RefreshCw, Eye, Grid3X3, Palette } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ToolEditorLayout from "@/components/dashboard/ToolEditorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ImageTool = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("photorealistic");
  const [numberOfImages, setNumberOfImages] = useState("1");
  const [seed, setSeed] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{
    id: string;
    url: string;
    prompt: string;
    timestamp: Date;
    selected?: boolean;
  }>>([]);

  const aspectRatios = [
    { value: "1:1", label: "Square (1:1)", dimensions: "1024×1024" },
    { value: "16:9", label: "Landscape (16:9)", dimensions: "1920×1080" },
    { value: "9:16", label: "Portrait (9:16)", dimensions: "1080×1920" },
    { value: "4:3", label: "Standard (4:3)", dimensions: "1024×768" },
    { value: "3:2", label: "Photo (3:2)", dimensions: "1024×683" }
  ];

  const styles = [
    { value: "photorealistic", label: "Photorealistic", description: "Realistic photos" },
    { value: "artistic", label: "Artistic", description: "Artistic interpretation" },
    { value: "cartoon", label: "Cartoon", description: "Cartoon style" },
    { value: "anime", label: "Anime", description: "Anime/manga style" },
    { value: "oil-painting", label: "Oil Painting", description: "Classical painting" },
    { value: "watercolor", label: "Watercolor", description: "Watercolor painting" },
    { value: "digital-art", label: "Digital Art", description: "Modern digital art" },
    { value: "sketch", label: "Sketch", description: "Pencil sketch" }
  ];

  const promptTemplates = [
    "A serene landscape with mountains and a lake at sunset",
    "Portrait of a person in professional lighting",
    "Modern architecture building with glass facade",
    "Abstract geometric patterns in vibrant colors",
    "Cute cartoon character in a magical forest",
    "Product photography of a luxury watch on marble",
    "Fantasy dragon soaring through cloudy skies",
    "Minimalist interior design with natural lighting"
  ];

  // Mock generated images for demo
  const mockImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=512&h=512&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=512&h=512&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=512&h=512&fit=crop&crop=center"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newImages = Array.from({ length: parseInt(numberOfImages) }, (_, index) => ({
      id: Date.now().toString() + index,
      url: mockImages[index % mockImages.length],
      prompt: prompt,
      timestamp: new Date()
    }));

    setGeneratedImages(prev => [...newImages, ...prev].slice(0, 12)); // Keep last 12 images
    setIsGenerating(false);
  };

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 999999999).toString());
  };

  const selectImage = (id: string) => {
    setGeneratedImages(prev => prev.map(img =>
      img.id === id ? { ...img, selected: !img.selected } : { ...img, selected: false }
    ));
  };

  const downloadImage = (url: string, prompt: string) => {
    // In real implementation, this would download the actual image
    console.log("Downloading image:", url, prompt);
  };

  const previewPane = (
    <div className="space-y-4">
      {/* Generated Images Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <Image className="w-5 h-5 mr-2" />
            Generated Images
            {generatedImages.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {generatedImages.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedImages.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No images generated yet
              </p>
              <p className="text-sm text-gray-400">
                Enter a prompt and click Generate to create images
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {generatedImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    image.selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => selectImage(image.id)}
                >
                  <div className="aspect-square">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <Button size="sm" variant="secondary" onClick={(e) => {
                          e.stopPropagation();
                          // View full size
                        }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(image.url, image.prompt);
                        }}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={image.prompt}>
                      {image.prompt}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {image.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-600 font-medium">Generating images...</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">This usually takes 15-30 seconds</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <ToolEditorLayout
        toolName="Image Generation"
        toolIcon={Image}
        credits="Free"
        estimatedTime="~20s"
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        canGenerate={!!prompt.trim()}
        previewPane={previewPane}
      >
        {/* Prompt Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Describe Your Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific and descriptive for better results
              </p>
            </div>

            <div>
              <Label htmlFor="negativePrompt">Negative Prompt (Optional)</Label>
              <Textarea
                id="negativePrompt"
                placeholder="What you DON'T want in the image..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="min-h-[60px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify things to avoid in the generated image
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Image Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Image Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value}>
                      <div>
                        <div className="font-medium">{ratio.label}</div>
                        <div className="text-xs text-gray-500">{ratio.dimensions}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div>
                        <div className="font-medium">{s.label}</div>
                        <div className="text-xs text-gray-500">{s.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Number of Images</Label>
              <Select value={numberOfImages} onValueChange={setNumberOfImages}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Image</SelectItem>
                  <SelectItem value="2">2 Images</SelectItem>
                  <SelectItem value="3">3 Images</SelectItem>
                  <SelectItem value="4">4 Images</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Seed (Optional)</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Random seed for reproducibility"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                />
                <Button variant="outline" size="icon" onClick={generateRandomSeed}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Same seed + prompt = same image
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Prompt Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {promptTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2 text-xs"
                  onClick={() => setPrompt(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </ToolEditorLayout>
    </DashboardLayout>
  );
};

export default ImageTool;