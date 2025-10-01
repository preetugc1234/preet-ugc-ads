import { useState, useRef, useEffect } from "react";
import { AudioLines, Play, Pause, Download, SkipForward, SkipBack } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiHelpers } from "@/lib/api";
import { useCreateJob, useJobStatus } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";

// API Types
interface TTSRequest {
  text: string;
  voice: string;
  stability: number;
  similarity_boost: number;
  style?: number;
  speed: number;
  timestamps?: boolean;
  language_code?: string;
}

interface TTSResponse {
  success: boolean;
  job_id?: string;
  audio_url?: string;
  cloudinary_public_id?: string;
  timestamps?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
  error?: string;
  processing_time?: number;
}

interface TTSJobStatus {
  job_id: string;
  status: string;
  progress: number;
  stage: string;
  estimated_time_remaining?: number;
  error?: string;
}

interface VoiceInfo {
  id: string;
  name: string;
  gender: string;
  accent: string;
  description: string;
}

const TextToSpeechTool = () => {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("Aria");
  const [speed, setSpeed] = useState("1.0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [showCheckAudioButton, setShowCheckAudioButton] = useState(false);
  const [jobStartTime, setJobStartTime] = useState<number | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<{
    id: string;
    url: string;
    text: string;
    voice: string;
    timestamp: Date;
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Job management hooks
  const createJobMutation = useCreateJob();
  const { data: jobStatus, refetch: refetchJobStatus } = useJobStatus(currentJobId || '', {
    enabled: !!currentJobId,
    refetchInterval: (data) => {
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false; // Stop polling
      }
      return 3000; // Poll every 3 seconds for TTS
    },
  });

  const voices = [
    { value: "Aria", label: "Aria" },
    { value: "Roger", label: "Roger" },
    { value: "Sarah", label: "Sarah" },
    { value: "Laura", label: "Laura" },
    { value: "Charlie", label: "Charlie" },
    { value: "George", label: "George" },
    { value: "Callum", label: "Callum" },
    { value: "River", label: "River" },
    { value: "Liam", label: "Liam" },
    { value: "Charlotte", label: "Charlotte" },
    { value: "Alice", label: "Alice" },
    { value: "Matilda", label: "Matilda" },
    { value: "Will", label: "Will" },
    { value: "Jessica", label: "Jessica" },
    { value: "Eric", label: "Eric" },
    { value: "Chris", label: "Chris" },
    { value: "Brian", label: "Brian" },
    { value: "Daniel", label: "Daniel" },
    { value: "Lily", label: "Lily" },
    { value: "Bill", label: "Bill" }
  ];

  const speeds = [
    { value: "0.5", label: "0.5x Slow" },
    { value: "0.75", label: "0.75x" },
    { value: "1.0", label: "1.0x Normal" },
    { value: "1.25", label: "1.25x" },
    { value: "1.5", label: "1.5x Fast" },
    { value: "2.0", label: "2.0x Very Fast" }
  ];

  // Handle job completion
  useEffect(() => {
    if (jobStatus?.status === 'completed') {
      console.log('🎵 Job completed, checking for audio URL:', jobStatus);

      // Try multiple possible URL locations
      const audioUrl = jobStatus.finalUrls?.[0] ||
                      jobStatus.final_urls?.[0] ||
                      jobStatus.audio_url ||
                      jobStatus.result_url ||
                      jobStatus.output_url;

      console.log('🎵 Extracted audio URL:', audioUrl);
      console.log('🎵 Available finalUrls:', jobStatus.finalUrls);
      console.log('🎵 Job status details:', {
        finalUrls: jobStatus.finalUrls,
        final_urls: jobStatus.final_urls,
        audio_url: jobStatus.audio_url,
        worker_meta: jobStatus.worker_meta
      });

      if (audioUrl) {
        const newAudio = {
          id: jobStatus.job_id,
          url: audioUrl,
          text: text,
          voice: voice,
          timestamp: new Date(jobStatus.created_at)
        };

        setGeneratedAudio(newAudio);
        setShowCheckAudioButton(false); // Hide check button when audio is found
        setJobStartTime(null); // Clear timer
        console.log('✅ Audio generated successfully:', audioUrl);
      } else {
        console.error('❌ No audio URL found in completed job:', jobStatus);
        alert('Audio generation completed but no audio URL found. Please try again.');
        setCurrentJobId(null);
      }
    } else if (jobStatus?.status === 'failed') {
      console.error('❌ TTS job failed:', jobStatus.error_message);
      alert(`Audio generation failed: ${jobStatus.error_message || 'Unknown error'}`);
      setCurrentJobId(null);
      setShowCheckAudioButton(false);
      setJobStartTime(null);
    }
  }, [jobStatus, text, voice]);

  // Timer for showing "Check Audio" button after 15 seconds
  useEffect(() => {
    if (jobStartTime && !generatedAudio && !showCheckAudioButton) {
      const timer = setTimeout(() => {
        setShowCheckAudioButton(true);
        console.log('🎵 15 seconds elapsed, showing Check Audio button');
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [jobStartTime, generatedAudio, showCheckAudioButton]);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    if (!isAuthenticated) {
      alert('Please sign in to generate audio');
      return;
    }

    // Prevent double API calls
    if (isSubmitting || createJobMutation.isPending) {
      console.warn('🚫 Generation already in progress - preventing double API call');
      return;
    }

    setIsSubmitting(true);
    setGeneratedAudio(null);
    setCurrentJobId(null);
    setShowCheckAudioButton(false);
    setJobStartTime(null);

    try {
      console.log('🎵 Starting text-to-speech generation...');

      // Create job for TTS generation
      const clientJobId = apiHelpers.generateClientJobId();

      const jobData = {
        client_job_id: clientJobId,
        module: 'tts' as const,
        params: {
          text: text,
          voice: voice,
          speed: parseFloat(speed)
        }
      };

      console.log('🎵 Creating TTS job:', {
        client_job_id: clientJobId,
        module: jobData.module,
        params: jobData.params
      });

      const result = await createJobMutation.mutateAsync(jobData);

      // Handle both possible response formats (job_id or id)
      const jobId = result.job_id || result.id;

      if (jobId) {
        setCurrentJobId(jobId);
        setJobStartTime(Date.now()); // Start the 15-second timer
        console.log('✅ TTS Job created successfully:', {
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
      console.error('❌ Text-to-speech generation failed:', error);

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

      alert(`Failed to start audio generation: ${errorMessage}`);
    } finally {
      console.log('🔄 Resetting submitting state...');
      setIsSubmitting(false);
    }
  };

  const handleCheckAudio = async () => {
    if (!currentJobId) return;

    try {
      console.log('🎵 Manually checking audio for job:', currentJobId);

      // Manually refetch the job status
      await refetchJobStatus();

      // If job is completed, force load the audio
      if (jobStatus?.status === 'completed') {
        const audioUrl = jobStatus.finalUrls?.[0] || jobStatus.final_urls?.[0] || jobStatus.audio_url;
        if (audioUrl && !generatedAudio) {
          // Directly set the audio without popup
          setGeneratedAudio({
            id: jobStatus.job_id,
            url: audioUrl,
            text,
            voice,
            timestamp: new Date()
          });
          setShowCheckAudioButton(false);
        }
      }
    } catch (error) {
      console.error('🎵 Error checking audio:', error);
    }
  };

  const playPauseAudio = async () => {
    if (audioRef.current && generatedAudio) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          console.log('🎵 Audio paused');
        } else {
          console.log('🎵 Attempting to play audio:', generatedAudio.url);

          // Ensure audio is loaded
          if (audioRef.current.readyState < 2) {
            console.log('🎵 Audio not ready, loading...');
            await new Promise<void>((resolve, reject) => {
              const onCanPlay = () => {
                audioRef.current?.removeEventListener('canplay', onCanPlay);
                audioRef.current?.removeEventListener('error', onError);
                resolve();
              };
              const onError = () => {
                audioRef.current?.removeEventListener('canplay', onCanPlay);
                audioRef.current?.removeEventListener('error', onError);
                reject(new Error('Audio failed to load'));
              };
              audioRef.current?.addEventListener('canplay', onCanPlay);
              audioRef.current?.addEventListener('error', onError);
              audioRef.current?.load();
            });
          }

          await audioRef.current.play();
          console.log('🎵 Audio playing successfully');
        }
      } catch (error) {
        console.error('🎵 Error playing audio:', error);
        alert(`Unable to play audio: ${error instanceof Error ? error.message : 'Unknown error'}. The audio file might be corrupted or inaccessible.`);
      }
    } else {
      console.error('🎵 No audio reference or generated audio available');
    }
  };

  const skipAudio = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const downloadAudio = () => {
    if (generatedAudio?.url) {
      const link = document.createElement('a');
      link.href = generatedAudio.url;
      link.download = `tts_${generatedAudio.voice}_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAudioLoadedData = () => {
    if (audioRef.current) {
      console.log('🎵 Audio loaded successfully, duration:', audioRef.current.duration);
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('🎵 Audio error:', e.currentTarget.error);
    console.error('🎵 Audio src:', e.currentTarget.src);
    const errorCode = e.currentTarget.error?.code;
    let errorMessage = 'Unknown audio error';

    switch (errorCode) {
      case 1:
        errorMessage = 'Audio loading was aborted';
        break;
      case 2:
        errorMessage = 'Audio network error';
        break;
      case 3:
        errorMessage = 'Audio decoding error';
        break;
      case 4:
        errorMessage = 'Audio format not supported';
        break;
    }

    alert(`Audio playback error: ${errorMessage}. Please try generating again.`);
  };

  const handleAudioLoadStart = () => {
    console.log('🎵 Audio loading started for URL:', generatedAudio?.url);
    setAudioLoading(true);
  };

  const handleAudioCanPlay = () => {
    console.log('🎵 Audio can start playing');
    setAudioLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <AudioLines className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Text to Speech</h1>
            <Badge className="bg-blue-100 text-blue-600 border-0 rounded-full">Free</Badge>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-8">
          {/* Controls Panel - Above Input Field */}
          <div className="w-full">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-4">
                {/* Voice Model Selector */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-gray-600">Voice</label>
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger className="w-40 h-10 bg-white border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                      {voices.map((v) => (
                        <SelectItem key={v.value} value={v.value} className="hover:bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{v.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speed Selector */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-medium text-gray-600">Speed</label>
                  <Select value={speed} onValueChange={setSpeed}>
                    <SelectTrigger className="w-32 h-10 bg-white border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                      {speeds.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="hover:bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{s.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!text.trim() || isSubmitting || createJobMutation.isPending || (jobStatus?.status === 'queued' || jobStatus?.status === 'processing')}
                className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 rounded-lg px-8 py-2 font-medium"
              >
                {(isSubmitting || createJobMutation.isPending) ? "Submitting..." :
                 (jobStatus?.status === 'queued') ? "Queued..." :
                 (jobStatus?.status === 'processing') ? "Generating..." :
                 "Generate"}
              </Button>
            </div>
          </div>

          {/* Input Text Area - Clean and Simple */}
          <div className="w-full">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to natural speech..."
              className="min-h-[350px] w-full rounded-lg bg-white outline-none transition-colors focus-within:border-gray-300 border border-gray-300 p-6 text-gray-900 placeholder-gray-500 resize-none"
            />
          </div>

          {/* Audio Preview Panel - Slim */}
          <div className="w-full">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Generated Audio</h2>
                  {generatedAudio && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {voice}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-6">
                {!currentJobId && !generatedAudio ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AudioLines className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to create</h3>
                      <p className="text-gray-500">Enter text and click Generate to create your first audio</p>
                    </div>
                  </div>
                ) : currentJobId && !generatedAudio ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {(isSubmitting || createJobMutation.isPending) ? 'Submitting job...' :
                         !jobStatus ? 'Loading job status...' :
                         jobStatus?.status === 'queued' ? 'Queued for processing...' :
                         jobStatus?.status === 'processing' ? 'Generating speech...' :
                         'Processing...'}
                      </h3>
                      <p className="text-gray-500">
                        {(isSubmitting || createJobMutation.isPending) ? 'Setting up your speech generation...' :
                         !jobStatus ? 'Retrieving job information from server...' :
                         jobStatus?.status === 'queued' ? 'Your job is in the queue, processing will start soon...' :
                         jobStatus?.status === 'processing' ? 'Converting your text to natural speech...' :
                         'Initializing speech generation process...'}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        It usually takes ~30 seconds
                      </p>

                      {/* Check Audio Button - appears after 15 seconds */}
                      {showCheckAudioButton && (
                        <Button
                          onClick={handleCheckAudio}
                          variant="outline"
                          className="mt-4 rounded-lg border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          🎵 Check Audio
                        </Button>
                      )}
                    </div>
                  </div>
                ) : generatedAudio ? (
                  <div className="space-y-4">
                    {/* Slim Audio Player */}
                    <div className="bg-black rounded-lg p-4 flex items-center space-x-4">
                      {/* Play/Pause Button */}
                      <Button
                        onClick={playPauseAudio}
                        disabled={audioLoading}
                        className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 text-black p-0 disabled:opacity-50"
                      >
                        {audioLoading ? (
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>

                      {/* Skip Backward */}
                      <Button
                        onClick={() => skipAudio(-5)}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-gray-800 p-2"
                      >
                        <SkipBack className="w-4 h-4" />
                      </Button>

                      {/* Audio Progress Bar */}
                      <div className="flex-1 flex items-center space-x-3">
                        <span className="text-white text-sm">{formatTime(currentTime)}</span>
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white transition-all duration-300"
                            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-white text-sm">{formatTime(duration)}</span>
                      </div>

                      {/* Skip Forward */}
                      <Button
                        onClick={() => skipAudio(5)}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-gray-800 p-2"
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>

                      {/* Download Button */}
                      <Button
                        onClick={downloadAudio}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-gray-800 p-2"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Audio Info */}
                    <div className="text-center">
                      <p className="text-sm text-gray-700 truncate">{generatedAudio.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{generatedAudio.timestamp.toLocaleTimeString()}</p>
                    </div>

                    {/* Hidden audio element for playback */}
                    <audio
                      key={generatedAudio.url} // Force re-render when URL changes
                      ref={audioRef}
                      src={generatedAudio.url}
                      onLoadedData={handleAudioLoadedData}
                      onTimeUpdate={handleAudioTimeUpdate}
                      onEnded={handleAudioEnded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={handleAudioError}
                      onLoadStart={handleAudioLoadStart}
                      onCanPlay={handleAudioCanPlay}
                      style={{ display: 'none' }}
                      preload="auto"
                      crossOrigin="anonymous"
                    />
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

export default TextToSpeechTool;