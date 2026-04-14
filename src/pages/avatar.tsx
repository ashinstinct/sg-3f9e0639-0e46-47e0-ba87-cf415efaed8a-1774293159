import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Loader2, Video, Download, RefreshCw, Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";

interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url?: string;
}

interface Voice {
  voice_id: string;
  language: string;
  gender: string;
  name: string;
}

export default function AvatarPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [loadingVoices, setLoadingVoices] = useState(true);

  useEffect(() => {
    loadAvatars();
    loadVoices();
  }, []);

  const loadAvatars = async () => {
    try {
      const response = await fetch("/api/heygen/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_avatars" })
      });
      const data = await response.json();
      if (data.data?.avatars) {
        setAvatars(data.data.avatars);
        if (data.data.avatars.length > 0) {
          setSelectedAvatar(data.data.avatars[0].avatar_id);
        }
      }
    } catch (error) {
      console.error("Failed to load avatars:", error);
    } finally {
      setLoadingAvatars(false);
    }
  };

  const loadVoices = async () => {
    try {
      const response = await fetch("/api/heygen/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_voices" })
      });
      const data = await response.json();
      if (data.data?.voices) {
        setVoices(data.data.voices);
        if (data.data.voices.length > 0) {
          setSelectedVoice(data.data.voices[0].voice_id);
        }
      }
    } catch (error) {
      console.error("Failed to load voices:", error);
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedAvatar || !text || !selectedVoice) return;

    setIsGenerating(true);
    setVideoUrl(null);

    try {
      const response = await fetch("/api/heygen/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_video",
          avatar_id: selectedAvatar,
          voice_id: selectedVoice,
          text: text,
          aspect_ratio: aspectRatio,
          test: false
        })
      });

      const data = await response.json();
      if (data.data?.video_id) {
        setVideoId(data.data.video_id);
        pollVideoStatus(data.data.video_id);
      } else {
        throw new Error("Failed to create video");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/heygen/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get_video_status",
            video_id: id
          })
        });

        const data = await response.json();
        if (data.data?.status === "completed") {
          setVideoUrl(data.data.video_url);
          setIsGenerating(false);
          clearInterval(interval);
        } else if (data.data?.status === "failed") {
          setIsGenerating(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Status check error:", error);
      }
    }, 3000);
  };

  return (
    <>
      <SEO
        title="AI Avatar Video Generator - Back2Life.Studio"
        description="Create professional AI avatar videos with Heygen's technology"
      />
      <div className="min-h-screen bg-black">
        <Navigation />

        <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              AI Avatar Video Generator
            </h1>
            <p className="text-white/60">
              Create professional videos with AI avatars powered by Heygen
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              {/* Avatar Selection */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Select Avatar
                </label>
                {loadingAvatars ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                  </div>
                ) : (
                  <select
                    value={selectedAvatar}
                    onChange={(e) => setSelectedAvatar(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-cyan-500/50 transition-all focus:outline-none focus:border-cyan-500/50"
                  >
                    {avatars.map((avatar) => (
                      <option key={avatar.avatar_id} value={avatar.avatar_id}>
                        {avatar.avatar_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Select Voice
                </label>
                {loadingVoices ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                  </div>
                ) : (
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-cyan-500/50 transition-all focus:outline-none focus:border-cyan-500/50"
                  >
                    {voices.map((voice) => (
                      <option key={voice.voice_id} value={voice.voice_id}>
                        {voice.name} ({voice.language} - {voice.gender})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Script Input */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Script
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text your avatar should say..."
                  className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-white placeholder-white/40 resize-none focus:outline-none focus:border-cyan-500/50 transition-all"
                  rows={6}
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Aspect Ratio
                </label>
                <div className="flex gap-2">
                  {["16:9", "9:16", "1:1"].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        aspectRatio === ratio
                          ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                          : "bg-[#1a1a1c] text-white/60 hover:text-white"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!text || !selectedAvatar || !selectedVoice || isGenerating}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Avatar Video
                  </>
                )}
              </button>
            </div>

            {/* Preview */}
            <div className="bg-[#1a1a1c] rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">Preview</h3>
              {videoUrl ? (
                <div className="space-y-4">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg"
                  />
                  <a
                    href={videoUrl}
                    download
                    className="flex items-center justify-center gap-2 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download Video
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-white/40">
                  <Video className="w-16 h-16 mb-4" />
                  <p className="text-sm">
                    {isGenerating
                      ? "Generating your avatar video..."
                      : "Your generated video will appear here"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}