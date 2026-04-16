import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Music, Download, Play, Pause, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { hasEnoughCredits, deductCredits } from "@/services/creditsService";
import { saveToLibrary } from "@/services/libraryService";

const CREDITS_COST = 20;

export default function MusicPage() {
  const [prompt, setPrompt] = useState("");
  const [makeInstrumental, setMakeInstrumental] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<{
    audio_url: string;
    video_url?: string;
    title?: string;
    duration?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const { toast } = useToast();

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Enter a prompt first",
        description: "Write a basic music description to enhance",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (data.enhanced) {
        setPrompt(data.enhanced);
        toast({
          title: "Prompt enhanced!",
          description: "Your music description has been improved",
        });
      }
    } catch (error) {
      console.error("Enhance error:", error);
      toast({
        title: "Enhancement failed",
        description: "Could not enhance prompt",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe the music you want to create");
      return;
    }

    const hasCredits = await hasEnoughCredits(CREDITS_COST);
    if (!hasCredits) {
      setError(`Insufficient credits. You need ${CREDITS_COST} credits to generate music.`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/fal/music-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          make_instrumental: makeInstrumental,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate music");
      }

      if (data.success && data.audio_url) {
        await deductCredits(
          CREDITS_COST,
          "Music Generation (SUNO)",
          {
            prompt: prompt.trim(),
            instrumental: makeInstrumental,
          }
        );

        setGeneratedMusic({
          audio_url: data.audio_url,
          video_url: data.video_url,
          title: data.title,
          duration: data.duration,
        });

        // Save to library
        await saveToLibrary({
          url: data.audio_url,
          type: "music",
          metadata: {
            prompt: prompt.trim(),
            instrumental: makeInstrumental,
          },
        });

        toast({
          title: "Music generated!",
          description: "Your track is ready to play",
        });
      } else {
        throw new Error("No music generated");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate music");
      console.error("Music generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!generatedMusic?.audio_url) return;

    if (!audioElement) {
      const audio = new Audio(generatedMusic.audio_url);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      <SEO
        title="AI Music Generation - SUNO"
        description="Generate original music with AI using SUNO"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Navigation />
        
        <main className="container mx-auto px-4 py-12 pt-24 max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="font-heading font-bold text-5xl mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Make a Song
            </h1>
            <p className="text-lg text-white/60">
              Create music and speech with AI
            </p>
          </div>

          <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-800 mb-8">
            {/* Main Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="prompt" className="text-base font-semibold text-white">
                  Song Description
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={enhancePrompt}
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enhance with AI
                </Button>
              </div>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A cheerful acoustic song about summer days at the beach, with ukulele and gentle vocals"
                className="min-h-[140px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 text-base resize-none focus:ring-purple-500/50"
              />
              <p className="text-xs text-slate-400 mt-2">
                Describe the style, mood, instruments, and theme
              </p>
            </div>

            {/* Instrumental Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 mb-6">
              <div>
                <Label htmlFor="instrumental" className="text-base font-semibold text-white cursor-pointer">
                  Instrumental
                </Label>
                <p className="text-sm text-slate-400">
                  Generate music without vocals
                </p>
              </div>
              <Switch
                id="instrumental"
                checked={makeInstrumental}
                onCheckedChange={setMakeInstrumental}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6 rounded-xl shadow-lg shadow-purple-500/25"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating your song...
                </>
              ) : (
                <>
                  <Music className="w-5 h-5 mr-2" />
                  Create ({CREDITS_COST} credits)
                </>
              )}
            </Button>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </Card>

          {/* Music Player */}
          {generatedMusic && (
            <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-800">
              <div className="text-center mb-6">
                {generatedMusic.title && (
                  <h3 className="text-2xl font-bold text-white mb-2">{generatedMusic.title}</h3>
                )}
                {generatedMusic.duration && (
                  <p className="text-slate-400">
                    {Math.floor(generatedMusic.duration / 60)}:
                    {(generatedMusic.duration % 60).toString().padStart(2, "0")}
                  </p>
                )}
              </div>

              {/* Waveform Visualization */}
              <div className="bg-slate-800/30 rounded-xl p-8 mb-6 flex items-center justify-center">
                <div className="flex items-end gap-1 h-32">
                  {[...Array(50)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all ${
                        isPlaying
                          ? "bg-gradient-to-t from-purple-500 to-pink-500 animate-pulse"
                          : "bg-gradient-to-t from-purple-600/50 to-pink-600/50"
                      }`}
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={togglePlayPause}
                  size="lg"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="flex-1 border-slate-700 hover:bg-slate-800"
                >
                  <a href={generatedMusic.audio_url} download="music.mp3">
                    <Download className="w-5 h-5 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {isGenerating && (
            <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-800">
              <div className="text-center">
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-500" />
                <h3 className="text-xl font-semibold text-white mb-2">Creating your music...</h3>
                <p className="text-slate-400">This usually takes 30-60 seconds</p>
              </div>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}