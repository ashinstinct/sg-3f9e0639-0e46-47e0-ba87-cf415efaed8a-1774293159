import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Sparkles, Upload, Loader2, Download, Mic } from "lucide-react";

// Pre-defined avatar images
const AVATAR_OPTIONS = [
  {
    id: "female-professional",
    name: "Sarah - Professional",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces",
    description: "Professional business avatar"
  },
  {
    id: "male-casual",
    name: "Alex - Casual",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    description: "Friendly casual avatar"
  },
  {
    id: "female-creative",
    name: "Emma - Creative",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
    description: "Creative professional avatar"
  },
  {
    id: "male-business",
    name: "James - Business",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
    description: "Corporate business avatar"
  },
  {
    id: "female-friendly",
    name: "Sophie - Friendly",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
    description: "Warm friendly avatar"
  },
  {
    id: "male-tech",
    name: "David - Tech",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    description: "Tech professional avatar"
  }
];

// Voice options for Hedra
const VOICE_OPTIONS = [
  { id: "ash", name: "Ash - Male British" },
  { id: "bella", name: "Bella - Female American" },
  { id: "charlie", name: "Charlie - Male American" },
  { id: "luna", name: "Luna - Female British" },
  { id: "oliver", name: "Oliver - Male Australian" },
  { id: "sophia", name: "Sophia - Female Australian" }
];

type InputMode = "text" | "audio";

export default function AvatarPage() {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [script, setScript] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAudioPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (inputMode === "text" && !script.trim()) {
      setError("Please enter a script for the avatar to speak");
      return;
    }

    if (inputMode === "audio" && !audioFile) {
      setError("Please upload an audio file");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      const payload: {
        avatarImage: string;
        text?: string;
        voice?: string;
        audioSource?: string;
      } = {
        avatarImage: customAvatar || selectedAvatar.image,
      };

      if (inputMode === "text") {
        payload.text = script;
        payload.voice = selectedVoice;
      } else {
        payload.audioSource = audioPreview!;
      }

      const response = await fetch("/api/heygen/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate avatar video");
      }

      setGeneratedVideo(data.video_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const avatarToUse = customAvatar || selectedAvatar.image;

  return (
    <>
      <SEO
        title="AI Avatar Generator - Back2Life.Studio"
        description="Create talking avatar videos with AI using Hedra"
      />
      <div className="min-h-screen bg-[#0a0a0b]">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI Avatar Generator
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Create professional talking avatar videos with AI using Hedra
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Settings */}
            <div className="space-y-6">
              {/* Avatar Selection */}
              <div className="bg-[#151518] border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Select Avatar</h2>
                
                {/* Custom Avatar Upload */}
                <div className="mb-6">
                  <label className="block text-sm text-white/60 mb-2">Upload Custom Avatar</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-white/60 cursor-pointer hover:border-cyan-500/50 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{customAvatar ? "Change Avatar" : "Upload Your Photo"}</span>
                    </label>
                  </div>
                </div>

                {/* Pre-made Avatars Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => {
                        setSelectedAvatar(avatar);
                        setCustomAvatar(null);
                      }}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        selectedAvatar.id === avatar.id && !customAvatar
                          ? "border-cyan-500 ring-2 ring-cyan-500/50"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs text-white font-medium truncate">
                          {avatar.name.split(" - ")[0]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {customAvatar && (
                  <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-sm text-cyan-400">✓ Using custom avatar</p>
                  </div>
                )}
              </div>

              {/* Input Mode Toggle */}
              <div className="bg-[#151518] border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Audio Source</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setInputMode("text")}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                      inputMode === "text"
                        ? "bg-cyan-500 text-white"
                        : "bg-[#1a1a1c] text-white/60 hover:text-white"
                    }`}
                  >
                    Text to Speech
                  </button>
                  <button
                    onClick={() => setInputMode("audio")}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                      inputMode === "audio"
                        ? "bg-cyan-500 text-white"
                        : "bg-[#1a1a1c] text-white/60 hover:text-white"
                    }`}
                  >
                    Upload Audio
                  </button>
                </div>
              </div>

              {/* Text Input Mode */}
              {inputMode === "text" && (
                <>
                  {/* Voice Selection */}
                  <div className="bg-[#151518] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Voice</h2>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-cyan-500/50 transition-all"
                    >
                      {VOICE_OPTIONS.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Script Input */}
                  <div className="bg-[#151518] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Script</h2>
                    <textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      placeholder="Enter what you want the avatar to say..."
                      className="w-full h-40 px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:border-cyan-500/50"
                    />
                    <p className="text-xs text-white/40 mt-2">
                      {script.length} characters
                    </p>
                  </div>
                </>
              )}

              {/* Audio Upload Mode */}
              {inputMode === "audio" && (
                <div className="bg-[#151518] border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Upload Audio</h2>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label
                      htmlFor="audio-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-white/60 cursor-pointer hover:border-cyan-500/50 transition-all"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{audioFile ? audioFile.name : "Choose Audio File"}</span>
                    </label>
                  </div>

                  {audioPreview && (
                    <div className="mt-4">
                      <audio controls className="w-full">
                        <source src={audioPreview} />
                      </audio>
                    </div>
                  )}

                  <p className="text-xs text-white/40 mt-3">
                    Upload MP3, WAV, or any audio file. The avatar will lip sync to your audio.
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={
                  (inputMode === "text" && !script) ||
                  (inputMode === "audio" && !audioFile) ||
                  isGenerating
                }
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Avatar Video...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    GENERATE AVATAR
                    <span className="text-white/40 mx-1">|</span>
                    <span className="text-yellow-400">🪙</span>
                    <span>15</span>
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className="bg-[#151518] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
              
              <div className="aspect-video bg-[#1a1a1c] rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                {generatedVideo ? (
                  <video
                    src={generatedVideo}
                    controls
                    className="w-full h-full"
                  />
                ) : (
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white/10">
                      <img
                        src={avatarToUse}
                        alt="Selected avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-white/40">
                      {isGenerating ? "Generating your avatar video..." : "Your avatar video will appear here"}
                    </p>
                    {inputMode === "text" && script && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-white/60 mb-1">Script Preview:</p>
                        <p className="text-sm text-white/80 line-clamp-3">{script}</p>
                      </div>
                    )}
                    {inputMode === "audio" && audioFile && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-white/60">Audio: {audioFile.name}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {generatedVideo && (
                <a
                  href={generatedVideo}
                  download="avatar-video.mp4"
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10"
                >
                  <Download className="w-4 h-4" />
                  Download Video
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}