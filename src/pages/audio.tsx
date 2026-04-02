import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Mic, 
  Music, 
  Sparkles, 
  Zap, 
  Download, 
  Loader2, 
  Play, 
  Pause,
  Upload,
  Wand2,
  Volume2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { creditsService } from "@/services/creditsService";
import { supabase } from "@/integrations/supabase/client";

// Pre-configured Fish Audio voices
const FISH_VOICES = [
  { id: "default", name: "Default Voice", description: "Natural and clear" },
  { id: "professional", name: "Professional", description: "Business and corporate" },
  { id: "friendly", name: "Friendly", description: "Warm and approachable" },
  { id: "energetic", name: "Energetic", description: "Upbeat and dynamic" },
  { id: "calm", name: "Calm", description: "Soothing and relaxed" },
];

export default function ProAudioTools() {
  const [activeTab, setActiveTab] = useState("tts");
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const { toast } = useToast();

  // TTS States
  const [ttsText, setTtsText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("default");
  const [speed, setSpeed] = useState([1.0]);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState("");

  // Voice Clone States
  const [cloneText, setCloneText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [isCloning, setIsCloning] = useState(false);
  const [clonedAudioUrl, setClonedAudioUrl] = useState("");

  // Audio Player States
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [isPlayingClone, setIsPlayingClone] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement>(null);
  const cloneAudioRef = useRef<HTMLAudioElement>(null);

  const TTS_CREDITS = 3;
  const CLONE_CREDITS = 5;

  // Check user credits
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

  // Handle TTS Generation
  const handleGenerateTts = async () => {
    if (!ttsText.trim()) {
      toast({
        variant: "destructive",
        title: "Text required",
        description: "Please enter text to convert to speech",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use pro tools",
      });
      return;
    }

    const hasCredits = await creditsService.hasEnoughCredits(session.user.id, TTS_CREDITS);
    if (!hasCredits) {
      toast({
        variant: "destructive",
        title: "Insufficient credits",
        description: `You need ${TTS_CREDITS} credits for text-to-speech.`,
      });
      return;
    }

    setIsGeneratingTts(true);
    setTtsAudioUrl("");

    try {
      toast({
        title: "🎙️ Generating speech...",
        description: "This may take 10-20 seconds",
      });

      const response = await fetch("/api/fish/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ttsText,
          voice_id: selectedVoice,
          speed: speed[0],
          format: "mp3",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "TTS generation failed");
      }

      const success = await creditsService.deductCredits(
        session.user.id,
        TTS_CREDITS,
        "Fish Audio TTS Pro"
      );

      if (!success) {
        throw new Error("Failed to deduct credits");
      }

      setTtsAudioUrl(data.audio_url);

      const updatedCredits = await creditsService.getUserCredits(session.user.id);
      if (updatedCredits) {
        setUserCredits(updatedCredits.free_credits + updatedCredits.paid_credits);
      }

      toast({
        title: "✅ Speech generated!",
        description: `${TTS_CREDITS} credits used. ${userCredits ? userCredits - TTS_CREDITS : 0} remaining.`,
      });
    } catch (error) {
      console.error("TTS error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Handle Audio File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload an audio file",
      });
      return;
    }

    setAudioFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAudioPreview(previewUrl);
  };

  // Handle Voice Clone
  const handleCloneVoice = async () => {
    if (!audioFile || !cloneText.trim()) {
      toast({
        variant: "destructive",
        title: "Missing inputs",
        description: "Please upload audio and enter text",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use pro tools",
      });
      return;
    }

    const hasCredits = await creditsService.hasEnoughCredits(session.user.id, CLONE_CREDITS);
    if (!hasCredits) {
      toast({
        variant: "destructive",
        title: "Insufficient credits",
        description: `You need ${CLONE_CREDITS} credits for voice cloning.`,
      });
      return;
    }

    setIsCloning(true);
    setClonedAudioUrl("");

    try {
      toast({
        title: "🎭 Cloning voice...",
        description: "This may take 30-60 seconds",
      });

      // Convert audio file to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(audioFile);
      });

      const response = await fetch("/api/fish/voice-clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_file: base64Audio,
          text: cloneText,
          title: `Voice Clone ${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Voice cloning failed");
      }

      const success = await creditsService.deductCredits(
        session.user.id,
        CLONE_CREDITS,
        "Pro Voice Cloning"
      );

      if (!success) {
        throw new Error("Failed to deduct credits");
      }

      setClonedAudioUrl(data.audio_url);

      const updatedCredits = await creditsService.getUserCredits(session.user.id);
      if (updatedCredits) {
        setUserCredits(updatedCredits.free_credits + updatedCredits.paid_credits);
      }

      toast({
        title: "✅ Voice cloned!",
        description: `${CLONE_CREDITS} credits used. ${userCredits ? userCredits - CLONE_CREDITS : 0} remaining.`,
      });
    } catch (error) {
      console.error("Voice cloning error:", error);
      toast({
        variant: "destructive",
        title: "Cloning failed",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsCloning(false);
    }
  };

  // Audio Player Controls
  const toggleTtsPlayback = () => {
    if (!ttsAudioRef.current) return;
    if (isPlayingTts) {
      ttsAudioRef.current.pause();
    } else {
      ttsAudioRef.current.play();
    }
    setIsPlayingTts(!isPlayingTts);
  };

  const toggleClonePlayback = () => {
    if (!cloneAudioRef.current) return;
    if (isPlayingClone) {
      cloneAudioRef.current.pause();
    } else {
      cloneAudioRef.current.play();
    }
    setIsPlayingClone(!isPlayingClone);
  };

  const downloadAudio = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <>
      <SEO
        title="Pro Audio Tools - Back2Life.Studio"
        description="Professional text-to-speech and voice cloning powered by Fish Audio"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">Professional Audio AI</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Fish Audio Pro
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Natural text-to-speech and advanced voice cloning
            </p>

            {userCredits !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">{userCredits} credits available</span>
              </div>
            )}
          </div>

          {/* Tools Tabs */}
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="tts" className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Text-to-Speech
                </TabsTrigger>
                <TabsTrigger value="clone" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Voice Cloning
                </TabsTrigger>
              </TabsList>

              {/* Text-to-Speech Tab */}
              <TabsContent value="tts">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Input Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Text-to-Speech Settings</CardTitle>
                      <CardDescription>
                        Convert text to natural-sounding speech
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Text Input */}
                      <div className="space-y-2">
                        <Label>Text to Convert</Label>
                        <Textarea
                          placeholder="Enter the text you want to convert to speech..."
                          value={ttsText}
                          onChange={(e) => setTtsText(e.target.value)}
                          className="min-h-[150px] resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          {ttsText.length} characters • Est. {Math.ceil(ttsText.length / 150)} seconds
                        </p>
                      </div>

                      {/* Voice Selection */}
                      <div className="space-y-2">
                        <Label>Voice</Label>
                        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FISH_VOICES.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>
                                <div>
                                  <div className="font-medium">{voice.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {voice.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Speed Control */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Speed</Label>
                          <span className="text-sm text-muted-foreground">{speed[0]}x</span>
                        </div>
                        <Slider
                          value={speed}
                          onValueChange={setSpeed}
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      {/* Generate Button */}
                      <Button
                        onClick={handleGenerateTts}
                        disabled={isGeneratingTts || !ttsText.trim()}
                        size="lg"
                        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 h-14 text-lg"
                      >
                        {isGeneratingTts ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5 mr-2" />
                            Generate Speech ({TTS_CREDITS} credits)
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Preview Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Speech</CardTitle>
                      <CardDescription>
                        Preview and download your audio
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!ttsAudioUrl && !isGeneratingTts && (
                        <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <Volume2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No audio generated yet</p>
                            <p className="text-xs mt-1">Enter text and click generate</p>
                          </div>
                        </div>
                      )}

                      {isGeneratingTts && (
                        <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
                            <p className="text-sm font-medium">Generating speech...</p>
                            <p className="text-xs text-muted-foreground mt-1">This may take 10-20 seconds</p>
                          </div>
                        </div>
                      )}

                      {ttsAudioUrl && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-8 border border-indigo-500/20">
                            <div className="flex flex-col items-center justify-center gap-4">
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <Volume2 className="w-10 h-10 text-white" />
                              </div>
                              <audio
                                ref={ttsAudioRef}
                                src={ttsAudioUrl}
                                onEnded={() => setIsPlayingTts(false)}
                                className="hidden"
                              />
                              <Button
                                onClick={toggleTtsPlayback}
                                size="lg"
                                variant="outline"
                                className="w-32"
                              >
                                {isPlayingTts ? (
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
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => downloadAudio(ttsAudioUrl, `tts-${Date.now()}.mp3`)}
                            size="lg"
                            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download Audio
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Voice Cloning Tab */}
              <TabsContent value="clone">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Input Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Voice Cloning Settings</CardTitle>
                      <CardDescription>
                        Clone any voice from an audio sample
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Audio Upload */}
                      <div className="space-y-2">
                        <Label>Upload Voice Sample</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="audio-upload"
                          />
                          <label htmlFor="audio-upload" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              {audioFile ? audioFile.name : "Click to upload audio"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              MP3, WAV, M4A, or OGG • 5-30 seconds recommended
                            </p>
                          </label>
                        </div>
                        {audioPreview && (
                          <audio controls src={audioPreview} className="w-full mt-2" />
                        )}
                      </div>

                      {/* Text Input */}
                      <div className="space-y-2">
                        <Label>Text to Speak</Label>
                        <Textarea
                          placeholder="Enter what you want the cloned voice to say..."
                          value={cloneText}
                          onChange={(e) => setCloneText(e.target.value)}
                          className="min-h-[120px] resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          {cloneText.length} characters
                        </p>
                      </div>

                      {/* Clone Button */}
                      <Button
                        onClick={handleCloneVoice}
                        disabled={isCloning || !audioFile || !cloneText.trim()}
                        size="lg"
                        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 h-14 text-lg"
                      >
                        {isCloning ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Cloning...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5 mr-2" />
                            Clone Voice ({CLONE_CREDITS} credits)
                          </>
                        )}
                      </Button>

                      {/* Tips */}
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium">Tips for Best Results:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Use clear, high-quality audio</li>
                          <li>5-30 seconds of clean speech</li>
                          <li>Minimal background noise</li>
                          <li>Single speaker only</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preview Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cloned Voice Output</CardTitle>
                      <CardDescription>
                        Your cloned voice speaking new text
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!clonedAudioUrl && !isCloning && (
                        <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <Mic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No cloned voice yet</p>
                            <p className="text-xs mt-1">Upload audio and enter text</p>
                          </div>
                        </div>
                      )}

                      {isCloning && (
                        <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
                            <p className="text-sm font-medium">Cloning voice...</p>
                            <p className="text-xs text-muted-foreground mt-1">This may take 30-60 seconds</p>
                          </div>
                        </div>
                      )}

                      {clonedAudioUrl && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-8 border border-indigo-500/20">
                            <div className="flex flex-col items-center justify-center gap-4">
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <Mic className="w-10 h-10 text-white" />
                              </div>
                              <audio
                                ref={cloneAudioRef}
                                src={clonedAudioUrl}
                                onEnded={() => setIsPlayingClone(false)}
                                className="hidden"
                              />
                              <Button
                                onClick={toggleClonePlayback}
                                size="lg"
                                variant="outline"
                                className="w-32"
                              >
                                {isPlayingClone ? (
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
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => downloadAudio(clonedAudioUrl, `voice-clone-${Date.now()}.mp3`)}
                            size="lg"
                            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download Audio
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Other Pro Tools */}
          <div className="max-w-5xl mx-auto mt-12 space-y-6">
            <h2 className="font-heading font-bold text-2xl text-center mb-8">More Pro Audio Tools</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* lalal.ai Pro Stem Separator - Simple Preview Card */}
              <div className="group relative bg-gradient-to-br from-background to-muted/30 rounded-2xl p-6 border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Music className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Pro
                      </span>
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-xl mb-2">
                    Pro Stem Separator by lalal.ai
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    World's #1 AI-powered stem extraction technology. Split any song into 10 individual stems with surgical precision using the No.01 Sound AI algorithm.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 rounded-md text-xs bg-primary/10 text-primary font-medium">
                      10-Stem Separation
                    </span>
                    <span className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                      Lossless Quality
                    </span>
                    <span className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                      2-3 min processing
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-sm">8 credits per track</span>
                    </div>
                    <Link href="/stem-separator">
                      <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90">
                        Try Now
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Adobe Podcast Enhancer */}
              <Card className="bg-gradient-to-br from-background to-muted/30 border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Coming Soon
                    </span>
                  </div>
                  <CardTitle>Adobe Podcast Enhancer</CardTitle>
                  <CardDescription>
                    Studio-grade audio enhancement and noise removal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-sm">4 credits per track</span>
                    </div>
                    <Button disabled variant="outline" size="sm">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Free Tools Link */}
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-1">Looking for free audio tools?</h3>
                    <p className="text-sm text-muted-foreground">Try our collection of free audio processing tools</p>
                  </div>
                  <Link href="/free-tools#audio">
                    <Button variant="outline">
                      View Free Tools
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}