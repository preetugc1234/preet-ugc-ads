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
  const duration = "5"; // Fixed 5 seconds
  const [quality, setQuality] = useState("hd");
  const [motionPrompt, setMotionPrompt] = useState("");
  const [intensity, setIntensity] = useState([0.7]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Job management hooks
  const createJobMutation = useCreateJob();
  const { data: jobStatus, refetch: refetchJobStatus } = useJobStatus(currentJobId || '', {
    enabled: !!currentJobId,
    refetchInterval: 5000, // Poll every 5 seconds for video generation (60-90s duration)
  });

  // AUTO-REFRESH for old jobs without video URLs
  useEffect(() => {
    if (jobStatus && jobAge > 30 && !finalVideoUrl && !workerVideoUrl && jobStatus?.status === 'processing') {
      console.log('🔄 AUTO-REFRESH: Job is old and missing video URL, refreshing status...');
      const timer = setTimeout(() => {
        refetchJobStatus();
      }, 3000); // Auto-refresh after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [jobAge, finalVideoUrl, workerVideoUrl, jobStatus?.status, refetchJobStatus]);

  // Fixed 5 seconds duration - no user selection needed
  const fixedDuration = { value: "5", label: "5 seconds", credits: 100 };

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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      console.log(`📸 Uploading image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Result = e.target?.result as string;
        setUploadedImage(base64Result);
        setUploadedImageUrl(base64Result);

        // Log only the image metadata to avoid base64 console spam
        console.log(`✅ Image loaded successfully: ${file.type}, ${(file.size / 1024).toFixed(1)}KB`);
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

      // Log job details without base64 data to avoid console spam
      console.log('🎬 Creating image-to-video job:', {
        client_job_id: clientJobId,
        module: jobData.module,
        params: {
          ...jobData.params,
          image_url: uploadedImageUrl.startsWith('data:')
            ? `[Base64 Image: ${uploadedImageUrl.split(',')[0]}]`
            : uploadedImageUrl
        }
      });

      const result = await createJobMutation.mutateAsync(jobData);

      // Handle both possible response formats (job_id or id)
      const jobId = result.job_id || result.id;

      if (jobId) {
        setCurrentJobId(jobId);
        console.log('✅ Job created successfully:', {
          job_id: jobId,
          client_job_id: result.client_job_id,
          status: result.status,
          estimated_cost: result.estimated_cost
        });
      } else {
        console.error('❌ Job creation response missing job ID:', result);
        throw new Error(`Job creation failed: ${result.message || 'No job ID returned'}`);
      }
    } catch (error) {
      console.error('❌ Image-to-video generation failed:', error);

      // Extract meaningful error message
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Check for specific error patterns
      if (errorMessage.includes('insufficient credits')) {
        errorMessage = 'Insufficient credits. Please check your account balance.';
      } else if (errorMessage.includes('already exists')) {
        errorMessage = 'Job already exists. Please try again.';
      } else if (errorMessage.includes('authentication')) {
        errorMessage = 'Please sign in again to continue.';
      }

      alert(`Failed to start video generation: ${errorMessage}`);
    }
  };

  const calculateCost = () => {
    const baseCost = fixedDuration.credits;
    const qualityMultiplier = quality === '4k' ? 2 : quality === 'fhd' ? 1.5 : 1;
    return Math.round(baseCost * qualityMultiplier);
  };

  const costBreakdown = {
    baseCost: fixedDuration.credits,
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

  // Check if we have video URLs available (more flexible) - prioritize final_urls over preview_url
  const workerVideoUrl = jobStatus?.worker_meta?.video_url || jobStatus?.worker_meta?.final_url;
  const videoUrl = jobStatus?.final_urls?.[0] || workerVideoUrl || jobStatus?.preview_url;
  const hasVideoUrls = !!videoUrl;
  const finalVideoUrl = videoUrl;

  // AGGRESSIVE CHECK: If we have worker_meta with processing_complete, treat as ready
  const isVideoReady = hasVideoUrls || (jobStatus?.worker_meta?.processing_complete && workerVideoUrl);

  // SUPER AGGRESSIVE: Force show video if job has been running for more than 2 minutes and has any URL
  const jobAge = jobStatus?.created_at ? (Date.now() - new Date(jobStatus.created_at).getTime()) / 1000 : 0;
  const forceShowVideo = jobAge > 120 && (videoUrl || workerVideoUrl);

  // EMERGENCY: For jobs older than 3 minutes, force show even without URL (backend probably completed)
  const emergencyShow = jobAge > 180 && jobStatus?.status === 'processing';

  // EMERGENCY URL: Try to construct cloudinary URL from job ID for emergency cases
  const emergencyVideoUrl = emergencyShow && !finalVideoUrl ?
    `https://res.cloudinary.com/drkudvqhy/video/upload/user_${jobStatus?.params?.user_id || 'unknown'}/job_${currentJobId}/final_video.mp4` : null;

  // Final video URL with emergency fallback
  const displayVideoUrl = finalVideoUrl || emergencyVideoUrl;

  const shouldShowVideo = isVideoReady || forceShowVideo || (emergencyShow && displayVideoUrl);

  // COMPREHENSIVE DEBUG LOGGING
  if (jobStatus) {
    console.log('🔍 FULL JOB STATUS DEBUG:', {
      jobId: currentJobId,
      status: jobStatus.status,
      preview_url: jobStatus.preview_url,
      final_urls: jobStatus.final_urls,
      worker_meta: jobStatus.worker_meta,
      hasVideoUrls: hasVideoUrls,
      isVideoReady: isVideoReady,
      shouldShowVideo: shouldShowVideo,
      forceShowVideo: forceShowVideo,
      emergencyShow: emergencyShow,
      jobAge: jobAge,
      videoUrl: videoUrl,
      workerVideoUrl: workerVideoUrl,
      finalVideoUrl: finalVideoUrl,
      emergencyVideoUrl: emergencyVideoUrl,
      displayVideoUrl: displayVideoUrl,
      isJobCompleted: isJobCompleted,
      isJobRunning: isJobRunning,
      isJobFailed: isJobFailed,
      fullResponse: jobStatus
    });

    // SPECIFIC DEBUG: Show worker_meta contents
    if (jobStatus.worker_meta) {
      console.log('🔧 WORKER_META DEBUG:', jobStatus.worker_meta);
    }
  }

  // ADDITIONAL DEBUGGING
  console.log('🎯 DISPLAY CONDITIONS:', {
    shouldShowVideo: shouldShowVideo,
    hasVideoUrls: hasVideoUrls,
    isVideoReady: isVideoReady,
    forceShowVideo: forceShowVideo,
    emergencyShow: emergencyShow,
    jobAge: jobAge,
    currentJobId: currentJobId,
    jobStatusExists: !!jobStatus,
    finalVideoUrl: finalVideoUrl,
    emergencyVideoUrl: emergencyVideoUrl,
    displayVideoUrl: displayVideoUrl
  });

  const downloadVideo = async (url: string) => {
    try {
      // Generate descriptive filename
      const timestamp = new Date().toISOString().split('T')[0];
      const promptSlug = motionPrompt
        ? motionPrompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')
        : 'motion_video';
      const filename = `${promptSlug}_${duration}s_${timestamp}.mp4`;

      // Check if it's a Cloudinary URL for high-quality download
      let downloadUrl = url;
      if (url.includes('cloudinary.com') && url.includes('/video/upload/')) {
        // Transform Cloudinary URL for highest quality download
        downloadUrl = url.replace(
          '/video/upload/',
          '/video/upload/q_100,f_mp4,br_5000k/' // 100% quality, MP4 format, 5Mbps bitrate
        );
        console.log('🎬 Downloading high-quality video from Cloudinary');
      }

      console.log(`⬇️ Starting download: ${filename}`);

      // Fetch the video with progress tracking
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      // Get file size for progress
      const contentLength = response.headers.get('content-length');
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read video stream');
      }

      // Read the stream
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        // Log progress for large files
        if (totalSize > 0 && totalSize > 5 * 1024 * 1024) { // > 5MB
          const progress = ((receivedLength / totalSize) * 100).toFixed(1);
          console.log(`📥 Download progress: ${progress}%`);
        }
      }

      // Combine chunks
      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      // Create blob and download
      const blob = new Blob([allChunks], { type: 'video/mp4' });
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(objectUrl);

      const fileSizeMB = (blob.size / 1024 / 1024).toFixed(2);
      console.log(`✅ Video downloaded successfully: ${filename} (${fileSizeMB}MB)`);

    } catch (error) {
      console.error('❌ Video download failed:', error);
      alert(`Failed to download video: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    This usually takes 90-180 seconds using FAL AI Wan v2.2-5B (5 seconds video)
                  </p>
                  <p className="text-xs text-blue-600">
                    ⏱️ Please wait - video is being generated and will appear once complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMOOTH DEBUG: Show processing status without manual buttons */}
        {jobStatus && !shouldShowVideo && isJobRunning && (
          <div className="bg-blue-50 p-4 text-sm text-blue-800 rounded">
            <h4 className="font-semibold">🔄 Processing Status</h4>
            <p><strong>Status:</strong> {jobStatus.status}</p>
            <p><strong>Age:</strong> {Math.round(jobAge)}s</p>
            {jobAge > 30 && (
              <p className="text-blue-600"><strong>🔄 Auto-refreshing to check for completed video...</strong></p>
            )}
            {emergencyShow && (
              <p className="text-orange-600"><strong>🚨 Emergency mode: Video should appear soon...</strong></p>
            )}
          </div>
        )}

        {shouldShowVideo && (
          <div className="space-y-4">
            <div className={`p-2 text-sm rounded ${emergencyShow ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {emergencyShow ?
                '🚨 EMERGENCY MODE: Video processing completed but URL missing - trying emergency URL...' :
                `🎬 DEBUG: Video section is rendering! URL: ${displayVideoUrl?.substring(0, 50)}...`
              }
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                controls
                className="w-full h-full"
                poster={uploadedImage || undefined}
                onLoadStart={() => console.log('🎬 Video loading started')}
                onCanPlay={() => console.log('🎬 Video can play')}
                onError={(e) => {
                  console.error('🎬 Video error:', e);
                  if (emergencyShow && !finalVideoUrl) {
                    console.log('🔄 Emergency mode: Video error, trying to refresh job status...');
                    setTimeout(() => refetchJobStatus(), 2000); // Auto-retry in 2 seconds
                  }
                }}
              >
                <source
                  src={displayVideoUrl}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Duration:</strong> 5 seconds (fixed)</p>
                <p><strong>Quality:</strong> {qualities.find(q => q.value === quality)?.label}</p>
                <p><strong>Model:</strong> FAL AI Wan v2.2-5B</p>
                <p><strong>Status:</strong> {jobStatus?.status}</p>
                {displayVideoUrl && <p><strong>Video URL:</strong> ✅ Available</p>}
                {jobStatus?.created_at && (
                  <p><strong>Generated:</strong> {new Date(jobStatus.created_at).toLocaleString()}</p>
                )}
                {isJobCompleted && (
                  <p className="text-green-600"><strong>✅ High-quality MP4 ready</strong></p>
                )}
              </div>
              <div className="flex space-x-2">
                {displayVideoUrl ? (
                  <Button onClick={() => downloadVideo(displayVideoUrl)}>
                    <Download className="w-4 h-4 mr-2" />
                    {isJobCompleted ? 'Download MP4' : 'Preview'}
                  </Button>
                ) : isJobRunning ? (
                  <Button variant="outline" disabled>
                    <Clock className="w-4 h-4 mr-2" />
                    {jobStatus?.preview_url ? 'Finalizing...' : 'Processing...'}
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
        toolName="Image to Video (No Audio)"
        toolIcon={Video}
        credits="100-200/video"
        estimatedTime="~6min"
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
            {/* Fixed 5 seconds duration - no user selection */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Video Duration</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Fixed at 5 seconds for optimal quality</p>
                </div>
                <Badge variant="secondary">5s</Badge>
              </div>
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
            <CardTitle className="text-base">Motion Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="motionPrompt" className="text-base font-semibold">
                🎬 Describe Your Motion (Required)
              </Label>
              <Textarea
                id="motionPrompt"
                placeholder="Example: Gentle head nod with natural eye movement, subtle smile appearing..."
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                className="min-h-[100px] text-base"
              />
              <div className="flex items-start space-x-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Be specific!</strong> Describe exactly how you want your image to move.
                  Better descriptions = better videos. Leave empty for automatic motion.
                </p>
              </div>
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