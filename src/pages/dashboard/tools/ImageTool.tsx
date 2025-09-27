import { useState } from "react";
import { Image, Download, Eye, Upload, X, Plus, Grid3X3, Palette } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const ImageTool = () => {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("photorealistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Array<{
    id: string;
    url: string;
    prompt: string;
    timestamp: Date;
    selected?: boolean;
    downloading?: boolean;
  }>>([]);

  const aspectRatios = [
    { value: "1:1", label: "Square", short: "1:1" },
    { value: "16:9", label: "Landscape", short: "16:9" },
    { value: "9:16", label: "Portrait", short: "9:16" },
    { value: "4:3", label: "Standard", short: "4:3" },
  ];

  const styles = [
    { value: "photorealistic", label: "Realistic" },
    { value: "artistic", label: "Artistic" },
    { value: "cartoon", label: "Cartoon" },
    { value: "anime", label: "Anime" },
    { value: "oil-painting", label: "Oil Paint" },
    { value: "watercolor", label: "Watercolor" },
    { value: "digital-art", label: "Digital" },
    { value: "sketch", label: "Sketch" }
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
        const newImage = {
          id: Date.now().toString(),
          url: result.image_url,
          prompt: prompt,
          timestamp: new Date()
        };

        setGeneratedImages(prev => [newImage, ...prev].slice(0, 12)); // Keep last 12 images

        // Show success message
        console.log('✅ Image generated successfully with Gemini 2.5 Flash Image Preview via OpenRouter - v2025-01-22');
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

  const selectImage = (id: string) => {
    setGeneratedImages(prev => prev.map(img =>
      img.id === id ? { ...img, selected: !img.selected } : { ...img, selected: false }
    ));
  };

  const downloadImage = async (imageId: string, url: string, prompt: string) => {
    console.log("Downloading image:", url, prompt);

    // Set downloading state
    setGeneratedImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, downloading: true } : img
    ));

    try {
      // Create filename from prompt (sanitized)
      const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_').substring(0, 50);
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const filename = `ai_image_${sanitizedPrompt}_${timestamp}.jpg`;

      let blob: Blob;

      if (url.startsWith('data:image/')) {
        // Handle base64 images directly
        const response = await fetch(url);
        blob = await response.blob();
      } else if (url.includes('cloudinary.com')) {
        // Transform Cloudinary URL to high quality for download
        const downloadUrl = url.replace('/upload/', '/upload/q_100,f_jpg,w_3840,h_3840,c_limit,dpr_2.0/');
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        blob = await response.blob();
      } else {
        // Regular URL download
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        blob = await response.blob();
      }

      // Create download link
      const downloadLink = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);

      downloadLink.href = objectUrl;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';

      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Cleanup
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(objectUrl);

      console.log(`✅ Image downloaded successfully: ${filename}`);

      // Show success feedback briefly
      setTimeout(() => {
        setGeneratedImages(prev => prev.map(img =>
          img.id === imageId ? { ...img, downloading: false } : img
        ));
      }, 1000);

    } catch (error) {
      console.error('❌ Download failed:', error);
      alert('Failed to download image. Please try again.');

      // Reset downloading state
      setGeneratedImages(prev => prev.map(img =>
        img.id === imageId ? { ...img, downloading: false } : img
      ));
    }
  };

  const downloadAllImages = async () => {
    const imagesToDownload = generatedImages.filter(img => !img.downloading);

    if (imagesToDownload.length === 0) {
      alert('No images available for download');
      return;
    }

    // Download each image with a small delay to avoid overwhelming the browser
    for (let i = 0; i < imagesToDownload.length; i++) {
      const image = imagesToDownload[i];
      await downloadImage(image.id, image.url, `${image.prompt} (${i + 1})`);

      // Add small delay between downloads
      if (i < imagesToDownload.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
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

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Image Generation</h1>
            <Badge className="bg-blue-100 text-blue-600 border-0 rounded-full">Free</Badge>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-8">
          {/* Input Controls - Full Width */}
          <div className="w-full space-y-6">
            {/* Main Prompt Input */}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="min-h-[268px] flex h-full w-full flex-col justify-between gap-4 rounded-lg bg-white outline-none transition-colors focus-within:border-gray-300 border border-gray-300 p-6 text-gray-900 placeholder-gray-500 resize-none"
              />

              {/* Bottom Controls in Prompt Window */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Reference Image Upload Button */}
                  <Button
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="w-10 h-10 p-0 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center border border-gray-300"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </Button>

                  {/* Aspect Ratio Selector */}
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="w-24 h-10 bg-gray-50 border-gray-300 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">
                      <Grid3X3 className="w-4 h-4 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                      {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value} className="hover:bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{ratio.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Style Selector */}
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="w-24 h-10 bg-gray-50 border-gray-300 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">
                      <Palette className="w-4 h-4 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                      {styles.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="hover:bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{s.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 rounded-lg px-6 py-2 font-medium"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Reference Image Display */}
            {inputImage && (
              <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Reference Image</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={removeInputImage}
                    className="p-1 h-auto text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <img
                  src={inputImage}
                  alt="Reference"
                  className="w-full max-h-32 object-contain rounded"
                />
              </div>
            )}

            {/* Negative Prompt Input */}
            <div>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What you DON'T want in the image (optional)..."
                className="w-full h-16 rounded-lg bg-white border border-gray-300 p-4 text-gray-900 placeholder-gray-500 resize-none focus:border-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Preview Panel - Full Width Below */}
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Generated Images</h2>
                  {generatedImages.length > 0 && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {generatedImages.length}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-6">
                {generatedImages.length === 0 && !isGenerating ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to create</h3>
                      <p className="text-gray-500">Enter a prompt and click Generate to create your first image</p>
                    </div>
                  </div>
                ) : isGenerating ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating image...</h3>
                      <p className="text-gray-500">This usually takes ~2 minutes</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {generatedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-xl flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                              <Button size="sm" className="bg-white/90 hover:bg-white text-gray-900 rounded-lg">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-white/90 hover:bg-white text-gray-900 rounded-lg"
                                onClick={() => downloadImage(image.id, image.url, image.prompt)}
                                disabled={image.downloading}
                              >
                                {image.downloading ? (
                                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-gray-700 font-medium truncate">{image.prompt}</p>
                          <p className="text-xs text-gray-500">{image.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ImageTool;