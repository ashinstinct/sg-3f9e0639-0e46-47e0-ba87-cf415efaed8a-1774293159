import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { ModelSelector, ModelOption } from "@/components/ModelSelector";
import { SEO } from "@/components/SEO";
import { Send, Plus, Mic, PenLine, BookOpen, Search, Sparkles, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const chatModels: ModelOption[] = [
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", description: "Anthropic flagship reasoning", logo: "/logos/google.svg", tier: "pro" },
  { id: "gpt-5.4", name: "OpenAI GPT-5.4", description: "Flagship model", logo: "/logos/google.svg", tier: "pro" },
  { id: "gpt-5.3", name: "OpenAI GPT-5.3", description: "Instant replies", logo: "/logos/google.svg", tier: "pro" },
  { id: "gpt-5.1", name: "OpenAI GPT-5.1", description: "Advanced reasoning", logo: "/logos/google.svg", tier: "pro" },
  { id: "gpt-5", name: "OpenAI GPT-5", description: "Intelligent chat model", logo: "/logos/google.svg", tier: "pro" },
  { id: "gpt-4o", name: "OpenAI GPT-4o", description: "Reliable, strong reasoning", logo: "/logos/google.svg", tier: "free" },
  { id: "gpt-4o-mini", name: "OpenAI GPT-4o Mini", description: "Fast and responsive", logo: "/logos/google.svg", tier: "free" },
  { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro", description: "Google flagship reasoning", logo: "/logos/google.svg", tier: "pro" },
  { id: "gemini-3-pro", name: "Gemini 3 Pro", description: "Reasoning, large context", logo: "/logos/google.svg", tier: "pro" },
  { id: "gemini", name: "Gemini", description: "Excellent all-rounder", logo: "/logos/google.svg", tier: "free" },
  { id: "qwen-3-max", name: "Qwen 3 Max", description: "Handles long, detailed work", logo: "/logos/google.svg", tier: "pro" },
  { id: "llama-3.3", name: "Llama 3.3", description: "Versatile for everyday tasks", logo: "/logos/google.svg", tier: "free" },
  { id: "deepinfra-kimi-k2", name: "DeepInfra Kimi K2", description: "Great for tough questions", logo: "/logos/google.svg", tier: "pro" },
  { id: "minimax", name: "MiniMax", description: "Creative writing and generation", logo: "/logos/minimax.svg", tier: "pro" },
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response - will connect to actual APIs later
    setTimeout(() => {
      const model = chatModels.find((m) => m.id === selectedModel);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: `This is a placeholder response from ${model?.name || "AI"}. API integration coming soon — this will connect to real ${model?.name} endpoints for text, image generation, video creation, and more.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: "Help me write", icon: PenLine },
    { label: "Learn about", icon: BookOpen },
    { label: "Analyze image", icon: Search },
  ];

  return (
    <>
      <SEO title="AI Chat — Back2Life.Studio" description="Chat with top AI models including ChatGPT, Claude, Gemini, and more" />
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />

        {/* Top Bar with Model Selector */}
        <div className="fixed top-14 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/30">
          <div className="flex items-center justify-center py-2 px-4">
            <ModelSelector
              models={chatModels}
              selected={selectedModel}
              onSelect={setSelectedModel}
            />
          </div>
        </div>

        {/* Chat Area */}
        <main className="flex-1 pt-28 pb-48 px-4">
          <div className="max-w-2xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  How can I help you?
                </h1>
                <p className="text-muted-foreground text-sm max-w-md mb-8">
                  Chat with AI to create images, videos, write scripts, edit media, and more.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Input Area - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border/30 z-40">
          <div className="max-w-2xl mx-auto px-4 py-3">
            {/* Input Bar */}
            <div className="flex items-end gap-2 bg-muted/50 border border-border/50 rounded-2xl px-4 py-2">
              <button className="flex-shrink-0 p-1.5 hover:bg-muted rounded-lg transition-colors mb-0.5">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground min-h-[24px] max-h-[120px] py-1"
              />
              <button className="flex-shrink-0 p-1.5 hover:bg-muted rounded-lg transition-colors mb-0.5">
                <Mic className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 p-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-30 disabled:hover:bg-slate-600 rounded-full transition-colors mb-0.5"
              >
                <Send className="w-4 h-4 text-white rotate-45" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => setInput(action.label + ": ")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-full hover:bg-muted transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{action.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setInput("Generate an image of ")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-full hover:bg-muted transition-colors whitespace-nowrap flex-shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Generate image</span>
              </button>
              <button
                onClick={() => setInput("Create a video of ")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border/50 rounded-full hover:bg-muted transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Video className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Create video</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}