import { useState, useEffect } from "react";
import { Film, Upload, Play, Download, Music, Image, Sparkles, User, Clock } from "lucide-react";
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
import { API_BASE_URL } from "@/lib/supabase";

const UGCVideoTool = () => {
  const [mode, setMode] = useState("audio-to-video");
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [duration, setDuration] = useState("5");
  const [template, setTemplate] = useState("default");
  const [avatarId, setAvatarId] = useState("emily_vertical_primary");
  const [audioDuration, setAudioDuration] = useState(30); // in seconds
  const [motionPrompt, setMotionPrompt] = useState("");
  const [intensity, setIntensity] = useState([0.7]);
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<{
    id: string;
    previewUrl: string;
    finalUrl: string;
    mode: string;
    timestamp: Date;
    status: 'preview' | 'final';
  } | null>(null);

  // Fetch available avatars on component mount
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/generate/audio2video/avatars`);
        const data = await response.json();
        if (data.success) {
          setAvailableAvatars(data.avatars);
        }
      } catch (error) {
        console.error('Failed to fetch avatars:', error);
        // Fallback avatars if API fails
        setAvailableAvatars([
          { id: "emily_vertical_primary", name: "Emily (Vertical Primary)", gender: "female", orientation: "vertical" },
          { id: "marcus_vertical_primary", name: "Marcus (Vertical Primary)", gender: "male", orientation: "vertical" },
          { id: "any_female_vertical_primary", name: "Generic Female (Vertical)", gender: "female", orientation: "vertical" }
        ]);
      }
    };
    fetchAvatars();
  }, []);

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

      // Create audio element to detect duration
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.round(audio.duration);

        // Check if duration exceeds 5 minutes (300 seconds)
        if (duration > 300) {
          alert('Audio duration cannot exceed 5 minutes. Please upload a shorter audio file.');
          event.target.value = ''; // Clear the file input
          return;
        }

        setUploadedAudio(url);
        setAudioDuration(duration);
      });

      audio.addEventListener('error', () => {
        alert('Error loading audio file. Please try a different file.');
      });
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
    setGeneratedVideo(null);

    try {
      if (mode === "audio-to-video") {
        // Step 1: Upload audio file to FAL storage
        const audioFile = await fetch(uploadedAudio!).then(r => r.blob());
        const formData = new FormData();
        formData.append('file', audioFile, 'audio.mp3');

        const uploadResponse = await fetch(`${API_BASE_URL}/api/generate/audio2video/upload-audio`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload audio file');
        }

        const uploadResult = await uploadResponse.json();
        const audioUrl = uploadResult.audio_url;

        // Step 2: Submit audio-to-video generation
        const generateResponse = await fetch(`${API_BASE_URL}/api/generate/audio2video/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio_url: audioUrl,
            avatar_id: avatarId,
            audio_duration_seconds: audioDuration
          }),
          credentials: 'include'
        });

        if (!generateResponse.ok) {
          throw new Error('Failed to submit generation request');
        }

        const generateResult = await generateResponse.json();

        if (generateResult.success) {
          setGeneratedVideo({
            id: generateResult.request_id || Date.now().toString(),
            previewUrl: generateResult.video_url,
            finalUrl: generateResult.video_url,
            mode: mode,
            timestamp: new Date(),
            status: 'final'
          });
        } else {
          throw new Error(generateResult.error || 'Generation failed');
        }
      } else {
        // Image-to-video+audio mode using our new implementation
        if (!uploadedImage || !uploadedAudio) {
          throw new Error('Both image and audio are required for image-to-video generation');
        }

        // Step 1: Upload image file to FAL storage
        const imageFile = await fetch(uploadedImage!).then(r => r.blob());
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile, 'image.jpg');

        const imageUploadResponse = await fetch(`${API_BASE_URL}/api/generate/upload-file`, {
          method: 'POST',
          body: imageFormData,
          credentials: 'include'
        });

        if (!imageUploadResponse.ok) {
          throw new Error('Failed to upload image file');
        }

        const imageUploadResult = await imageUploadResponse.json();
        const imageUrl = imageUploadResult.file_url;

        // Step 2: Upload audio file to FAL storage
        const audioFile = await fetch(uploadedAudio!).then(r => r.blob());
        const audioFormData = new FormData();
        audioFormData.append('file', audioFile, 'audio.mp3');

        const audioUploadResponse = await fetch(`${API_BASE_URL}/api/generate/upload-file`, {
          method: 'POST',
          body: audioFormData,
          credentials: 'include'
        });

        if (!audioUploadResponse.ok) {
          throw new Error('Failed to upload audio file');
        }

        const audioUploadResult = await audioUploadResponse.json();
        const audioUrl = audioUploadResult.file_url;

        // Step 3: Submit image+audio-to-video generation using new endpoint
        const generateResponse = await fetch(`${API_BASE_URL}/api/generate/img2vid-audio/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: imageUrl,
            audio_url: audioUrl,
            prompt: motionPrompt || 'Professional avatar speaking with natural expressions',
            user_id: 'anonymous'
          }),
          credentials: 'include'
        });

        if (!generateResponse.ok) {
          throw new Error('Failed to submit image-to-video generation request');
        }

        const generateResult = await generateResponse.json();

        if (generateResult.success) {
          setGeneratedVideo({
            id: generateResult.job_id || Date.now().toString(),
            previewUrl: generateResult.video_url,
            finalUrl: generateResult.video_url,
            mode: mode,
            timestamp: new Date(),
            status: 'final'
          });
        } else {
          throw new Error(generateResult.error || 'Image-to-video generation failed');
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateCost = () => {
    if (mode === "audio-to-video") {
      // 0 credits for testing - normally would be 100 credits per 30 seconds of audio
      const clampedDuration = Math.min(audioDuration, 300); // Ensure max 5 minutes
      const thirtySecondChunks = Math.ceil(clampedDuration / 30);
      return 0; // Set to 0 for testing - normally: thirtySecondChunks * 100
    } else {
      // Image to Video with Audio
      const baseCost = durations.find(d => d.value === duration)?.credits || 200;
      return baseCost;
    }
  };

  const calculateProcessingTime = () => {
    if (mode === "audio-to-video") {
      // 200 seconds for 30 seconds of audio (approximately 6.67 seconds per audio second)
      // Maximum 5 minutes (300 seconds) audio
      const clampedDuration = Math.min(audioDuration, 300); // Ensure max 5 minutes
      const processingSeconds = Math.round((clampedDuration / 30) * 200);
      // Add 4-minute buffer for safety
      const totalSeconds = processingSeconds + 240;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      if (minutes > 0) {
        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
      }
      return `${seconds}s`;
    } else {
      // Image to Video with Audio (existing logic)
      return duration === "5" ? "7-8m" : "7-8m";
    }
  };

  const handleAudioDurationDetected = (detectedDuration: number) => {
    setAudioDuration(Math.round(detectedDuration));
  };

  const costBreakdown = {
    baseCost: mode === "audio-to-video" ? calculateCost() : (duration === "5" ? 200 : 400),
    additionalCosts: mode === "image-to-video-audio" ? [] : undefined,
    total: calculateCost()
  };

  const canGenerate = mode === "audio-to-video"
    ? (uploadedAudio && audioDuration <= 300)
    : (uploadedImage && uploadedAudio && audioDuration <= 300);

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
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
              <video
                controls
                controlsList="nodownload"
                className="w-full h-full"
                poster={mode === "image-to-video-audio" ? uploadedImage || undefined : undefined}
                onContextMenu={(e) => e.preventDefault()}
              >
                <source
                  src={generatedVideo.status === 'final' ? generatedVideo.finalUrl : generatedVideo.previewUrl}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>

              {/* Custom video overlay controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center space-x-4 bg-black bg-opacity-70 px-4 py-2 rounded-full">
                  <button
                    onClick={() => {
                      const video = document.querySelector('video');
                      if (video) {
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }
                    }}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>Mode:</strong> {generatedVideo.mode.replace("-", " → ").replace("to", " → ")}</p>
                <p><strong>Avatar:</strong> {mode === "audio-to-video" ?
                  availableAvatars.find((a: any) => a.id === avatarId)?.name || avatarId :
                  "Image + Audio Sync"
                }</p>
                <p><strong>Generated:</strong> {generatedVideo.timestamp.toLocaleString()}</p>
                <p><strong>Quality:</strong> HD 1080p MP4</p>
              </div>
              <div className="flex flex-col space-y-2">
                {generatedVideo.status === 'final' ? (
                  <>
                    <Button
                      onClick={async () => {
                        try {
                          const link = document.createElement('a');
                          link.href = generatedVideo.finalUrl;
                          link.download = `audio-to-video-${avatarId}-${Date.now()}.mp4`;
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } catch (error) {
                          console.error('Download failed:', error);
                          // Fallback: open in new tab
                          window.open(generatedVideo.finalUrl, '_blank');
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download MP4
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedVideo.finalUrl);
                        // You could add a toast notification here
                        alert('Video URL copied to clipboard!');
                      }}
                    >
                      Copy URL
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" disabled>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </Button>
                )}
              </div>
            </div>

            {/* Video metadata and sharing options */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Credits Used:</span>
                  <p className="font-semibold">{calculateCost()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Processing Time:</span>
                  <p className="font-semibold">{calculateProcessingTime()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Audio Duration:</span>
                  <p className="font-semibold">{audioDuration}s</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Model:</span>
                  <p className="font-semibold">Veed Avatars</p>
                </div>
              </div>
            </div>

            {generatedVideo.status !== 'final' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      🎬 Processing Your Avatar Video
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your audio-to-video generation is in progress. The AI avatar is learning to speak your audio content with natural lip-sync and expressions.
                    </p>
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      This typically takes {calculateProcessingTime()} - hang tight!
                    </div>
                  </div>
                </div>
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
        credits={mode === "audio-to-video" ? "FREE FOR TESTING" : "200-400/video"}
        estimatedTime={calculateProcessingTime()}
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
                    <strong>Audio→Video:</strong> Create engaging videos with AI avatars that speak your audio content using veed/avatars/audio-to-video.
                  </p>
                  <div className="flex items-center mt-2 text-xs text-blue-700 dark:text-blue-300">
                    <Clock className="w-3 h-3 mr-1" />
                    Processing: ~200 seconds for 30 seconds of audio (includes 4m buffer)
                  </div>
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
                      MP3, WAV, M4A up to 5 minutes • FREE FOR TESTING (normally 100 credits per 30s)
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
              <>
                <div>
                  <Label className="flex items-center mb-2">
                    <User className="w-4 h-4 mr-1" />
                    Avatar Selection
                  </Label>
                  <Select value={avatarId} onValueChange={setAvatarId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAvatars.map((avatar: any) => (
                        <SelectItem key={avatar.id} value={avatar.id}>
                          <div>
                            <div className="font-medium">{avatar.name}</div>
                            <div className="text-xs text-gray-500">
                              {avatar.gender} • {avatar.orientation} • {avatar.style}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose an AI avatar that will speak your audio content
                  </p>
                </div>

                {uploadedAudio && (
                  <div className={`p-3 rounded-lg ${
                    audioDuration > 300
                      ? "bg-red-50 dark:bg-red-900/20"
                      : "bg-green-50 dark:bg-green-900/20"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${
                          audioDuration > 300
                            ? "text-red-800 dark:text-red-200"
                            : "text-green-800 dark:text-green-200"
                        }`}>
                          Audio Duration: {audioDuration} seconds
                          {audioDuration > 300 && " (exceeds 5 min limit)"}
                        </p>
                        <p className={`text-xs ${
                          audioDuration > 300
                            ? "text-red-600 dark:text-red-300"
                            : "text-green-600 dark:text-green-300"
                        }`}>
                          Processing Time: ~{calculateProcessingTime()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          audioDuration > 300
                            ? "text-red-800 dark:text-red-200"
                            : "text-green-800 dark:text-green-200"
                        }`}>
                          Cost: {calculateCost()} credits
                        </p>
                        <p className={`text-xs ${
                          audioDuration > 300
                            ? "text-red-600 dark:text-red-300"
                            : "text-green-600 dark:text-green-300"
                        }`}>
                          {Math.ceil(Math.min(audioDuration, 300) / 30)} × 30s chunks • FREE FOR TESTING
                          {audioDuration > 300 && " (max 10 chunks)"}
                        </p>
                      </div>
                    </div>
                    {audioDuration > 300 && (
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs text-red-700 dark:text-red-300">
                        ⚠️ Audio exceeds 5-minute limit. Please upload a shorter file or trim your audio.
                      </div>
                    )}
                  </div>
                )}
              </>
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