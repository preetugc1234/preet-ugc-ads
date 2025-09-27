import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Copy, ChevronDown, Bot, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const models = [
    {
      value: "gpt-4o-mini",
      label: "GPT-4o Mini",
      description: "Fast and efficient"
    },
    {
      value: "gpt-4",
      label: "GPT-4",
      description: "Most capable model"
    },
    {
      value: "claude-3-haiku",
      label: "Claude 3 Haiku",
      description: "Fast and lightweight"
    },
    {
      value: "claude-3-sonnet",
      label: "Claude 3 Sonnet",
      description: "Balanced performance"
    }
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
          max_tokens: 2000,
          temperature: 0.7
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
    toast({
      title: "Copied to clipboard",
      description: "Message copied successfully",
    });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 && !streamingResponse ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h3>
                  <p className="text-gray-500">Start a conversation by typing a message below</p>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-6 py-6">
                {messages.map((message) => (
                  <div key={message.id} className="mb-8">
                    <div className="flex items-start space-x-4">
                      {message.type === 'user' ? (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          {message.type === 'user' ? 'You' : 'Assistant'}
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700">
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                        {message.type === 'assistant' && (
                          <div className="flex items-center mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 px-2 rounded-lg"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Streaming Response */}
                {streamingResponse && (
                  <div className="mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-2">Assistant</div>
                        <div className="prose prose-sm max-w-none text-gray-700">
                          <div className="whitespace-pre-wrap">{streamingResponse}</div>
                          <div className="w-2 h-5 bg-gray-500 animate-pulse inline-block ml-1 rounded-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-3xl mx-auto px-6 py-4">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (prompt.trim() && !isGenerating) {
                        handleGenerate();
                      }
                    }
                  }}
                  placeholder="Message Chat..."
                  disabled={isGenerating}
                  className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-20 text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:outline-none focus:ring-0 bg-white"
                  style={{ minHeight: '52px', maxHeight: '200px' }}
                />

                {/* Model Selector & Send Button */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                  {/* Model Selector */}
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-auto h-8 px-3 bg-gray-50 border-gray-200 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">
                      <SelectValue />
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg min-w-48">
                      {models.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="hover:bg-gray-50 rounded-lg">
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-gray-900 text-sm">{m.label}</span>
                            <span className="text-xs text-gray-500">{m.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Send Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-8 h-8 p-0 bg-black hover:bg-gray-800 disabled:bg-gray-300 rounded-full flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>Free to use</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatTool;