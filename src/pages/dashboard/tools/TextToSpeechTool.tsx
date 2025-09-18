import { useState, useRef } from "react";
import { AudioLines, Play, Pause, Download, Volume2, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ToolEditorLayout from "@/components/dashboard/ToolEditorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const TextToSpeechTool = () => {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{
    id: string;
    url: string;
    text: string;
    voice: string;
    timestamp: Date;
    duration: number;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const voices = [
    { value: "alloy", label: "Alloy", description: "Neutral, balanced voice", gender: "Neutral" },
    { value: "echo", label: "Echo", description: "Warm, friendly voice", gender: "Male" },
    { value: "fable", label: "Fable", description: "Expressive storytelling voice", gender: "Female" },
    { value: "onyx", label: "Onyx", description: "Deep, authoritative voice", gender: "Male" },
    { value: "nova", label: "Nova", description: "Clear, professional voice", gender: "Female" },
    { value: "shimmer", label: "Shimmer", description: "Bright, cheerful voice", gender: "Female" }
  ];

  const textTemplates = [
    "Welcome to our platform! We're excited to have you here.",
    "Thank you for choosing our service. Your satisfaction is our priority.",
    "Hello! This is a test of our text-to-speech capabilities.",
    "In today's rapidly evolving digital landscape, innovation drives success.",
    "Please listen carefully to the following important announcement.",
    "Once upon a time, in a land far away, there lived a wise old wizard."
  ];

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);

    // Simulate audio generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock audio URL (in real app, this would be the generated audio file)
    const mockAudioUrl = "data:audio/wav;base64,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"; // Very short base64 audio for demo

    setGeneratedAudio({
      id: Date.now().toString(),
      url: mockAudioUrl,
      text: text,
      voice: voice,
      timestamp: new Date(),
      duration: Math.floor(text.length / 10) // Rough estimate: ~10 characters per second
    });

    setIsGenerating(false);
  };

  const playPauseAudio = () => {
    if (audioRef.current) {
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
    if (generatedAudio) {
      // In real implementation, this would download the actual audio file
      console.log("Downloading audio:", generatedAudio.url);
    }
  };

  const calculateWordCount = () => text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const calculateCharacterCount = () => text.length;
  const estimatedDuration = Math.max(1, Math.floor(calculateCharacterCount() / 15)); // ~15 chars per second

  const previewPane = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <AudioLines className="w-5 h-5 mr-2" />
          Generated Audio
          {generatedAudio && (
            <Badge variant="default" className="ml-2">
              {Math.floor(generatedAudio.duration / 60)}:{(generatedAudio.duration % 60).toString().padStart(2, '0')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!generatedAudio && !isGenerating && (
          <div className="text-center py-12">
            <AudioLines className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No audio generated yet
            </p>
            <p className="text-sm text-gray-400">
              Enter text and click Generate to create audio
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-600 font-medium">Generating audio...</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Creating natural speech from your text</p>
          </div>
        )}

        {generatedAudio && (
          <div className="space-y-6">
            {/* Audio Player */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  onClick={playPauseAudio}
                  size="lg"
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {voices.find(v => v.value === generatedAudio.voice)?.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {generatedAudio.duration}s
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-0 transition-all duration-200"></div>
                  </div>
                </div>
              </div>

              {/* Waveform Visualization (Mock) */}
              <div className="flex items-center justify-center space-x-1 h-16 mb-4">
                {Array.from({ length: 50 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-t from-blue-400 to-purple-400 rounded-full transition-all duration-200"
                    style={{
                      width: '3px',
                      height: `${Math.random() * 60 + 10}px`,
                      opacity: isPlaying ? 0.8 : 0.4
                    }}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  "{generatedAudio.text.substring(0, 150)}..."
                </p>
                <Button onClick={downloadAudio} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download MP3
                </Button>
              </div>
            </div>

            {/* Audio Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Voice:</span> {voices.find(v => v.value === generatedAudio.voice)?.label}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {generatedAudio.duration} seconds
              </div>
              <div>
                <span className="font-medium">Characters:</span> {generatedAudio.text.length}
              </div>
              <div>
                <span className="font-medium">Generated:</span> {generatedAudio.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {/* Hidden audio element for playback */}
            <audio
              ref={audioRef}
              src={generatedAudio.url}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              style={{ display: 'none' }}
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
        credits="100 credits"
        estimatedTime="~15s"
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        canGenerate={!!text.trim() && text.length <= 5000}
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
                placeholder="Enter the text you want to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px]"
                maxLength={5000}
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
              <Label>Voice</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      <div className="flex justify-between w-full">
                        <div>
                          <div className="font-medium">{v.label}</div>
                          <div className="text-xs text-gray-500">{v.description}</div>
                        </div>
                        <Badge variant="outline" className="text-xs ml-4">
                          {v.gender}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Speed: {speed[0]}x</Label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                max={2}
                min={0.25}
                step={0.25}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                0.25x = Very slow, 1x = Normal, 2x = Very fast
              </p>
            </div>

            <div>
              <Label>Pitch: {pitch[0]}</Label>
              <Slider
                value={pitch}
                onValueChange={setPitch}
                max={2}
                min={0.5}
                step={0.1}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                0.5 = Lower pitch, 1.0 = Natural, 2.0 = Higher pitch
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Text Templates */}
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