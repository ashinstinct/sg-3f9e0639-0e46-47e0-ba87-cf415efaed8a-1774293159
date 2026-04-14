import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  Wand2, 
  Download, 
  Loader2, 
  Mic,
  FileAudio,
  X,
  Sparkles,
  Eye,
  Trash2,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { saveToLibrary, getLibraryItems, deleteLibraryItem } from "@/services/libraryService";
import { useRouter } from "next/router";

const PRESET_AVATARS = [
  {
    id: "sarah",
    name: "Sarah",
    description: "Professional Business Woman",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
  },
  {
    id: "alex",
    name: "Alex",
    description: "Casual Friendly Man",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
  },
  {
    id: "emma",
    name: "Emma",
    description: "Creative Professional",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"
  },
  {
    id: "james",
    name: "James",
    description: "Corporate Business Man",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
  },
  {
    id: "sophie",
    name: "Sophie",
    description: "Warm Friendly Woman",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
  },
  {
    id: "david",
    name: "David",
    description: "Tech Professional",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
  }
];

const VOICES = [
  { 
    id: "ash", 
    name: "Ash", 
    accent: "British",
    gender: "Male",
    tone: "Professional & Authoritative",
    bestFor: "Business presentations, corporate videos, educational content"
  },
  { 
    id: "bella", 
    name: "Bella", 
    accent: "American",
    gender: "Female",
    tone: "Friendly & Engaging",
    bestFor: "Marketing videos, social media content, tutorials"
  },
  { 
    id: "charlie", 
    name: "Charlie", 
    accent: "American",
    gender: "Male",
    tone: "Casual & Approachable",
    bestFor: "Explainer videos, product demos, vlogs"
  },
  { 
    id: "luna", 
    name: "Luna", 
    accent: "British",
    gender: "Female",
    tone: "Elegant & Sophisticated",
    bestFor: "Luxury brands, formal content, documentaries"
  },
  { 
    id: "oliver", 
    name: "Oliver", 
    accent: "Australian",
    gender: "Male",
    tone: "Warm & Charismatic",
    bestFor: "Travel content, lifestyle videos, entertainment"
  },
  { 
    id: "sophia", 
    name: "Sophia", 
    accent: "Australian",
    gender: "Female",
    tone: "Friendly & Authentic",
    bestFor: "Wellness content, personal brands, storytelling"
  }
];

const ASPECT_RATIOS = [
  { 
    id: "16:9", 
    name: "Landscape", 
    icon: "📺",
    width: "w-16",
    height: "h-9",
    description: "Perfect for YouTube, presentations"
  },
  { 
    id: "9:16", 
    name: "Portrait", 
    icon: "📱",
    width: "w-9",
    height: "h-16",
    description: "TikTok, Instagram Stories"
  },
  { 
    id: "1:1", 
    name: "Square", 
    icon: "⬜",
    width: "w-12",
    height: "h-12",
    description: "Instagram posts, Facebook"
  }
];

