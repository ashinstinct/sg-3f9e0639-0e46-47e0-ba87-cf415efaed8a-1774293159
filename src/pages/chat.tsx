import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Zap, Lock } from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  company: string;
  description: string;
  tier: "free" | "pro";
  icon: string;
  creditsPerMessage?: number;
  color: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    company: "OpenAI",
    description: "Advanced reasoning and conversation",
    tier: "pro",
    icon: "🤖",
    creditsPerMessage: 10,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "claude",
    name: "Claude",
    company: "Anthropic",
    description: "Deep analysis and code understanding",
    tier: "pro",
    icon: "🧠",
    creditsPerMessage: 12,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "gemini",
    name: "Gemini Pro",
    company: "Google",
    description: "Multimodal AI with image understanding",
    tier: "pro",
    icon: "✨",
    creditsPerMessage: 8,
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "grok",
    name: "Grok",
    company: "xAI",
    description: "Real-time knowledge with humor",
    tier: "free",
    icon: "⚡",
    creditsPerMessage: 0,
    color: "from-orange-500 to-red-600",
  },
  {
    id: "minimax",
    name: "MiniMax",
    company: "MiniMax",
    description: "Fast and efficient responses",
    tier: "free",
    icon: "💫",
    creditsPerMessage: 0,
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: "mistral",
    name: "Mistral",
    company: "Mistral AI",
    description: "Fast open-source LLM",
    tier: "free",
    icon: "🌪️",
    creditsPerMessage: 0,
    color: "from-yellow-500 to-orange-600",
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(1000); // Mock credit balance
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectModel = (model: AIModel) => {
    setSelectedModel(model);
    setMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedModel || loading) return;

    // Check credits for paid models
    if (selectedModel.creditsPerMessage && credits < selectedModel.creditsPerMessage) {
      alert(`Insufficient credits. Required: ${selectedModel.creditsPerMessage}, Available: ${credits}`);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      model: selectedModel.name,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Deduct credits for paid models
    if (selectedModel.creditsPerMessage) {
      setCredits((prev) => prev - selectedModel.creditsPerMessage!);
    }

    // Simulate API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `This is a simulated response from ${selectedModel.name}. In production, this would be replaced with actual API integration to ${selectedModel.company}'s models.`,
        timestamp: new Date(),
        model: selectedModel.name,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  if (!selectedModel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-white">AI Chat Agents</h1>
              <div className="text-right">
                <p className="text-sm text-slate-400">Credits Balance</p>
                <p className="text-lg font-bold text-cyan-400">{credits.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Choose Your AI Agent
            </h2>
            <p className="text-slate-400 text-lg">
              Select from multiple AI models, each with unique strengths
            </p>
          </div>

          {/* Model Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => handleSelectModel(model)}
                className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 text-left"
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                />

                <Card className="relative p-6 bg-slate-800/50 backdrop-blur border-slate-700 hover:border-slate-600 h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{model.icon}</div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{model.name}</h3>
                        <p className="text-xs text-slate-400">{model.company}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 mb-4">{model.description}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      {model.tier === "pro" ? (
                        <>
                          <Lock size={16} className="text-amber-400" />
                          <span className="text-xs font-semibold text-amber-400">
                            {model.creditsPerMessage} credits/msg
                          </span>
                        </>
                      ) : (
                        <>
                          <Zap size={16} className="text-green-400" />
                          <span className="text-xs font-semibold text-green-400">FREE</span>
                        </>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className={`${
                        model.tier === "pro"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      Select
                    </Button>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedModel(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Change Model</span>
            </button>
            <div className="text-center">
              <div className="text-2xl mb-1">{selectedModel.icon}</div>
              <h1 className="font-bold text-white">{selectedModel.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Credits</p>
              <p className="text-lg font-bold text-cyan-400">{credits.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="text-6xl mb-4">{selectedModel.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Start chatting with {selectedModel.name}
                </h2>
                <p className="text-slate-400">
                  {selectedModel.tier === "pro"
                    ? `Each message costs ${selectedModel.creditsPerMessage} credits`
                    : "Free to use"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-cyan-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-100 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 gap-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}