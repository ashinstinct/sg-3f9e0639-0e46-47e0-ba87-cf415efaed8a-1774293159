import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Loader2, Video, Download, Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function AvatarPage() {
  const [avatarId, setAvatarId] = useState<string>("Josh_lite3_20230714");
  const [voiceId, setVoiceId] = useState<string>("en-US-JennyNeural");
  const [text, setText] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Common Heygen avatar IDs (you can expand this list)
  const avatars = [
    { id: "Josh_lite3_20230714", name: "Josh (Professional)" },
    { id: "Anna_public_3_20240108", name: "Anna (Business)" },
    { id: "Wayne_20240711", name: "Wayne (Casual)" },
    { id: "Susan_public_2_20240328", name: "Susan (Friendly)" },
    { id: "Eric_public_pro2_20230608", name: "Eric (Corporate)" },
  ];

  // Common voice IDs for Heygen
  const voices = [
    { id: "en-US-JennyNeural", name: "Jenny (US Female)" },
    { id: "en-US-GuyNeural", name: "Guy (US Male)" },
    { id: "en-GB-SoniaNeural", name: "Sonia (UK Female)" },
    { id: "en-GB-RyanNeural", name: "Ryan (UK Male)" },
    { id: "en-AU-NatashaNeural", name: "Natasha (AU Female)" },
    { id: "en-AU-WilliamNeural", name: "William (AU Male)" },
  ];

  const handleGenerate = async () => {
    if (!text || !avatarId || !voiceId) return;

    setIsGenerating(true);
    setVideoUrl(null);

    try {
      const response = await fetch("/api/heygen/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarId,
          voiceId,
          text,
          aspectRatio,
          test: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      if (data.video_url) {
        setVideoUrl(data.video_url);
      }

    } catch (error: any) {
      console.error("Generation error:", error);
      alert(error.message || "Failed to generate avatar video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <SEO
        title="AI Avatar Video Generator - Back2Life.Studio"
        description="Create professional AI avatar videos powered by Heygen via fal.ai"
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
                <select
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-cyan-500/50 transition-all focus:outline-none focus:border-cyan-500/50"
                >
                  {avatars.map((avatar) => (
                    <option key={avatar.id} value={avatar.id}>
                      {avatar.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Select Voice
                </label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1c] border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:border-cyan-500/50 transition-all focus:outline-none focus:border-cyan-500/50"
                >
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
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
                disabled={!text || !avatarId || !voiceId || isGenerating}
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
                    <span className="text-white/40 mx-1">|</span>
                    <span className="text-yellow-400">🪙</span>
                    <span>15</span>
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
                  <p className="text-sm text-center">
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