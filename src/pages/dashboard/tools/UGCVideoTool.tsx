import { useState } from "react";
import { Film, Upload, Play, Download, Music, Image, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ToolEditorLayout from "@/components/dashboard/ToolEditorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const UGCVideoTool = () => {
  const [mode, setMode] = useState("audio-to-video");
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [duration, setDuration] = useState("5");
  const [template, setTemplate] = useState("default");
  const [motionPrompt, setMotionPrompt] = useState("");
  const [intensity, setIntensity] = useState([0.7]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<{
    id: string;
    previewUrl: string;
    finalUrl: string;
    mode: string;
    timestamp: Date;
    status: 'preview' | 'final';
  } | null>(null);

  const audioTemplates = [
    { value: "podcast", label: "Podcast Style", description: "Audio waveforms with podcast branding" },
    { value: "music", label: "Music Visualizer", description: "Dynamic music visualization" },
    { value: "speech", label: "Speech Bubbles", description: "Animated text with speech bubbles" },
    { value: "minimal", label: "Minimal Wave", description: "Clean, minimal audio waves" },
    { value: "corporate", label: "Corporate", description: "Professional business style" }
  ];

  const durations = [
    { value: "5", label: "5 seconds", credits: 200 },
    { value: "10", label: "10 seconds", credits: 400 }
  ];

  const motionTemplates = [
    "Gentle camera pan from left to right",
    "Slow zoom in towards the center",
    "Subtle parallax effect on background elements",
    "Cinematic dolly movement forward",
    "Smooth rotation around the main subject"
  ];

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedAudio(url);
    }
  };

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
    const canGenerate = mode === "audio-to-video" ? uploadedAudio : uploadedImage && uploadedAudio;
    if (!canGenerate) return;

    setIsGenerating(true);

    // Simulate generation process
    setTimeout(() => {
      setGeneratedVideo({
        id: Date.now().toString(),
        previewUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        finalUrl: "",
        mode: mode,
        timestamp: new Date(),
        status: 'preview'
      });
    }, 4000);

    // Final generation
    setTimeout(() => {
      setGeneratedVideo(prev => prev ? {
        ...prev,
        finalUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
        status: 'final'
      } : null);
      setIsGenerating(false);
    }, 10000);
  };

  const calculateCost = () => {
    if (mode === "audio-to-video") {
      return 100; // 100 credits per minute, minimum 100
    } else {
      // Image to Video with Audio
      const baseCost = durations.find(d => d.value === duration)?.credits || 200;
      return baseCost;
    }
  };

  const costBreakdown = {
    baseCost: mode === "audio-to-video" ? 100 : (duration === "5" ? 200 : 400),
    additionalCosts: mode === "image-to-video-audio" ? [] : undefined,
    total: calculateCost()
  };

  const canGenerate = mode === "audio-to-video" ? uploadedAudio : (uploadedImage && uploadedAudio);

  const previewPane = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <Film className="w-5 h-5 mr-2" />
          UGC Video Preview
          <Badge variant="secondary" className="ml-2 capitalize">
            {mode.replace("-", "→").replace("to", "→")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!generatedVideo && !isGenerating && (
          <div className="text-center py-12">
            <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No video generated yet
            </p>
            <p className="text-sm text-gray-400">
              Upload {mode === "audio-to-video" ? "audio" : "image + audio"} and click Generate
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-red-600 font-medium">Creating UGC video...</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">
                  {generatedVideo?.status === 'preview' ? 'Finalizing high-quality version...' : 'Processing media files...'}
                </div>
                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: generatedVideo?.status === 'preview' ? '70%' : '35%'
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
                poster={mode === "image-to-video-audio" ? uploadedImage || undefined : undefined}
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
                <p><strong>Mode:</strong> {generatedVideo.mode.replace("-", " → ").replace("to", " → ")}</p>
                <p><strong>Template:</strong> {mode === "audio-to-video" ?
                  audioTemplates.find(t => t.value === template)?.label :
                  "Image + Audio Sync"
                }</p>
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
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </Button>
                )}
              </div>
            </div>

            {generatedVideo.status !== 'final' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Preview Ready!</strong> Your final UGC video is being processed with enhanced quality.
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
        toolName="UGC Video Generator"
        toolIcon={Film}
        credits="100-400/video"
        estimatedTime="~60s"
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        canGenerate={canGenerate}
        costBreakdown={costBreakdown}
        previewPane={previewPane}
      >
        {/* Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Choose UGC Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={setMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="audio-to-video" className="text-xs">
                  <Music className="w-4 h-4 mr-1" />
                  Audio→Video
                </TabsTrigger>
                <TabsTrigger value="image-to-video-audio" className="text-xs">
                  <Image className="w-4 h-4 mr-1" />
                  Image→Video+Audio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="audio-to-video" className="space-y-4 mt-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Audio→Video:</strong> Create engaging videos from your audio using AI-powered templates and visualizations.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="image-to-video-audio" className="space-y-4 mt-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    <strong>Image→Video+Audio:</strong> Bring your images to life with custom motion and synchronized audio using advanced models.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* File Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Audio Upload (both modes) */}
            <div>
              <Label className="flex items-center mb-2">
                <Music className="w-4 h-4 mr-1" />
                Audio File {mode === "image-to-video-audio" && "(Required)"}
              </Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {uploadedAudio ? (
                  <div className="text-center">
                    <Music className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium mb-2">Audio uploaded successfully</p>
                    <audio controls className="w-full max-w-xs mx-auto">
                      <source src={uploadedAudio} />
                    </audio>
                    <div className="mt-2 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => document.getElementById('audio-upload')?.click()}>
                        Change
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setUploadedAudio(null)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Upload audio file
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      MP3, WAV, M4A up to 50MB
                    </p>
                    <Button size="sm" onClick={() => document.getElementById('audio-upload')?.click()}>
                      <Upload className="w-4 h-4 mr-1" />
                      Upload Audio
                    </Button>
                  </div>
                )}
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Image Upload (only for image-to-video-audio mode) */}
            {mode === "image-to-video-audio" && (
              <div>
                <Label className="flex items-center mb-2">
                  <Image className="w-4 h-4 mr-1" />
                  Image File (Required)
                </Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  {uploadedImage ? (
                    <div className="text-center">
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="mx-auto max-h-32 rounded-lg shadow-md mb-2"
                      />
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('image-upload')?.click()}>
                          Change
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setUploadedImage(null)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Upload image file
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        JPG, PNG, WebP up to 10MB
                      </p>
                      <Button size="sm" onClick={() => document.getElementById('image-upload')?.click()}>
                        <Upload className="w-4 h-4 mr-1" />
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Video Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "audio-to-video" ? (
              <div>
                <Label>Visual Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audioTemplates.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div>
                          <div className="font-medium">{t.label}</div>
                          <div className="text-xs text-gray-500">{t.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
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

                <div>
                  <Label htmlFor="motionPrompt">Motion Description (Optional)</Label>
                  <Textarea
                    id="motionPrompt"
                    placeholder="Describe how you want the image to move..."
                    value={motionPrompt}
                    onChange={(e) => setMotionPrompt(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Motion Templates</Label>
                  {motionTemplates.slice(0, 3).map((template, index) => (
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
              </>
            )}
          </CardContent>
        </Card>
      </ToolEditorLayout>
    </DashboardLayout>
  );
};

export default UGCVideoTool;