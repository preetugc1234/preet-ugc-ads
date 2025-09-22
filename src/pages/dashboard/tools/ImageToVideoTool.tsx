import { useState, useEffect } from "react";
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
import { useCreateJob, useJobStatus } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { apiHelpers } from "@/lib/api";

const ImageToVideoTool = () => {
  const { isAuthenticated } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState("5");
  const [quality, setQuality] = useState("hd");
  const [motionPrompt, setMotionPrompt] = useState("");
  const [intensity, setIntensity] = useState([0.7]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Job management hooks
  const createJobMutation = useCreateJob();
  const { data: jobStatus, refetch: refetchJobStatus } = useJobStatus(currentJobId || '', {
    enabled: !!currentJobId,
    refetchInterval: 3000, // Poll every 3 seconds
  });

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
        const base64Result = e.target?.result as string;
        setUploadedImage(base64Result);
        setUploadedImageUrl(base64Result); // For now, use base64. In production, upload to cloud storage first
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImageUrl || !isAuthenticated) {
      alert('Please sign in and upload an image');
      return;
    }

    try {
      // Create job for image-to-video generation
      const clientJobId = apiHelpers.generateClientJobId();

      const jobData = {
        client_job_id: clientJobId,
        module: 'img2vid_noaudio' as const,
        params: {
          image_url: uploadedImageUrl,
          prompt: motionPrompt || "Create smooth cinematic motion with natural camera movement",
          duration_seconds: parseInt(duration),
          quality: quality,
          motion_intensity: intensity[0]
        }
      };

      console.log('🎬 Creating image-to-video job:', jobData);

      const result = await createJobMutation.mutateAsync(jobData);

      if (result.id) {
        setCurrentJobId(result.id);
        console.log('✅ Job created successfully:', result.id);
      } else {
        throw new Error('Failed to create job');
      }
    } catch (error) {
      console.error('❌ Image-to-video generation failed:', error);
      alert(`Failed to start video generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  // Helper functions for job status
  const isJobRunning = jobStatus?.status === 'queued' || jobStatus?.status === 'processing';
  const isJobCompleted = jobStatus?.status === 'completed';
  const isJobFailed = jobStatus?.status === 'failed';

  const downloadVideo = async (url: string) => {
    try {
      const filename = `video_${Date.now()}.mp4`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);
      console.log(`✅ Video downloaded: ${filename}`);
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert('Failed to download video. Please try again.');
    }
  };

  const previewPane = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <Video className="w-5 h-5 mr-2" />
          Generated Video
          {jobStatus && (
            <Badge variant={isJobCompleted ? 'default' : isJobRunning ? 'secondary' : 'destructive'} className="ml-2">
              {jobStatus.status.charAt(0).toUpperCase() + jobStatus.status.slice(1)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!currentJobId && (
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

        {isJobRunning && (
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-600 font-medium">
                  {jobStatus?.status === 'queued' ? 'Queued for processing...' : 'Generating video...'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">
                  {jobStatus?.preview_url ? 'Creating final version...' : 'Processing your image...'}
                </div>
                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: jobStatus?.progress ? `${jobStatus.progress}%` : jobStatus?.preview_url ? '60%' : '30%'
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  This usually takes 2-6 minutes using FAL AI Kling v2.1 Pro
                </p>
              </div>
            </div>
          </div>
        )}

        {(jobStatus?.preview_url || isJobCompleted) && (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                controls
                className="w-full h-full"
                poster={uploadedImage || undefined}
              >
                <source
                  src={isJobCompleted && jobStatus?.final_urls?.[0] ? jobStatus.final_urls[0] : jobStatus?.preview_url}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Duration:</strong> {duration} seconds</p>
                <p><strong>Quality:</strong> {qualities.find(q => q.value === quality)?.label}</p>
                <p><strong>Model:</strong> FAL AI Kling v2.1 Pro</p>
                {jobStatus?.created_at && (
                  <p><strong>Generated:</strong> {new Date(jobStatus.created_at).toLocaleString()}</p>
                )}
              </div>
              <div className="flex space-x-2">
                {isJobCompleted && jobStatus?.final_urls?.[0] ? (
                  <Button onClick={() => downloadVideo(jobStatus.final_urls![0])}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                ) : jobStatus?.preview_url ? (
                  <Button variant="outline" disabled={isJobRunning}>
                    <Clock className="w-4 h-4 mr-2" />
                    {isJobRunning ? 'Finalizing...' : 'Processing...'}
                  </Button>
                ) : null}
              </div>
            </div>

            {jobStatus?.preview_url && !isJobCompleted && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Preview Ready!</strong> Your final high-quality video is still processing.
                  You can download it once complete.
                </p>
              </div>
            )}
          </div>
        )}

        {isJobFailed && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Video className="w-16 h-16 mx-auto mb-4" />
              <p className="font-medium">Video generation failed</p>
              <p className="text-sm mt-2">{jobStatus?.error_message || 'Unknown error occurred'}</p>
            </div>
            <Button variant="outline" onClick={() => setCurrentJobId(null)}>
              Try Again
            </Button>
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
        isGenerating={createJobMutation.isPending || isJobRunning}
        canGenerate={!!uploadedImage && !isJobRunning}
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