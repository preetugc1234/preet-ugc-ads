import { useState, useEffect } from "react";
import { Video, Upload, Download, Plus, Settings, X } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateJob, useJobStatus } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { apiHelpers } from "@/lib/api";

const ImageToVideoTool = () => {
  const { isAuthenticated } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState("720p");
  const [motionPrompt, setMotionPrompt] = useState("");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Job management hooks
  const createJobMutation = useCreateJob();
  const { data: jobStatus, refetch: refetchJobStatus } = useJobStatus(currentJobId || '', {
    enabled: !!currentJobId,
    refetchInterval: 10000, // Poll every 10 seconds for WAN 2.2 (3-4min duration)
  });


  const qualities = [
    { value: "580p", label: "Standard", short: "580p" },
    { value: "720p", label: "HD", short: "720p" }
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
    // 🚨 CRITICAL: Prevent double API calls that waste money
    if (isSubmitting || createJobMutation.isPending) {
      console.warn('🚫 Generation already in progress - preventing double API call');
      return;
    }

    if (!uploadedImageUrl || !isAuthenticated) {
      alert('Please sign in and upload an image');
      return;
    }

    // Set submitting state immediately to prevent multiple clicks
    setIsSubmitting(true);

    try {
      console.log('🎬 Starting SINGLE generation request...');

      // Create job for image-to-video generation
      const clientJobId = apiHelpers.generateClientJobId();

      const jobData = {
        client_job_id: clientJobId,
        module: 'img2vid_noaudio' as const,
        params: {
          image_url: uploadedImageUrl,
          prompt: motionPrompt || "The image stays still, eyes full of determination and strength. The camera slowly moves closer or circles around, highlighting the powerful presence and character.",
          resolution: quality, // WAN 2.5 uses resolution instead of quality
          negative_prompt: "low resolution, error, worst quality, low quality, defects",
          enable_prompt_expansion: true,
          seed: null, // Allow random generation
          duration_seconds: 5, // Set to 5 to get 4 seconds (FAL AI offset)
          num_frames: 120 // 120 frames at 24fps = 5 seconds (to get 4 seconds output)
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
    } finally {
      // 🚨 CRITICAL: Reset submitting state to allow future generations
      console.log('🔄 Resetting submitting state...');
      setIsSubmitting(false);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageUrl(null);
    // Clear the file input
    const fileInput = document.getElementById('video-image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Helper functions for job status - Enhanced with submitting state
  const isJobRunning = jobStatus?.status === 'queued' || jobStatus?.status === 'processing';
  const isJobCompleted = jobStatus?.status === 'completed';
  const isJobFailed = jobStatus?.status === 'failed';
  const isGenerating = isSubmitting || createJobMutation.isPending || isJobRunning;

  // Check if we have video URLs available (more flexible) - prioritize finalUrls over preview_url
  const workerVideoUrl = jobStatus?.worker_meta?.video_url || jobStatus?.worker_meta?.final_url;
  const videoUrl = jobStatus?.finalUrls?.[0] || workerVideoUrl || jobStatus?.preview_url;
  const hasVideoUrls = !!videoUrl;
  const finalVideoUrl = videoUrl;

  // AGGRESSIVE CHECK: If we have worker_meta with processing_complete, treat as ready
  const isVideoReady = hasVideoUrls || (jobStatus?.worker_meta?.processing_complete && workerVideoUrl);

  // SUPER AGGRESSIVE: Force show video if job has been running for more than 2 minutes and has any URL
  const jobAge = jobStatus?.created_at ? (Date.now() - new Date(jobStatus.created_at).getTime()) / 1000 : 0;
  const forceShowVideo = jobAge > 120 && (videoUrl || workerVideoUrl);

  // EMERGENCY: For jobs older than 3 minutes, force show even without URL (backend probably completed)
  const emergencyShow = jobAge > 180 && jobStatus?.status === 'processing';

  // Since backend is fixed, use only proper URLs from API (no emergency URL construction)
  const displayVideoUrl = finalVideoUrl;

  const shouldShowVideo = isVideoReady || forceShowVideo || (emergencyShow && displayVideoUrl);

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

  // COMPREHENSIVE DEBUG LOGGING
  if (jobStatus) {
    console.log('🔍 FULL JOB STATUS DEBUG:', {
      jobId: currentJobId,
      status: jobStatus.status,
      preview_url: jobStatus.preview_url,
      finalUrls: jobStatus.finalUrls,
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

      // Use video URL directly without transformations to avoid corruption
      let downloadUrl = url;
      console.log('🎬 Downloading video directly from source');

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

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Image to Video</h1>
            <Badge className="bg-blue-100 text-blue-600 border-0 rounded-full">100 Credits</Badge>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-8">
          {/* Input Controls - Full Width */}
          <div className="w-full space-y-6">
            {/* Main Prompt Input */}
            <div className="relative">
              <textarea
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                placeholder="Describe how you want your image to move..."
                className="min-h-[268px] flex h-full w-full flex-col justify-between gap-4 rounded-lg bg-white outline-none transition-colors focus-within:border-gray-300 border border-gray-300 p-6 text-gray-900 placeholder-gray-500 resize-none"
              />

              {/* Bottom Controls in Prompt Window */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Image Upload Button */}
                  <Button
                    onClick={() => document.getElementById('video-image-upload')?.click()}
                    className="w-10 h-10 p-0 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center border border-gray-300"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </Button>

                  {/* Quality Selector */}
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="w-24 h-10 bg-gray-50 border-gray-300 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">
                      <Settings className="w-4 h-4 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                      {qualities.map((q) => (
                        <SelectItem key={q.value} value={q.value} className="hover:bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{q.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!uploadedImage || !motionPrompt.trim() || isGenerating}
                  className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 rounded-lg px-6 py-2 font-medium"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                id="video-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Uploaded Image Display */}
            {uploadedImage && (
              <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Source Image</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={removeUploadedImage}
                    className="p-1 h-auto text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <img
                  src={uploadedImage}
                  alt="Source"
                  className="w-full max-h-32 object-contain rounded"
                />
              </div>
            )}
          </div>

          {/* Preview Panel - Full Width Below */}
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Generated Video</h2>
                  {jobStatus && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {jobStatus.status.charAt(0).toUpperCase() + jobStatus.status.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-6">
                {!currentJobId ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to animate</h3>
                      <p className="text-gray-500">Upload an image and describe the motion to create your video</p>
                    </div>
                  </div>
                ) : isJobRunning ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {jobStatus?.status === 'queued' ? 'Queued for processing...' : 'Generating video...'}
                      </h3>
                      <p className="text-gray-500">This usually takes ~4 minutes</p>
                    </div>
                  </div>
                ) : shouldShowVideo ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-gray-200">
                      <video
                        controls
                        preload="auto"
                        playsInline
                        muted={false}
                        className="w-full h-full"
                        poster={uploadedImage || undefined}
                        key={displayVideoUrl}
                        style={{
                          objectFit: 'contain',
                          backgroundColor: '#000'
                        }}
                      >
                        <source src={displayVideoUrl} type="video/mp4" />
                        <source src={displayVideoUrl} type="video/webm" />
                        Your browser does not support the video tag.
                      </video>

                      {/* Download Button Overlay */}
                      <div className="absolute top-2 right-2 z-10">
                        <Button
                          onClick={() => downloadVideo(displayVideoUrl!)}
                          className="bg-black/70 hover:bg-black/90 text-white border-white/20 rounded-lg"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p><strong>Duration:</strong> 4 seconds</p>
                        <p><strong>Quality:</strong> {qualities.find(q => q.value === quality)?.label}</p>
                        {jobStatus?.created_at && (
                          <p><strong>Generated:</strong> {new Date(jobStatus.created_at).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isJobFailed ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 mb-4">
                      <Video className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-medium text-xl">Video generation failed</p>
                      <p className="text-sm mt-2">{jobStatus?.error_message || 'Unknown error occurred'}</p>
                    </div>
                    <Button variant="outline" onClick={() => setCurrentJobId(null)} className="rounded-lg">
                      Try Again
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ImageToVideoTool;