export default function AvatarPage() {
  const [mode, setMode] = useState<"text" | "audio">("text");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [script, setScript] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [savedVideos, setSavedVideos] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadSavedVideos();
  }, []);

  const loadSavedVideos = async () => {
    try {
      setLoadingGallery(true);
      const items = await getLibraryItems("avatar");
      setSavedVideos(items || []);
    } catch (error) {
      console.error("Error loading saved videos:", error);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result as string);
        setShowImagePreview(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload MP3, WAV, or M4A audio file",
          variant: "destructive"
        });
        return;
      }

      setAudioFile(file);
      toast({
        title: "Audio uploaded",
        description: file.name
      });
    }
  };

  const enhancePrompt = async () => {
    if (!script.trim()) {
      toast({
        title: "No text to enhance",
        description: "Please enter some text first",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: script })
      });

      const data = await response.json();
      
      if (data.enhanced_prompt) {
        setScript(data.enhanced_prompt);
        toast({
          title: "Script enhanced!",
          description: "Your script has been improved with AI"
        });
      }
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: "Could not enhance script",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (mode === "text" && !script.trim()) {
      toast({
        title: "Script required",
        description: "Please enter text for your avatar to say",
        variant: "destructive"
      });
      return;
    }

    if (mode === "audio" && !audioFile) {
      toast({
        title: "Audio required",
        description: "Please upload an audio file",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);

    try {
      const formData = new FormData();
      formData.append("avatar_image", customAvatar || selectedAvatar.image);
      formData.append("aspect_ratio", aspectRatio.id);
      formData.append("mode", mode);

      if (mode === "text") {
        formData.append("text", script);
        formData.append("voice_id", selectedVoice.id);
      } else {
        formData.append("audio", audioFile!);
      }

      const response = await fetch("/api/heygen/avatar", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success && data.video_url) {
        setGeneratedVideo(data.video_url);
        
        // Save to library
        await saveToLibrary({
          url: data.video_url,
          type: "avatar",
          metadata: {
            avatar: customAvatar ? "custom" : selectedAvatar.name,
            voice: mode === "text" ? selectedVoice.name : "custom audio",
            script: mode === "text" ? script.substring(0, 100) : "Custom audio",
            aspect_ratio: aspectRatio.id
          }
        });

        // Reload gallery
        loadSavedVideos();

        toast({
          title: "Avatar generated!",
          description: "Your avatar video is ready"
        });
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteLibraryItem(id);
      loadSavedVideos();
      toast({
        title: "Video deleted",
        description: "Avatar video removed from library"
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete video",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `avatar-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download video",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <SEO 
        title="AI Avatar Generator - Back2Life.Studio"
        description="Create talking avatar videos with AI. Text-to-speech or upload audio for lip sync."
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 mt-20">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              AI Avatar Generator
            </h1>
            <p className="text-white/60 text-lg">
              Create talking avatar videos with text-to-speech or audio upload
            </p>
          </div>

          {/* Generator Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Left Panel - Controls */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-6">
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                <button
                  onClick={() => setMode("text")}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2",
                    mode === "text"
                      ? "bg-cyan-500 text-white"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  <Mic className="w-4 h-4" />
                  Text-to-Speech
                </button>
                <button
                  onClick={() => setMode("audio")}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2",
                    mode === "audio"
                      ? "bg-cyan-500 text-white"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  <FileAudio className="w-4 h-4" />
                  Audio Upload
                </button>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {PRESET_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => {
                        setSelectedAvatar(avatar);
                        setCustomAvatar(null);
                      }}
                      className={cn(
                        "relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105",
                        selectedAvatar.id === avatar.id && !customAvatar
                          ? "border-cyan-400 ring-2 ring-cyan-400/50"
                          : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                        <div className="text-left">
                          <p className="text-white text-xs font-semibold">{avatar.name}</p>
                          <p className="text-white/60 text-[10px]">{avatar.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Upload Custom Avatar */}
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  {!customAvatar ? (
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer transition-all hover:border-cyan-400/50 hover:bg-white/5">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                      <p className="text-sm text-white/80">Upload Your Photo</p>
                      <p className="text-xs text-white/40 mt-1">Click to select image</p>
                    </div>
                  ) : (
                    <div className="border-2 border-cyan-400 bg-cyan-400/10 rounded-xl p-3 cursor-pointer transition-all hover:border-cyan-500">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <img
                            src={customAvatar}
                            alt="Custom avatar"
                            className="w-full h-full object-cover rounded-lg border-2 border-cyan-400/50"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm text-white font-semibold">Custom Photo</p>
                          <p className="text-xs text-white/60">Click to change</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowImagePreview(true);
                          }}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Voice Selection (Text Mode) */}
              {mode === "text" && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Select Voice
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {VOICES.map((voice) => (
                      <div key={voice.id} className="relative">
                        <button
                          onClick={() => setSelectedVoice(voice)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-lg border-2 transition-all",
                            selectedVoice.id === voice.id
                              ? "border-cyan-400 bg-cyan-400/10"
                              : "border-white/10 hover:border-white/30 bg-white/5"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-white">{voice.name}</p>
                              <p className="text-xs text-white/60">{voice.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                previewVoice(voice);
                              }}
                              className={cn(
                                "h-8 w-8 p-0 ml-2",
                                previewingVoice === voice.id
                                  ? "text-cyan-400"
                                  : "text-white/60 hover:text-white"
                              )}
                            >
                              {previewingVoice === voice.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Upload (Audio Mode) */}
              {mode === "audio" && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Upload Audio File
                  </label>
                  {!audioFile ? (
                    <label className="block">
                      <input
                        type="file"
                        accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-400/50 hover:bg-white/5 transition-all">
                        <FileAudio className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                        <p className="text-sm text-white/80 mb-1">Upload Audio File</p>
                        <p className="text-xs text-white/40">MP3, WAV, M4A supported</p>
                      </div>
                    </label>
                  ) : (
                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileAudio className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-sm text-white">{audioFile.name}</p>
                          <p className="text-xs text-white/40">
                            {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAudioFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Script (Text Mode) */}
              {mode === "text" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-white/80">
                      Script
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={enhancePrompt}
                      disabled={isEnhancing || !script.trim()}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {isEnhancing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Enhance
                    </Button>
                  </div>
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Enter what you want your avatar to say..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-white/40 mt-2">
                    {script.length} characters
                  </p>
                </div>
              )}

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio)}
                      className={cn(
                        "px-4 py-4 rounded-lg border-2 transition-all group",
                        aspectRatio.id === ratio.id
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-white/10 hover:border-white/30 bg-white/5"
                      )}
                    >
                      {/* Visual Preview */}
                      <div className="flex items-center justify-center mb-2">
                        <div className={cn(
                          "border-2 rounded transition-all",
                          aspectRatio.id === ratio.id
                            ? "border-cyan-400 bg-cyan-400/20"
                            : "border-white/30 bg-white/5 group-hover:border-white/50",
                          ratio.width,
                          ratio.height
                        )} />
                      </div>
                      {/* Text */}
                      <div className={cn(
                        "text-xs font-semibold mb-1",
                        aspectRatio.id === ratio.id ? "text-cyan-400" : "text-white"
                      )}>
                        {ratio.name}
                      </div>
                      <div className={cn(
                        "text-[10px]",
                        aspectRatio.id === ratio.id ? "text-cyan-400/80" : "text-white/40"
                      )}>
                        {ratio.id}
                      </div>
                      <div className="text-[9px] text-white/30 mt-1">
                        {ratio.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-6"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Avatar...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Avatar (15 Credits)
                  </>
                )}
              </Button>
            </div>

            {/* Right Panel - Preview */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              
              {!generatedVideo ? (
                <div className="aspect-video bg-black/20 rounded-xl border border-white/10 flex items-center justify-center">
                  <img
                    src={customAvatar || selectedAvatar.image}
                    alt="Avatar preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <video
                    src={generatedVideo}
                    controls
                    className="w-full aspect-video bg-black rounded-xl"
                  />
                  <Button
                    onClick={() => handleDownload(generatedVideo)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Gallery Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Avatar Videos</h2>
              <p className="text-white/40 text-sm">{savedVideos.length} videos</p>
            </div>

            {loadingGallery ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : savedVideos.length === 0 ? (
              <div className="text-center py-12">
                <Wand2 className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/40">No avatar videos yet</p>
                <p className="text-white/20 text-sm mt-2">Generate your first avatar above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="group relative bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-cyan-400/50 transition-all"
                  >
                    <video
                      src={video.url}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const videoEl = document.createElement("video");
                              videoEl.src = video.url;
                              videoEl.controls = true;
                              videoEl.className = "w-full rounded-lg";
                              const modal = document.createElement("div");
                              modal.className = "fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8";
                              modal.onclick = () => modal.remove();
                              modal.appendChild(videoEl);
                              document.body.appendChild(modal);
                            }}
                            className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(video.url)}
                            variant="outline"
                            className="bg-white/10 border-white/20 hover:bg-white/20"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                            variant="outline"
                            className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-2 text-xs text-white/60">
                          <p className="font-medium text-white">{video.metadata?.avatar || "Avatar"}</p>
                          <p className="truncate">{video.metadata?.script || "Custom audio"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Image Preview Modal */}
        {showImagePreview && customAvatar && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
            onClick={() => setShowImagePreview(false)}
          >
            <div className="relative max-w-4xl w-full">
              <Button
                onClick={() => setShowImagePreview(false)}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
              <img
                src={customAvatar}
                alt="Avatar preview"
                className="w-full h-auto rounded-2xl border-2 border-cyan-400/50"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="mt-4 text-center">
                <p className="text-white text-lg font-semibold mb-2">Custom Avatar Preview</p>
                <p className="text-white/60 text-sm">This photo will be used for your avatar video</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}