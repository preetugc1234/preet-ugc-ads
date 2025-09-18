import { useState } from "react";
import { Video, Upload, Play, Download, Clock, FileImage } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ToolEditorLayout from "@/components/dashboard/ToolEditorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const ImageToVideoTool = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [duration, setDuration] = useState("5");
  const [quality, setQuality] = useState("hd");
  const [motionPrompt, setMotionPrompt] = useState("");
  const [intensity, setIntensity] = useState([0.7]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<{
    id: string;
    previewUrl: string;
    finalUrl: string;
    prompt: string;
    timestamp: Date;
    status: 'preview' | 'final';
  } | null>(null);

  const durations = [
    { value: "5", label: "5 seconds", credits: 100 },
    { value: "10", label: "10 seconds", credits: 200 }
  ];

  const qualities = [
    { value: "hd", label: "HD (720p)", description: "Good quality, faster" },
    { value: "fhd", label: "Full HD (1080p)", description: "High quality" },
    { value: "4k", label: "4K (2160p)", description: "Ultra quality, slower" }
  ];

  const motionTemplates = [
    "Gentle camera pan from left to right",
    "Slow zoom in towards the center",
    "Subtle parallax effect on background elements",
    "Gentle swaying motion like a breeze",
    "Smooth rotation around the main subject",
    "Cinematic dolly movement forward"
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return;

    setIsGenerating(true);

    // Simulate preview generation (faster)
    setTimeout(() => {
      setGeneratedVideo({
        id: Date.now().toString(),
        previewUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", // Mock preview
        finalUrl: "",
        prompt: motionPrompt || "Default camera movement",
        timestamp: new Date(),
        status: 'preview'
      });
    }, 3000);

    // Simulate final generation (slower)
    setTimeout(() => {
      setGeneratedVideo(prev => prev ? {
        ...prev,
        finalUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4", // Mock final
        status: 'final'
      } : null);
      setIsGenerating(false);
    }, 8000);
  };

  const calculateCost = () => {
    const baseCost = durations.find(d => d.value === duration)?.credits || 100;
    const qualityMultiplier = quality === '4k' ? 2 : quality === 'fhd' ? 1.5 : 1;
    return Math.round(baseCost * qualityMultiplier);
  };

  const costBreakdown = {
    baseCost: durations.find(d => d.value === duration)?.credits || 100,
    additionalCosts: quality !== 'hd' ? [
      { name: quality === '4k' ? '4K Quality' : 'Full HD Quality',
        cost: quality === '4k' ? 100 : 50 }
    ] : undefined,
    total: calculateCost()
  };

  const previewPane = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <Video className="w-5 h-5 mr-2" />
          Generated Video
          {generatedVideo && (
            <Badge variant={generatedVideo.status === 'final' ? 'default' : 'secondary'} className="ml-2">
              {generatedVideo.status === 'final' ? 'Final' : 'Preview'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!generatedVideo && !isGenerating && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No video generated yet
            </p>
            <p className="text-sm text-gray-400">
              Upload an image and click Generate to create a video
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-600 font-medium">Generating video...</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">
                  {generatedVideo?.status === 'preview' ? 'Creating final version...' : 'Creating preview...'}
                </div>
                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: generatedVideo?.status === 'preview' ? '60%' : '30%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {generatedVideo && (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                controls
                className="w-full h-full"
                poster={uploadedImage || undefined}
              >
                <source
                  src={generatedVideo.status === 'final' ? generatedVideo.finalUrl : generatedVideo.previewUrl}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Duration:</strong> {duration} seconds</p>
                <p><strong>Quality:</strong> {qualities.find(q => q.value === quality)?.label}</p>
                <p><strong>Generated:</strong> {generatedVideo.timestamp.toLocaleString()}</p>
              </div>
              <div className="flex space-x-2">
                {generatedVideo.status === 'final' ? (
                  <Button onClick={() => console.log('Download final video')}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    <Clock className="w-4 h-4 mr-2" />
                    Finalizing...
                  </Button>
                )}
              </div>
            </div>

            {generatedVideo.status !== 'final' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Preview Ready!</strong> Your final high-quality video is still processing.
                  You can download it once complete.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <ToolEditorLayout
        toolName="Image to Video"
        toolIcon={Video}
        credits="100-200/video"
        estimatedTime="~45s"
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        canGenerate={!!uploadedImage}
        costBreakdown={costBreakdown}
        previewPane={previewPane}
      >
        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <FileImage className="w-4 h-4 mr-2" />
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              {uploadedImage ? (
                <div className="text-center">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="mx-auto max-h-48 rounded-lg shadow-md"
                  />
                  <div className="mt-4 space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      Change Image
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setUploadedImage(null)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Click to upload an image
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports JPG, PNG, WebP up to 10MB
                  </p>
                  <Button
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Video Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Video Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      <div className="flex justify-between w-full">
                        <span>{d.label}</span>
                        <span className="text-xs text-gray-500 ml-4">{d.credits} credits</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualities.map((q) => (
                    <SelectItem key={q.value} value={q.value}>
                      <div>
                        <div className="font-medium">{q.label}</div>
                        <div className="text-xs text-gray-500">{q.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Motion Intensity: {intensity[0]}</Label>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                max={1}
                min={0.1}
                step={0.1}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower = subtle motion, Higher = dramatic motion
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Motion Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Motion Description (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="motionPrompt">Describe the motion</Label>
              <Textarea
                id="motionPrompt"
                placeholder="Describe how you want the image to move..."
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank for automatic motion generation
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Motion Templates</Label>
              {motionTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2 text-xs w-full"
                  onClick={() => setMotionPrompt(template)}
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

export default ImageToVideoTool;