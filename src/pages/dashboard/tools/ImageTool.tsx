import { useState } from "react";
import { Image, Download, Sparkles, RefreshCw, Eye, Grid3X3, Palette, Upload, X } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ToolEditorLayout from "@/components/dashboard/ToolEditorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const ImageTool = () => {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("photorealistic");
  const [numberOfImages, setNumberOfImages] = useState("1");
  const [seed, setSeed] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputImage, setInputImage] = useState<string | null>(null);
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


  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!isAuthenticated) {
      alert('Please sign in to generate images');
      return;
    }

    setIsGenerating(true);

    try {
      // Call the API using the authenticated client
      const result = await api.generateImage({
        prompt: prompt,
        image_input: inputImage, // Optional base64 image
        style: style,
        aspect_ratio: aspectRatio,
        quality: 'high'
      });

      if (result.success && result.image_url) {
        const newImages = Array.from({ length: parseInt(numberOfImages) }, (_, index) => ({
          id: Date.now().toString() + index,
          url: result.image_url,
          prompt: prompt,
          timestamp: new Date()
        }));

        setGeneratedImages(prev => [...newImages, ...prev].slice(0, 12)); // Keep last 12 images

        // Show success message
        console.log('✅ Image generated successfully with Gemini 2.5 Flash');
      } else {
        // Show error message instead of fallback to mock images
        const errorMessage = result.error || 'Image generation failed';
        console.error('❌ Image generation failed:', errorMessage);
        alert(`Image generation failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Image generation error:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unable to connect to image generation service'}`);
    }

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image file size should be less than 10MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setInputImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeInputImage = () => {
    setInputImage(null);
    // Clear the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
              <p className="text-sm text-gray-500 mt-2">This usually takes ~2 minutes with buffer for reliability</p>
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
        credits="30 credits (after free limit)"
        estimatedTime="~2m"
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

            {/* Image Input Section */}
            <div>
              <Label>Reference Image (Optional)</Label>
              <div className="mt-2">
                {!inputImage ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Upload reference image
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        JPG, PNG, WebP up to 10MB (optional)
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Choose Image
                      </Button>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={inputImage}
                      alt="Reference input"
                      className="w-full max-h-48 object-contain rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={removeInputImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                      ✓ Reference image will be used with your text prompt for enhanced generation
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Gemini 2.5 Flash can use both text and image inputs for better results
              </p>
            </div>

            {/* Pricing Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                💳 Image Generation Pricing
              </h4>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Free Plan:</strong> 3 images per month</p>
                <p><strong>Pro Plan:</strong> 50 images per month</p>
                <p><strong>After limits:</strong> 30 credits per image</p>
                <p className="mt-2 text-blue-600 dark:text-blue-400">
                  Processing: ~2 minutes (1m generation + 1m buffer)
                </p>
              </div>
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