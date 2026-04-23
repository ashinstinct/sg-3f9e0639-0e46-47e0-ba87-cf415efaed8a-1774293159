import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { ModelSelector, ModelOption } from "@/components/ModelSelector";
import { SEO } from "@/components/SEO";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const chatModels: ModelOption[] = [
  { id: "chatgpt-4o", name: "ChatGPT-4o", description: "Advanced reasoning", logo: "/logos/openai.svg", tier: "pro" },
  { id: "chatgpt-4o-mini", name: "ChatGPT-4o-mini", description: "Fast & efficient", logo: "/logos/openai.svg", tier: "free" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", description: "Deep analysis", logo: "/logos/anthropic.svg", tier: "pro" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Multimodal AI", logo: "/logos/google.svg", tier: "pro" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Long context", logo: "/logos/google.svg", tier: "free" },
  { id: "grok-2", name: "Grok-2", description: "Real-time knowledge", logo: "/logos/grok.svg", tier: "pro" },
  { id: "grok-2-mini", name: "Grok-2-mini", description: "Fast responses", logo: "/logos/grok.svg", tier: "free" },
  { id: "minimax-01", name: "MiniMax-01", description: "Efficient reasoning", logo: "/logos/minimax.svg", tier: "pro" },
  { id: "qwen-2.5", name: "Qwen 2.5", description: "Multilingual model", logo: "/logos/qwen.svg", tier: "pro" },
  { id: "kimi-k1", name: "Kimi K1", description: "Long context expert", logo: "/logos/kimi.svg", tier: "pro" },
  { id: "glm-4", name: "GLM-4", description: "Chinese & English AI", logo: "/logos/glm.svg", tier: "free" },
  { id: "mistral-large", name: "Mistral Large", description: "Open-source LLM", logo: "/logos/mistral.svg", tier: "free" },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("chatgpt-4o-mini");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate API call - replace with actual API integration
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `This is a simulated response from ${chatModels.find(m => m.id === selectedModel)?.name}. In production, this would be replaced with actual API integration.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <SEO
        title="AI Chat Agents - Back2Life.Studio"
        description="Chat with multiple AI models: ChatGPT, Claude, Gemini, Grok, and more"
      />

      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navigation />

        {/* Top Bar: Model Selector - standardized spacing */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 pt-14">
          <div className="flex items-center justify-center px-4 py-2">
            <ModelSelector
              models={chatModels}
              selected={selectedModel}
              onSelect={(id) => {
                setSelectedModel(id);
                setMessages([]);
              }}
            />
          </div>
        </div>

        {/* Chat Messages Area - standardized padding */}
        <div className="flex-1 pt-28 pb-32 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex items-center justify-center text-center">
                <div>
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-light text-white mb-2">
                    Start a conversation
                  </h2>
                  <p className="text-gray-500">
                    {chatModels.find(m => m.id === selectedModel)?.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-8">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-purple-500 text-white rounded-br-none"
                          : "bg-[#1a1a1c] text-white rounded-bl-none border border-white/5"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-2 opacity-50">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#1a1a1c] text-white px-4 py-3 rounded-2xl rounded-bl-none border border-white/5">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-white/5 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 bg-[#161618] border-white/10 text-white placeholder:text-gray-600 min-h-[48px] max-h-[200px] resize-none focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl"
                rows={1}
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-12 w-12 p-0 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-500/30 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </div>
        </div>

        <style jsx>{`
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
        `}</style>
      </div>
    </>
  );
}