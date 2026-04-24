import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { ModelSelector, ModelOption } from "@/components/ModelSelector";
import { SEO } from "@/components/SEO";
import { Send, Loader2, Mic, Upload, X, Image, FileText, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const chatModels: ModelOption[] = [
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", description: "Most capable model", logo: "/logos/anthropic.svg", tier: "pro" },
  { id: "claude-3.5-haiku", name: "Claude 3.5 Haiku", description: "Fast & efficient", logo: "/logos/anthropic.svg", tier: "pro" },
  { id: "claude-3.5-opus", name: "Claude 3.5 Opus", description: "Highest intelligence", logo: "/logos/anthropic.svg", tier: "pro" },
  { id: "chatgpt-4o", name: "ChatGPT-4o", description: "Advanced reasoning", logo: "/logos/openai.svg", tier: "pro" },
  { id: "chatgpt-4o-mini", name: "ChatGPT-4o-mini", description: "Fast & efficient", logo: "/logos/openai.svg", tier: "free" },
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
  attachments?: Array<{ name: string; type: string; url: string }>;
}

const quickPrompts = [
  { icon: Film, text: "Create a video script about", prompt: "Create a video script about" },
  { icon: Image, text: "Create image prompts for", prompt: "Create detailed image prompts for" },
  { icon: FileText, text: "Write me a script about", prompt: "Write me a script about" },
  { icon: Image, text: "Create video prompts for", prompt: "Create video generation prompts for" },
];

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("chatgpt-4o-mini");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInput((prev) => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt + " ");
    textareaRef.current?.focus();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && uploadedFiles.length === 0) || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      attachments: uploadedFiles.map(f => ({
        name: f.name,
        type: f.type,
        url: URL.createObjectURL(f),
      })),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedFiles([]);
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
              <div className="h-[50vh] flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-light text-white mb-2">
                  Start a conversation
                </h2>
                <p className="text-gray-500 mb-8">
                  {chatModels.find(m => m.id === selectedModel)?.description}
                </p>

                {/* Quick Prompts */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                  {quickPrompts.map((qp) => {
                    const Icon = qp.icon;
                    return (
                      <button
                        key={qp.text}
                        onClick={() => handleQuickPrompt(qp.prompt)}
                        className="flex items-center gap-2 p-3 rounded-xl bg-[#161618] border border-white/5 hover:border-white/15 hover:bg-[#1a1a1c] transition-all text-left"
                      >
                        <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-sm text-white/80">{qp.text}</span>
                      </button>
                    );
                  })}
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
            {/* File Uploads Display */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-white max-w-[150px] truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-purple-400 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-12 w-12 p-0 bg-[#161618] border border-white/10 hover:bg-[#1a1a1c] hover:border-white/20 text-white/60 hover:text-white rounded-xl"
              >
                <Upload className="w-5 h-5" />
              </Button>

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
                type="button"
                onClick={toggleRecording}
                className={`h-12 w-12 p-0 rounded-xl transition-all ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    : "bg-[#161618] border border-white/10 hover:bg-[#1a1a1c] hover:border-white/20 text-white/60 hover:text-white"
                }`}
              >
                <Mic className={`w-5 h-5 ${isRecording ? "animate-pulse" : ""}`} />
              </Button>

              <Button
                type="submit"
                disabled={loading || (!input.trim() && uploadedFiles.length === 0)}
                className="h-12 w-12 p-0 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-500/30 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>

            {/* Quick Prompts Below Input */}
            {messages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {quickPrompts.map((qp) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={qp.text}
                      onClick={() => handleQuickPrompt(qp.prompt)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161618] border border-white/5 hover:border-white/15 hover:bg-[#1a1a1c] transition-all"
                    >
                      <Icon className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs text-white/60">{qp.text}</span>
                    </button>
                  );
                })}
              </div>
            )}
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