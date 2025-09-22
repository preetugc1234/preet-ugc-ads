import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Copy, Download, RotateCcw, Sparkles, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ToolEditorLayout from "@/components/dashboard/ToolEditorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { api, apiHelpers } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/supabase";

const ChatTool = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2000]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const models = [
    {
      value: "gpt-4o-mini",
      label: "GPT-4o Mini",
      description: "Fast marketing content generation",
      time: "~2s",
      bestFor: "Quick social media posts, captions, hashtags"
    },
    {
      value: "gpt-4",
      label: "GPT-4",
      description: "Advanced marketing strategies",
      time: "~5s",
      bestFor: "Detailed campaigns, SEO content, scripts"
    },
    {
      value: "claude-3-haiku",
      label: "Claude 3 Haiku",
      description: "Creative content generation",
      time: "~8s",
      bestFor: "Creative copy, storytelling, brand voice"
    },
    {
      value: "claude-3-sonnet",
      label: "Claude 3 Sonnet",
      description: "Comprehensive content strategy",
      time: "~10s",
      bestFor: "Long-form content, strategy docs, analysis"
    }
  ];

  const promptTemplates = [
    "Create an Instagram caption for...",
    "Write a YouTube title and description for...",
    "Generate 30 hashtags for...",
    "Create a Facebook ad copy for...",
    "Write a TikTok video script about...",
    "Design an email marketing campaign for...",
    "Create SEO meta tags for...",
    "Write a product description for...",
    "Generate a social media content calendar...",
    "Create a brand voice guide for..."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setStreamingResponse("");
    const currentPrompt = prompt;
    setPrompt("");

    try {
      // Call the actual OpenRouter API with marketing focus
      const response = await fetch(`${API_BASE_URL}/api/generate/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentPrompt,
          model: model,
          conversation_history: messages.slice(-10).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          max_tokens: maxTokens[0],
          temperature: temperature[0]
        }),
      });

      const result = await response.json();

      if (result.success && result.content) {
        // Simulate streaming for better UX
        const responseText = result.content;

        for (let i = 0; i < responseText.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 10));
          setStreamingResponse(responseText.slice(0, i + 1));
        }

        // Add final message
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant' as const,
          content: responseText,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback response
        const fallbackText = `I apologize, but I'm having trouble processing your request right now. This might be due to API limitations or connectivity issues. Please try again in a moment.`;

        setStreamingResponse(fallbackText);

        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant' as const,
          content: fallbackText,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat generation failed:', error);

      const errorText = `I'm sorry, but I encountered an error while processing your request. Please check your connection and try again.`;
      setStreamingResponse(errorText);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: errorText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    }

    setStreamingResponse("");
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingResponse("");
  };

  const previewPane = (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat Response
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={clearChat} disabled={isGenerating}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-96">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !streamingResponse && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Start a conversation by entering your message below
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.type === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                      onClick={() => copyToClipboard(message.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Streaming Response */}
          {streamingResponse && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{streamingResponse}</p>
                <div className="w-2 h-4 bg-blue-500 animate-pulse inline-block ml-1" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Textarea
              placeholder="Type your message here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              className="flex-1 min-h-[60px] max-h-[120px]"
              disabled={isGenerating}
            />
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              size="sm"
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <ToolEditorLayout
        toolName="Marketing AI Chat"
        toolIcon={MessageSquare}
        credits="Free"
        estimatedTime={models.find(m => m.value === model)?.time || "~5s"}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        canGenerate={!!prompt.trim()}
        previewPane={previewPane}
      >
        {/* Model Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Model Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="model">AI Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{m.label}</span>
                          <Badge variant="outline" className="text-xs">{m.time}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{m.description}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Best for: {m.bestFor}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Temperature: {temperature[0]}</Label>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                max={2}
                min={0}
                step={0.1}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower = more focused, Higher = more creative
              </p>
            </div>

            <div>
              <Label>Max Tokens: {maxTokens[0]}</Label>
              <Slider
                value={maxTokens}
                onValueChange={setMaxTokens}
                max={4000}
                min={100}
                step={100}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum response length
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Focus Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Marketing AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                🎯 Specialized for Marketing
              </h4>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p>• Social media content & captions</p>
                <p>• SEO titles & descriptions</p>
                <p>• Ad copy & marketing scripts</p>
                <p>• Hashtags & content strategy</p>
                <p>• Brand voice & storytelling</p>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-1">🤖 All responses include:</p>
              <p>• Structured markdown formatting</p>
              <p>• H1, H2, H3 headings for clarity</p>
              <p>• Actionable insights & examples</p>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Quick Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {promptTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => setPrompt(template)}
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

export default ChatTool;