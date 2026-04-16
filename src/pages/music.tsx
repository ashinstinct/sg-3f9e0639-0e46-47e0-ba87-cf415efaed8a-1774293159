import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Music, Download, Play, Pause, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { hasEnoughCredits, deductCredits } from "@/services/creditsService";
import { saveToLibrary } from "@/services/libraryService";

const CREDITS_COST = 20;

const MODEL_VERSIONS = [
  { id: "chirp-v3-5", name: "Chirp v3.5 (Latest)", description: "Best quality, most creative" },
  { id: "chirp-v3-0", name: "Chirp v3.0", description: "Balanced quality and speed" },
  { id: "chirp-v2-0", name: "Chirp v2.0", description: "Fast generation" },
];

const DURATION_OPTIONS = [
  { value: 15, label: "15 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
];

const MUSIC_STYLES = [
  "Pop", "Rock", "Hip Hop", "Electronic", "Jazz", "Classical",
  "Country", "R&B", "Metal", "Indie", "Folk", "Blues",
  "Reggae", "Latin", "Dance", "Soul", "Funk", "Disco",
];

const MOODS = [
  "Happy", "Sad", "Energetic", "Calm", "Dark", "Uplifting",
  "Melancholic", "Romantic", "Aggressive", "Peaceful", "Epic", "Playful",
];

const INSTRUMENTS = [
  "Guitar", "Piano", "Drums", "Bass", "Violin", "Saxophone",
  "Synthesizer", "Flute", "Trumpet", "Cello", "Organ", "Harp",
];

export default function MusicPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [makeInstrumental, setMakeInstrumental] = useState(false);
  const [modelVersion, setModelVersion] = useState("chirp-v3-5");
  const [duration, setDuration] = useState(30);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<{
    audio_url: string;
    title?: string;
    duration?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const { toast } = useToast();

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments(prev =>
      prev.includes(instrument)
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    );
  };

  const buildFullPrompt = () => {
    const parts = [prompt.trim()];
    
    if (selectedStyle) parts.push(`Style: ${selectedStyle}`);
    if (selectedMood) parts.push(`Mood: ${selectedMood}`);
    if (selectedInstruments.length > 0) {
      parts.push(`Instruments: ${selectedInstruments.join(", ")}`);
    }
    
    return parts.join(". ");
  };

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
    const fullPrompt = buildFullPrompt();
    
    if (!fullPrompt.trim()) {
      setError("Please provide a music description");
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
          prompt: fullPrompt,
          make_instrumental: makeInstrumental,
          wait_audio: true,
          model_version: modelVersion,
          duration,
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
            prompt: fullPrompt,
            model: modelVersion,
            duration,
            instrumental: makeInstrumental,
          }
        );

        setGeneratedMusic({
          audio_url: data.audio_url,
          title: data.title,
          duration: data.duration,
        });

        // Save to library
        await saveToLibrary({
          url: data.audio_url,
          type: "music",
          metadata: {
            prompt: fullPrompt,
            model: modelVersion,
            duration,
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        
        <main className="container mx-auto px-4 py-12 pt-24 max-w-7xl">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Music Generation
            </h1>
            <p className="text-muted-foreground">
              Create original music with SUNO AI - from lyrics to instrumentals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Settings */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm space-y-6">
              {/* Music Description */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="prompt" className="text-base font-semibold">
                    Music Description
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={enhancePrompt}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance
                  </Button>
                </div>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the music you want to create... e.g., 'Upbeat pop song about summer love with catchy chorus'"
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {prompt.length} characters
                </p>
              </div>

              {/* Style Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Music Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {MUSIC_STYLES.map((style) => (
                    <Button
                      key={style}
                      variant={selectedStyle === style ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStyle(selectedStyle === style ? "" : style)}
                      className="text-xs"
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Mood Selection */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Mood</Label>
                <div className="grid grid-cols-3 gap-2">
                  {MOODS.map((mood) => (
                    <Button
                      key={mood}
                      variant={selectedMood === mood ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMood(selectedMood === mood ? "" : mood)}
                      className="text-xs"
                    >
                      {mood}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Instruments */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Instruments (Optional)
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {INSTRUMENTS.map((instrument) => (
                    <Button
                      key={instrument}
                      variant={selectedInstruments.includes(instrument) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleInstrument(instrument)}
                      className="text-xs"
                    >
                      {instrument}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Model Version */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Model Version</Label>
                <Select value={modelVersion} onValueChange={setModelVersion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_VERSIONS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {model.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Duration</Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(val) => setDuration(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Instrumental Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="instrumental" className="text-base font-semibold">
                    Instrumental Only
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Generate music without vocals
                  </p>
                </div>
                <Switch
                  id="instrumental"
                  checked={makeInstrumental}
                  onCheckedChange={setMakeInstrumental}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Music...
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5 mr-2" />
                    Generate Music ({CREDITS_COST} credits)
                  </>
                )}
              </Button>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}
            </Card>

            {/* Right Column - Preview */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <Label className="text-base font-semibold mb-4 block">Music Player</Label>
              
              {generatedMusic ? (
                <div className="space-y-4">
                  {/* Music Info */}
                  {generatedMusic.title && (
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">{generatedMusic.title}</h3>
                      {generatedMusic.duration && (
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(generatedMusic.duration / 60)}:
                          {(generatedMusic.duration % 60).toString().padStart(2, "0")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Waveform Placeholder */}
                  <div className="bg-muted/20 rounded-lg p-8 flex items-center justify-center">
                    <div className="flex items-end gap-1 h-24">
                      {[...Array(40)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full animate-pulse"
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
                      className="flex-1"
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
                    >
                      <a href={generatedMusic.audio_url} download="music.mp3">
                        <Download className="w-5 h-5 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground">
                  {isGenerating ? (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                      <p>Creating your music...</p>
                      <p className="text-sm mt-2">This may take 30-60 seconds</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p>Your generated music will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}