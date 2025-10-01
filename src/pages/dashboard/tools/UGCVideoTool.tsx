import { useState, useRef, useEffect } from "react";
import { Video, Upload, Download, Plus, X, Music, Image } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateJob, useJobStatus } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { apiHelpers } from "@/lib/api";

const UGCVideoTool = () => {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState("audio-to-video");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [motionPrompt, setMotionPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("marcus_primary");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Model options for veed/avatars/audio-to-video
  const audioVideoModels = [
    {
      id: "marcus_side",
      name: "Marcus Side",
      description: "Professional male avatar (side view)",
      category: "Male"
    },
    {
      id: "aisha_walking",
      name: "Aisha Walking",
      description: "Dynamic female avatar with walking motion",
      category: "Female"
    },
    {
      id: "elena_primary",
      name: "Elena Primary",
      description: "Professional female avatar (primary view)",
      category: "Female"
    },
    {
      id: "elena_side",
      name: "Elena Side",
      description: "Professional female avatar (side view)",
      category: "Female"
    },
    {
      id: "any_male_primary",
      name: "Any Male Primary",
      description: "Generic male avatar (primary view)",
      category: "Male"
    },
    {
      id: "any_female_primary",
      name: "Any Female Primary",
      description: "Generic female avatar (primary view)",
      category: "Female"
    },
    {
      id: "any_male_side",
      name: "Any Male Side",
      description: "Generic male avatar (side view)",
      category: "Male"
    },
    {
      id: "any_female_side",
      name: "Any Female Side",
      description: "Generic female avatar (side view)",
      category: "Female"
    },
    {
      id: "emily_vertical_primary",
      name: "Emily Vertical Primary",
      description: "Professional female avatar (vertical primary)",
      category: "Female"
    },
    {
      id: "marcus_vertical_primary",
      name: "Marcus Vertical Primary",
      description: "Professional male avatar (vertical primary)",
      category: "Male"
    },
    {
      id: "emily_primary",
      name: "Emily Primary",
      description: "Professional female avatar (primary view)",
      category: "Female"
    },
    {
      id: "marcus_primary",
      name: "Marcus Primary",
      description: "Professional male avatar (primary view)",
      category: "Male"
    }
  ];

  // Clear file inputs on component mount to fix refresh bug
  useEffect(() => {
    const imageInput = document.getElementById('image-upload') as HTMLInputElement;
    const audioInput = document.getElementById('audio-upload') as HTMLInputElement;

    if (imageInput) imageInput.value = '';
    if (audioInput) audioInput.value = '';

    // Clear any lingering state
    setUploadedImage(null);
    setUploadedImageUrl(null);
    setUploadedAudio(null);
    setUploadedAudioUrl(null);
    setAudioDuration(0);
  }, []);

  // Job management hooks
  const createJobMutation = useCreateJob();
  const { data: jobStatus, refetch: refetchJobStatus } = useJobStatus(currentJobId || '', {
    enabled: !!currentJobId,
    refetchInterval: (data) => {
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false; // Stop polling
      }
      return 5000; // Poll every 5 seconds
    },
  });

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
        console.log(`✅ Image loaded successfully: ${file.type}, ${(file.size / 1024).toFixed(1)}KB`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        alert('Audio file size should be less than 25MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('audio/')) {
        alert('Please upload a valid audio file');
        return;
      }

      const url = URL.createObjectURL(file);

      // Create audio element to detect duration
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.round(audio.duration);

        // Check if duration exceeds 2 minutes (120 seconds)
        if (duration > 120) {
          alert('Audio duration cannot exceed 2 minutes. Please upload a shorter audio file.');
          event.target.value = ''; // Clear the file input
          URL.revokeObjectURL(url);
          return;
        }

        setAudioDuration(duration);
        console.log(`🎵 Audio uploaded: ${file.name}, Duration: ${duration}s`);
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Result = e.target?.result as string;
        setUploadedAudio(base64Result);
        setUploadedAudioUrl(base64Result);
        console.log(`✅ Audio loaded successfully: ${file.type}, Duration: ${audioDuration}s`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    // Prevent double API calls
    if (isSubmitting || createJobMutation.isPending) {
      console.warn('🚫 Generation already in progress - preventing double API call');
      return;
    }

    // Validation based on mode
    if (mode === "audio-to-video") {
      if (!uploadedAudioUrl || !isAuthenticated) {
        alert('Please sign in and upload an audio file');
        return;
      }
    } else {
      if (!uploadedImageUrl || !uploadedAudioUrl || !isAuthenticated) {
        alert('Please sign in and upload both image and audio files');
        return;
      }
    }

    // Set submitting state immediately to prevent multiple clicks
    setIsSubmitting(true);

    try {
      console.log(`🎬 Starting ${mode} generation...`);

      // Create job for video generation
      const clientJobId = apiHelpers.generateClientJobId();

      let jobData;

      if (mode === "audio-to-video") {
        jobData = {
          client_job_id: clientJobId,
          module: 'audio2vid' as const,
          params: {
            audio_url: uploadedAudioUrl,
            avatar_model: selectedModel,
            prompt: "Professional AI avatar speaking with natural expressions and movements",
            force_free: true, // Force free execution
            override_cost: 0, // Override credit cost
            skip_payment: true, // Skip payment verification
            dev_mode: true, // Development mode
            admin_override: true, // Admin override
            test_environment: true // Test environment flag
          }
        };
      } else {
        jobData = {
          client_job_id: clientJobId,
          module: 'img2vid_audio' as const,
          params: {
            image_url: uploadedImageUrl,
            audio_url: uploadedAudioUrl,
            prompt: motionPrompt || "Professional lip-sync video with natural expressions and movements",
            audio_duration: audioDuration,
            force_free: true, // Force free execution
            override_cost: 0, // Override credit cost
            skip_payment: true, // Skip payment verification
            dev_mode: true, // Development mode
            admin_override: true, // Admin override
            test_environment: true // Test environment flag
          }
        };
      }

      console.log(`🎬 Creating ${mode} job:`, {
        client_job_id: clientJobId,
        module: jobData.module,
        params: {
          ...jobData.params,
          ...(uploadedImageUrl && {
            image_url: uploadedImageUrl.startsWith('data:')
              ? `[Base64 Image: ${uploadedImageUrl.split(',')[0]}]`
              : uploadedImageUrl
          }),
          audio_url: uploadedAudioUrl.startsWith('data:')
            ? `[Base64 Audio: ${uploadedAudioUrl.split(',')[0]}]`
            : uploadedAudioUrl
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
      console.error(`❌ ${mode} generation failed:`, error);

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
      console.log('🔄 Resetting submitting state...');
      setIsSubmitting(false);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageUrl(null);
    // Clear the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removeUploadedAudio = () => {
    setUploadedAudio(null);
    setUploadedAudioUrl(null);
    setAudioDuration(0);
    // Clear the file input
    const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Helper functions for job status
  const isJobRunning = jobStatus?.status === 'queued' || jobStatus?.status === 'processing';
  const isJobCompleted = jobStatus?.status === 'completed';
  const isJobFailed = jobStatus?.status === 'failed';
  const isGenerating = isSubmitting || createJobMutation.isPending || isJobRunning;

  // Video detection
  const videoUrl = jobStatus?.finalUrls?.[0] || jobStatus?.final_urls?.[0] || jobStatus?.video_url;
  const showVideo = videoUrl && jobStatus?.status === 'completed';

  const jobAge = jobStatus?.created_at ? (Date.now() - new Date(jobStatus.created_at).getTime()) / 1000 : 0;

  const downloadVideo = async (url: string) => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const promptSlug = motionPrompt
        ? motionPrompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')
        : 'ugc_video';
      const filename = `${promptSlug}_${audioDuration}s_${timestamp}.mp4`;

      console.log(`⬇️ Starting video download: ${filename}`);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`✅ Download initiated: ${filename}`);
    } catch (error) {
      console.error('❌ Video download failed:', error);
      alert(`Failed to download video. You can try right-clicking the video and selecting "Save video as..."`);
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
            <h1 className="text-xl font-semibold text-gray-900">UGC Video Generator</h1>
            <Badge className="bg-green-100 text-green-600 border-0 rounded-full">Free Testing</Badge>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-8">
          {/* Mode Switcher */}
          <div className="w-full">
            <Tabs value={mode} onValueChange={setMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
                <TabsTrigger value="audio-to-video" className="text-sm">
                  <Music className="w-4 h-4 mr-2" />
                  Audio → Video
                </TabsTrigger>
                <TabsTrigger value="image-to-video-audio" className="text-sm">
                  <Image className="w-4 h-4 mr-2" />
                  Image → Video + Audio
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Audio→Video Mode UI */}
          {mode === "audio-to-video" && (
            <div className="w-full space-y-6">
              {/* Big Audio Upload Panel */}
              <div className="w-full">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[200px] relative">
                  {!uploadedAudio ? (
                    <div
                      onClick={() => document.getElementById('audio-upload')?.click()}
                      className="flex flex-col items-center justify-center h-[200px] cursor-pointer hover:bg-gray-50 transition-colors rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-400"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Music className="w-8 h-8 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Audio File</h3>
                      <p className="text-gray-500 text-center">Click to upload or drag and drop<br />MP3, WAV, M4A up to 25MB (max 2 minutes)</p>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Audio File</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={removeUploadedAudio}
                          className="p-2 h-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <audio
                          ref={audioRef}
                          controls
                          className="w-full"
                        >
                          <source src={uploadedAudio} />
                          Your browser does not support the audio element.
                        </audio>
                        <div className="mt-3 text-sm text-gray-600">
                          Duration: {audioDuration}s (max 2 minutes)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Avatar Model Selection */}
              <div className="w-full">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">AI Avatar Model</h3>
                        <p className="text-sm text-gray-600">Choose your avatar for audio-to-video generation</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0 rounded-full px-3 py-1">
                      VEED Models
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Select Avatar Model</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="w-full h-12 bg-gray-50 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg max-h-60">
                        {audioVideoModels.map((model) => (
                          <SelectItem key={model.id} value={model.id} className="hover:bg-gray-50 rounded-lg p-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{model.name}</span>
                              <span className="text-xs text-gray-500">{model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Generate Button Section */}
              <div className="w-full">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                  <Button
                    onClick={handleGenerate}
                    disabled={!uploadedAudio || isGenerating}
                    className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 rounded-lg px-8 py-3 font-medium text-lg"
                  >
                    {isGenerating && (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    )}
                    {isSubmitting || createJobMutation.isPending ? "Submitting..." :
                     isJobRunning ? "Generating..." :
                     "Generate AI Avatar Video"}
                  </Button>
                  {uploadedAudio && (
                    <p className="text-sm text-gray-600 mt-3">
                      Ready to generate {audioDuration}s video with {audioVideoModels.find(m => m.id === selectedModel)?.name} avatar
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Image→Video+Audio Mode UI (existing design) */}
          {mode === "image-to-video-audio" && (
            <div className="w-full space-y-6">
              {/* Main Prompt Input */}
              <div className="relative">
                <textarea
                  value={motionPrompt}
                  onChange={(e) => setMotionPrompt(e.target.value)}
                  placeholder="Describe how you want your image to move and sync with the audio..."
                  className="min-h-[268px] flex h-full w-full flex-col justify-between gap-4 rounded-lg bg-white outline-none transition-colors focus-within:border-gray-300 border border-gray-300 p-6 text-gray-900 placeholder-gray-500 resize-none"
                />

                {/* Bottom Controls in Prompt Window */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Image Upload Button */}
                    <Button
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="w-10 h-10 p-0 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center border border-gray-300"
                      title="Upload Image"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </Button>

                    {/* Audio Upload Button */}
                    <Button
                      onClick={() => document.getElementById('audio-upload')?.click()}
                      className="w-10 h-10 p-0 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center border border-gray-300"
                      title="Upload Audio"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </Button>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!uploadedImage || !uploadedAudio || !motionPrompt.trim() || isGenerating}
                    className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 rounded-lg px-6 py-2 font-medium"
                  >
                    {isGenerating && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    )}
                    {isSubmitting || createJobMutation.isPending ? "Submitting..." :
                     isJobRunning ? "Generating..." :
                     "Generate"}
                  </Button>
                </div>
              </div>

              {/* Uploaded Media Display */}
              <div className="flex gap-4">
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

                {/* Uploaded Audio Display */}
                {uploadedAudio && (
                  <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4 max-w-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Audio File</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={removeUploadedAudio}
                        className="p-1 h-auto text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <audio
                      ref={audioRef}
                      controls
                      className="w-full"
                      style={{ maxWidth: '250px' }}
                    >
                      <source src={uploadedAudio} />
                      Your browser does not support the audio element.
                    </audio>
                    <div className="mt-1 text-xs text-gray-500">
                      Duration: {audioDuration}s (max 2 minutes)
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
          />

          {/* Preview Panel - Full Width Below */}
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[500px]">
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

              <div className="p-6 min-h-[400px]">
                {!currentJobId ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to create</h3>
                      <p className="text-gray-500">
                        {mode === "audio-to-video"
                          ? "Upload an audio file and describe the style to create your AI avatar video"
                          : "Upload an image, audio file, and describe the motion to create your video"}
                      </p>
                    </div>
                  </div>
                ) : (currentJobId && (isGenerating || !jobStatus)) ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {isSubmitting || createJobMutation.isPending ? 'Submitting job...' :
                         !jobStatus ? 'Loading job status...' :
                         jobStatus?.status === 'queued' ? 'Queued for processing...' :
                         jobStatus?.status === 'processing' ?
                           (mode === "audio-to-video" ? 'Creating AI avatar video...' : 'Creating video with audio sync...') :
                         jobStatus?.status === 'submitted' ? 'Job submitted, starting...' :
                         'Processing...'}
                      </h3>
                      <p className="text-gray-500">
                        {isSubmitting || createJobMutation.isPending ? 'Setting up your video generation...' :
                         !jobStatus ? 'Retrieving job information from server...' :
                         jobStatus?.status === 'queued' ? 'Your job is in the queue, processing will start soon...' :
                         jobStatus?.status === 'processing' ?
                           (mode === "audio-to-video" ? 'High-quality AI avatar generation in progress...' : 'High-quality video with lip-sync generation in progress...') :
                         'Initializing video generation process...'}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {mode === "audio-to-video" ? "It usually takes ~4 minutes" : "It usually takes ~6 minutes"}
                      </p>
                    </div>
                  </div>
                ) : showVideo ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-gray-200">
                      <video
                        controls
                        preload="auto"
                        playsInline
                        muted={false}
                        className="w-full h-full"
                        poster={uploadedImage || undefined}
                        key={videoUrl}
                        style={{
                          objectFit: 'contain',
                          backgroundColor: '#000'
                        }}
                        onLoadStart={() => console.log('🎬 Video loading started:', videoUrl)}
                        onLoadedData={() => console.log('✅ Video loaded successfully')}
                        onError={(e) => console.error('❌ Video loading error:', e)}
                      >
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>

                      {/* Download Button Overlay */}
                      <div className="absolute top-2 right-2 z-10">
                        <Button
                          onClick={() => downloadVideo(videoUrl!)}
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
                        <p><strong>Duration:</strong> {audioDuration} seconds</p>
                        <p><strong>Type:</strong> {mode === "audio-to-video" ? "AI Avatar" : "Image + Audio Sync"}</p>
                        {jobStatus?.created_at && (
                          <p><strong>Generated:</strong> {new Date(jobStatus.created_at).toLocaleString()}</p>
                        )}
                      </div>

                      {/* Additional Download Button */}
                      <Button
                        onClick={() => downloadVideo(videoUrl!)}
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download MP4
                      </Button>
                    </div>
                  </div>
                ) : isJobCompleted && !videoUrl ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Finalizing video...</h3>
                      <p className="text-gray-500">Processing completed, preparing video for download...</p>
                      <Button
                        variant={jobAge >= 360 ? "default" : "outline"}
                        onClick={() => refetchJobStatus()}
                        className={`mt-4 rounded-lg ${jobAge >= 360 ? "bg-green-600 hover:bg-green-700 text-white animate-pulse" : ""}`}
                      >
                        {jobAge >= 360 ? "🎬 Video is ready! Click here" : "Refresh Status"}
                      </Button>
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
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing job...</h3>
                      <p className="text-gray-500">Checking job status...</p>

                      <Button
                        variant={jobAge >= 360 ? "default" : "outline"}
                        onClick={() => refetchJobStatus()}
                        className={`mt-4 rounded-lg ${jobAge >= 360 ? "bg-green-600 hover:bg-green-700 text-white animate-pulse" : ""}`}
                      >
                        {jobAge >= 360 ? "🎬 Video is ready! Click here" : "Refresh Status"}
                      </Button>
                    </div>
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

export default UGCVideoTool;