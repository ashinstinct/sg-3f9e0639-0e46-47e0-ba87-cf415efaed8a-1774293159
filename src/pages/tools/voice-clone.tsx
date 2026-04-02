import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Upload, Loader2, Play, Pause, Download, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { creditsService } from "@/services/creditsService";
import { supabase } from "@/integrations/supabase/client";

const VOICES = {
  male: [
    { id: "male-1", name: "David (Professional)", language: "en" },
    { id: "male-2", name: "Marcus (Deep)", language: "en" },
    { id: "male-3", name: "Oliver (British)", language: "en" },
  ],
  female: [
    { id: "female-1", name: "Emma (Professional)", language: "en" },
    { id: "female-2", name: "Sarah (Warm)", language: "en" },
    { id: "female-3", name: "Isabella (Energetic)", language: "en" },
  ],
};

export default function VoiceCloner() {
  const [mode, setMode] = useState<"tts" | "clone">("tts");
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("female-1");
  const [speed, setSpeed] = useState(1.0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const TTS_CREDITS = 3;
  const CLONE_CREDITS = 5;

  useEffect(() => {
    const checkCredits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const credits = await creditsService.getUserCredits(session.user.id);
        if (credits) {
          setUserCredits(credits.free_credits + credits.paid_credits);
        }
      }
    };
    checkCredits();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "Text required",
        description: "Please enter text to convert to speech",
      });
      return;
    }

    if (mode === "clone" && !audioFile) {
      toast({
        variant: "destructive",
        title: "Audio file required",
        description: "Please upload a voice sample to clone",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use this tool",
      });
      return;
    }

    const credits = mode === "tts" ? TTS_CREDITS : CLONE_CREDITS;
    const hasCredits = await creditsService.hasEnoughCredits(session.user.id, credits);
    if (!hasCredits) {
      toast({
        variant: "destructive",
        title: "Insufficient credits",
        description: `You need ${credits} credits. Please purchase more.`,
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedAudio("");

    try {
      if (mode === "tts") {
        const response = await fetch("/api/fish/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice: selectedVoice,
            speed,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setGeneratedAudio(data.audio_url);
      } else {
        const formData = new FormData();
        formData.append("audio", audioFile!);
        formData.append("text", text);

        const response = await fetch("/api/fish/voice-clone", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setGeneratedAudio(data.audio_url);
      }

      const success = await creditsService.deductCredits(
        session.user.id,
        credits,
        mode === "tts" ? "Fish Audio TTS" : "Fish Audio Voice Clone"
      );
      if (!success) throw new Error("Failed to deduct credits");

      const updatedCredits = await creditsService.getUserCredits(session.user.id);
      if (updatedCredits) {
        setUserCredits(updatedCredits.free_credits + updatedCredits.paid_credits);
      }

      toast({
        title: "✅ Audio generated!",
        description: `${credits} credits used. ${userCredits ? userCredits - credits : 0} remaining.`,
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadAudio = () => {
    if (!generatedAudio) return;
    const link = document.createElement("a");
    link.href = generatedAudio;
    link.download = `fish-audio-${Date.now()}.mp3`;
    link.click();
  };

  return (
    <>
      <SEO title="Voice Cloner + Text-to-Speech" description="Clone voices or use pre-built voices with Fish Audio" />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/audio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Audio Tools
            </Link>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-4">
                <Mic className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Fish Audio</span>
              </div>
              
              <h1 className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Voice Cloner + Text-to-Speech
              </h1>
              
              <p className="text-muted-foreground mb-4">
                More natural than ElevenLabs - Clone voices or use pre-built male/female voices
              </p>

              {userCredits !== null && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">{userCredits} credits</span>
                </div>
              )}
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as "tts" | "clone")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="tts">Pre-built Voices ({TTS_CREDITS} credits)</TabsTrigger>
                <TabsTrigger value="clone">Clone Voice ({CLONE_CREDITS} credits)</TabsTrigger>
              </TabsList>

              <TabsContent value="tts">
                <Card>
                  <CardHeader>
                    <CardTitle>Text-to-Speech</CardTitle>
                    <CardDescription>Use professional male or female voices</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Voice</Label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Male Voices</div>
                          {VOICES.male.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>{voice.name}</SelectItem>
                          ))}
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Female Voices</div>
                          {VOICES.female.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>{voice.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Textarea
                        placeholder="Enter the text you want to convert to speech..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground">{text.length} characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Speed: {speed}x</Label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={speed}
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full">
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>Generate Speech ({TTS_CREDITS} credits)</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clone">
                <Card>
                  <CardHeader>
                    <CardTitle>Voice Cloning</CardTitle>
                    <CardDescription>Upload a voice sample and generate speech</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Voice Sample</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="audio-upload"
                        />
                        <label htmlFor="audio-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm font-medium">Upload Audio Sample</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {audioFile ? audioFile.name : "5-30 seconds recommended"}
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Text to Speak</Label>
                      <Textarea
                        placeholder="Enter text to speak in the cloned voice..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full">
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Cloning...
                        </>
                      ) : (
                        <>Clone & Generate ({CLONE_CREDITS} credits)</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {generatedAudio && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Generated Audio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <audio ref={audioRef} src={generatedAudio} onEnded={() => setIsPlaying(false)} />
                  <div className="flex gap-4">
                    <Button onClick={togglePlayPause} variant="outline" className="flex-1">
                      {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button onClick={downloadAudio} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
