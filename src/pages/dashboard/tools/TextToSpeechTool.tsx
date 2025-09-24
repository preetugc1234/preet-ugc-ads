import { useState, useRef, useEffect, useCallback } from "react";
import { AudioLines, Play, Pause, Download, Volume2, User, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { api, apiHelpers } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ToolEditorLayout from "@/components/dashboard/ToolEditorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

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
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("Rachel");
  const [stability, setStability] = useState([0.5]);
  const [similarityBoost, setSimilarityBoost] = useState([0.75]);
  const [style, setStyle] = useState([0]);
  const [speed, setSpeed] = useState([1.0]);
  const [timestamps, setTimestamps] = useState(false);
  const [languageCode, setLanguageCode] = useState("");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Generated audio
  const [generatedAudio, setGeneratedAudio] = useState<{
    job_id: string;
    audio_url: string;
    cloudinary_public_id?: string;
    text: string;
    voice: string;
    metadata: Record<string, unknown>;
    timestamps?: Record<string, unknown>[];
    processing_time?: number;
  } | null>(null);

  // Available voices
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load available voices on component mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        // Try to get voices from backend API (if available)
        // For now, use predefined voices since backend voices endpoint may not be implemented
        console.log('Loading TTS voices...');

        // Fallback to hardcoded voices (ElevenLabs standard voices)
        setAvailableVoices([
          { id: "Rachel", name: "Rachel", gender: "Female", accent: "American", description: "Professional, warm female voice" },
          { id: "Drew", name: "Drew", gender: "Male", accent: "American", description: "Confident, articulate male voice" },
          { id: "Paul", name: "Paul", gender: "Male", accent: "British", description: "Sophisticated British male voice" },
          { id: "Sarah", name: "Sarah", gender: "Female", accent: "American", description: "Clear, professional female voice" },
          { id: "Clyde", name: "Clyde", gender: "Male", accent: "American", description: "Friendly, approachable male voice" },
          { id: "Emily", name: "Emily", gender: "Female", accent: "American", description: "Gentle, soothing female voice" },
          { id: "Chris", name: "Chris", gender: "Male", accent: "American", description: "Natural, conversational male voice" },
          { id: "Jessica", name: "Jessica", gender: "Female", accent: "American", description: "Young, expressive female voice" }
        ]);
      } catch (error) {
        console.error('Failed to load voices:', error);
        // Fallback voices
        setAvailableVoices([
          { id: "Rachel", name: "Rachel", gender: "Female", accent: "American", description: "Professional, warm female voice" },
          { id: "Drew", name: "Drew", gender: "Male", accent: "American", description: "Confident, articulate male voice" },
          { id: "Paul", name: "Paul", gender: "Male", accent: "British", description: "Sophisticated British male voice" },
          { id: "Sarah", name: "Sarah", gender: "Female", accent: "American", description: "Clear, professional female voice" },
          { id: "Clyde", name: "Clyde", gender: "Male", accent: "American", description: "Friendly, approachable male voice" },
          { id: "Emily", name: "Emily", gender: "Female", accent: "American", description: "Gentle, soothing female voice" }
        ]);
      }
    };
    loadVoices();
  }, []);

  // Progress tracking - poll job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const status = await api.getJobStatus(jobId);

      // Map job status to TTS progress
      let progress = 0;
      let stage = 'initializing';

      switch (status.status) {
        case 'queued':
          progress = 10;
          stage = 'submitted';
          break;
        case 'processing':
          progress = 50;
          stage = 'processing_audio';
          break;
        case 'completed':
          progress = 100;
          stage = 'completed';
          break;
        case 'failed':
          setError(status.error_message || "TTS generation failed");
          setIsGenerating(false);
          toast.error(status.error_message || "TTS generation failed");
          return false; // Stop polling
      }

      setProgress(progress);
      setStage(stage);

      if (status.status === 'completed' && status.finalUrls && status.finalUrls.length > 0) {
        setGeneratedAudio({
          job_id: jobId,
          audio_url: status.finalUrls[0],
          cloudinary_public_id: undefined,
          text: text,
          voice: voice,
          metadata: { estimated_duration: 30 }, // Default duration
          timestamps: undefined,
          processing_time: undefined
        });
        toast.success("TTS generation completed successfully!");
        setIsGenerating(false);
        return false; // Stop polling
      }

      if (status.status === 'failed') {
        return false; // Stop polling
      }

      return status.status === 'queued' || status.status === 'processing'; // Continue polling
    } catch (error) {
      console.error('Failed to poll job status:', error);
      setError('Failed to track generation progress');
      setIsGenerating(false);
      return false; // Stop polling
    }
  }, [text, voice]);

  // Start progress polling
  const startProgressPolling = useCallback((jobId: string) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(async () => {
      const shouldContinue = await pollJobStatus(jobId);
      if (!shouldContinue && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, 2000); // Poll every 2 seconds
  }, [pollJobStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const textTemplates = [
    "Welcome to our platform! We're excited to have you here.",
    "Thank you for choosing our service. Your satisfaction is our priority.",
    "Hello! This is a test of our text-to-speech capabilities powered by ElevenLabs.",
    "In today's rapidly evolving digital landscape, innovation drives success.",
    "Please listen carefully to the following important announcement.",
    "Once upon a time, in a land far away, there lived a wise old wizard."
  ];

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to generate speech");
      return;
    }

    if (text.length > 5000) {
      toast.error("Text must be 5000 characters or less");
      return;
    }

    // Reset state
    setIsGenerating(true);
    setProgress(0);
    setStage("initializing");
    setError(null);
    setCurrentJobId(null);
    setGeneratedAudio(null);
    setEstimatedTimeRemaining(null);

    try {
      // Prepare parameters for the TTS job
      const jobParams = {
        text: text.trim(),
        voice: voice,
        stability: stability[0],
        similarity_boost: similarityBoost[0],
        style: style[0] !== 0 ? style[0] : undefined,
        speed: speed[0],
        timestamps: timestamps,
        language_code: (languageCode && languageCode !== 'auto') ? languageCode : undefined
      };

      // Create a job using the unified API
      const jobData = {
        client_job_id: apiHelpers.generateClientJobId(),
        module: 'tts' as const,
        params: jobParams
      };

      const result = await api.createJob(jobData);

      if (result.success && result.job_id) {
        setCurrentJobId(result.job_id);
        setStage("submitted");
        setProgress(5);
        toast.success("TTS generation started! Tracking progress...");

        // Start polling for progress
        startProgressPolling(result.job_id);
      } else {
        setError(result.message || "Failed to start TTS generation");
        setIsGenerating(false);
        toast.error(result.message || "Failed to start TTS generation");
      }
    } catch (error) {
      console.error('TTS generation failed:', error);
      const errorMessage = apiHelpers.handleApiError(error);
      setError(errorMessage);
      setIsGenerating(false);
      toast.error(errorMessage);
    }
  };

  const playPauseAudio = () => {
    if (audioRef.current && generatedAudio) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const downloadAudio = () => {
    if (generatedAudio?.audio_url) {
      const link = document.createElement('a');
      link.href = generatedAudio.audio_url;
      link.download = `tts_${generatedAudio.voice}_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Audio download started!");
    }
  };

  // Audio event handlers
  const handleAudioLoadedData = () => {
    if (audioRef.current) {
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

  const calculateWordCount = () => text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const calculateCharacterCount = () => text.length;
  const estimatedDuration = Math.max(1, Math.floor(calculateCharacterCount() / (15 * speed[0]))); // Adjust for speed

  // Get stage display text
  const getStageDisplay = (stage: string) => {
    const stageMap: { [key: string]: string } = {
      'initializing': 'Initializing...',
      'submitted': 'Request submitted',
      'submitting_to_fal': 'Connecting to ElevenLabs...',
      'processing_audio': 'Generating speech...',
      'uploading_to_cloudinary': 'Saving audio file...',
      'completed': 'Complete!'
    };
    return stageMap[stage] || stage;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const previewPane = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <AudioLines className="w-5 h-5 mr-2" />
          Generated Audio
          {generatedAudio?.metadata && (
            <Badge variant="default" className="ml-2">
              {formatTime(generatedAudio.metadata.estimated_duration || 0)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Error State */}
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-blue-600 font-medium">
                  {getStageDisplay(stage)}
                </span>
              </div>
              <Progress value={progress} className="w-full mb-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{progress}% complete</span>
                {estimatedTimeRemaining && (
                  <span>{estimatedTimeRemaining}s remaining</span>
                )}
              </div>
              {currentJobId && (
                <p className="text-xs text-gray-400 mt-1">Job ID: {currentJobId}</p>
              )}
            </div>
          </div>
        )}

        {/* No Audio State */}
        {!generatedAudio && !isGenerating && !error && (
          <div className="text-center py-12">
            <AudioLines className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No audio generated yet
            </p>
            <p className="text-sm text-gray-400">
              Enter text and click Generate to create high-quality speech
            </p>
          </div>
        )}

        {/* Generated Audio Display */}
        {generatedAudio && (
          <div className="space-y-6">
            {/* Audio Player */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  onClick={playPauseAudio}
                  size="lg"
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!generatedAudio.audio_url}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {availableVoices.find(v => v.id === generatedAudio.voice)?.name || generatedAudio.voice}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(duration)} / {formatTime(generatedAudio.metadata?.estimated_duration || 0)}
                    </span>
                  </div>
                  <Progress
                    value={duration > 0 ? (currentTime / duration) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </div>

              {/* Waveform Visualization (Static) */}
              <div className="flex items-center justify-center space-x-1 h-16 mb-4">
                {Array.from({ length: 50 }, (_, i) => {
                  const height = Math.sin((i / 50) * Math.PI * 4) * 30 + 35;
                  const isActive = duration > 0 && (i / 50) <= (currentTime / duration);
                  return (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-t from-blue-500 to-purple-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      style={{
                        width: '3px',
                        height: `${height}px`,
                        opacity: isPlaying && isActive ? 1 : 0.6
                      }}
                    />
                  );
                })}
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  "{generatedAudio.text.substring(0, 150)}..."
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <Button onClick={downloadAudio} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3
                  </Button>
                  {generatedAudio.processing_time && (
                    <Badge variant="secondary">
                      {generatedAudio.processing_time}s processing time
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Voice:</span>{" "}
                <span className="text-gray-800 dark:text-gray-200">
                  {availableVoices.find(v => v.id === generatedAudio.voice)?.name || generatedAudio.voice}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Model:</span>{" "}
                <span className="text-gray-800 dark:text-gray-200">ElevenLabs Turbo v2.5</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Characters:</span>{" "}
                <span className="text-gray-800 dark:text-gray-200">{generatedAudio.text.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">File Size:</span>{" "}
                <span className="text-gray-800 dark:text-gray-200">
                  {generatedAudio.cloudinary_public_id ? "Saved to cloud" : "Temporary"}
                </span>
              </div>
            </div>

            {/* Hidden audio element for playback */}
            <audio
              ref={audioRef}
              src={generatedAudio.audio_url}
              onLoadedData={handleAudioLoadedData}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={handleAudioEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              style={{ display: 'none' }}
              preload="metadata"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <ToolEditorLayout
        toolName="Text to Speech"
        toolIcon={AudioLines}
        credits="Free (Testing Mode)"
        estimatedTime={`~${estimatedDuration}s`}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        canGenerate={!!text.trim() && text.length <= 5000 && !isGenerating}
        previewPane={previewPane}
      >
        {/* Text Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enter Your Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text">Text to Convert</Label>
              <Textarea
                id="text"
                placeholder="Enter the text you want to convert to natural speech using ElevenLabs..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px]"
                maxLength={5000}
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  {calculateWordCount()} words • {calculateCharacterCount()} characters
                </span>
                <span className="text-blue-600">
                  ~{estimatedDuration}s duration
                </span>
              </div>
              {text.length > 4500 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Approaching 5,000 character limit
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <User className="w-4 h-4 mr-2" />
              Voice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Voice Selection</Label>
              <Select value={voice} onValueChange={setVoice} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <div className="flex justify-between w-full">
                        <div>
                          <div className="font-medium">{v.name}</div>
                          <div className="text-xs text-gray-500">{v.description}</div>
                        </div>
                        <div className="flex space-x-1 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {v.gender}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {v.accent}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Voice Stability: {stability[0]}</Label>
              <Slider
                value={stability}
                onValueChange={setStability}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher values create more consistent voice, lower values add variation
              </p>
            </div>

            <div>
              <Label>Similarity Boost: {similarityBoost[0]}</Label>
              <Slider
                value={similarityBoost}
                onValueChange={setSimilarityBoost}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enhances similarity to the original voice, may affect stability
              </p>
            </div>

            <div>
              <Label>Style Enhancement: {style[0]}</Label>
              <Slider
                value={style}
                onValueChange={setStyle}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Amplifies the style of the original speaker, 0 = neutral
              </p>
            </div>

            <div>
              <Label>Speech Speed: {speed[0]}x</Label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                max={4}
                min={0.25}
                step={0.25}
                className="mt-2"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-1">
                0.25x = Very slow, 1x = Normal, 4x = Very fast
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Word Timestamps</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Generate timing data for each word (useful for subtitles)
                </p>
              </div>
              <Switch
                checked={timestamps}
                onCheckedChange={setTimestamps}
                disabled={isGenerating}
              />
            </div>

            <div>
              <Label htmlFor="languageCode">Language Code (Optional)</Label>
              <Select value={languageCode} onValueChange={setLanguageCode} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="pl">Polish</SelectItem>
                  <SelectItem value="tr">Turkish</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                  <SelectItem value="nl">Dutch</SelectItem>
                  <SelectItem value="cs">Czech</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="hu">Hungarian</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quick Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Volume2 className="w-4 h-4 mr-2" />
              Quick Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {textTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2 text-xs"
                  onClick={() => setText(template)}
                  disabled={isGenerating}
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

export default TextToSpeechTool;