import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Sparkles, Download, Play, Pause, Volume2 } from "lucide-react";

export default function AudioEnhancer() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enhancedAudioUrl, setEnhancedAudioUrl] = useState<string | null>(null);
  const [denoiseLevel, setDenoiseLevel] = useState(80);
  const [normalizeLevel, setNormalizeLevel] = useState(-16);
  const [error, setError] = useState("");
  const [playingOriginal, setPlayingOriginal] = useState(false);
  const [playingEnhanced, setPlayingEnhanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const enhancedAudioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ["audio/", "video/"];
      if (!validTypes.some(type => selectedFile.type.startsWith(type))) {
        setError("Please select an audio or video file");
        return;
      }
      setFile(selectedFile);
      setError("");
      setEnhancedAudioUrl(null);
      setProgress(0);
    }
  };

  const processEnhancement = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError("");

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);

      // TODO: Implement actual DeepFilterNet + FFmpeg API call
      // For now, show mock processing
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Mock result - in production, this would be the enhanced audio file
      setError("Backend API not yet configured. Free version requires DeepFilterNet (Python/PyTorch) + FFmpeg. Pro version will use Adobe Podcast Enhancer API. The UI is ready - just needs the processing endpoint.");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setProcessing(false);
    }
  };

  const toggleOriginalPlay = () => {
    const audio = originalAudioRef.current;
    if (!audio) return;
    
    if (playingOriginal) {
      audio.pause();
    } else {
      audio.play();
      if (enhancedAudioRef.current) {
        enhancedAudioRef.current.pause();
        setPlayingEnhanced(false);
      }
    }
    setPlayingOriginal(!playingOriginal);
  };

  const toggleEnhancedPlay = () => {
    const audio = enhancedAudioRef.current;
    if (!audio) return;
    
    if (playingEnhanced) {
      audio.pause();
    } else {
      audio.play();
      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
        setPlayingOriginal(false);
      }
    }
    setPlayingEnhanced(!playingEnhanced);
  };

  const downloadEnhanced = () => {
    if (!enhancedAudioUrl) return;
    const a = document.createElement("a");
    a.href = enhancedAudioUrl;
    a.download = `${file?.name.split(".")[0]}_enhanced.wav`;
    a.click();
  };

  return (
    <>
      <SEO 
        title="Audio Enhancer - Back2Life.Studio"
        description="Remove noise and enhance audio quality with AI-powered audio enhancement tools"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-500/5">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Audio Enhancer
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Remove background noise and enhance audio quality using AI-powered processing
              </p>
            </div>

            <Card className="border-emerald-500/20">
              <CardHeader>
                <CardTitle>Upload Audio</CardTitle>
                <CardDescription>
                  Select an audio or video file to enhance with AI noise removal and normalization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-500/30 rounded-lg p-12 text-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                  <p className="text-lg font-medium mb-2">
                    {file ? file.name : "Click to upload audio or video file"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports MP3, WAV, M4A, OGG, FLAC, MP4, MOV, AVI
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {file && !processing && !enhancedAudioUrl && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">Denoise Strength</label>
                          <span className="text-sm text-muted-foreground">{denoiseLevel}%</span>
                        </div>
                        <Slider
                          value={[denoiseLevel]}
                          onValueChange={([value]) => setDenoiseLevel(value)}
                          max={100}
                          step={5}
                        />
                        <p className="text-xs text-muted-foreground">
                          Higher values remove more noise but may affect voice quality
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">Target Loudness (LUFS)</label>
                          <span className="text-sm text-muted-foreground">{normalizeLevel} LUFS</span>
                        </div>
                        <Slider
                          value={[normalizeLevel]}
                          onValueChange={([value]) => setNormalizeLevel(value)}
                          min={-24}
                          max={-12}
                          step={1}
                        />
                        <p className="text-xs text-muted-foreground">
                          Standard: -16 LUFS (podcasts/videos), -23 LUFS (broadcast)
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={processEnhancement}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      size="lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Enhance Audio
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {processing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Enhancing audio...</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Removing noise and normalizing loudness...
                    </p>
                  </div>
                )}

                {enhancedAudioUrl && file && (
                  <div className="space-y-6">
                    <Tabs defaultValue="enhanced" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="original">Original</TabsTrigger>
                        <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="original" className="space-y-4">
                        <Card className="bg-muted/30">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">Original Audio</h3>
                              <Button
                                onClick={toggleOriginalPlay}
                                variant="outline"
                                size="sm"
                              >
                                {playingOriginal ? (
                                  <Pause className="w-4 h-4 mr-2" />
                                ) : (
                                  <Play className="w-4 h-4 mr-2" />
                                )}
                                {playingOriginal ? "Pause" : "Play"}
                              </Button>
                            </div>
                            <audio
                              ref={originalAudioRef}
                              src={URL.createObjectURL(file)}
                              onEnded={() => setPlayingOriginal(false)}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="enhanced" className="space-y-4">
                        <Card className="bg-emerald-500/5 border-emerald-500/20">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-medium">Enhanced Audio</h3>
                              </div>
                              <Button
                                onClick={toggleEnhancedPlay}
                                variant="outline"
                                size="sm"
                              >
                                {playingEnhanced ? (
                                  <Pause className="w-4 h-4 mr-2" />
                                ) : (
                                  <Play className="w-4 h-4 mr-2" />
                                )}
                                {playingEnhanced ? "Pause" : "Play"}
                              </Button>
                            </div>
                            <audio
                              ref={enhancedAudioRef}
                              src={enhancedAudioUrl}
                              onEnded={() => setPlayingEnhanced(false)}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    <Button
                      onClick={downloadEnhanced}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Enhanced Audio
                    </Button>

                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">✨ Enhancements Applied</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• AI noise removal at {denoiseLevel}% strength</li>
                        <li>• Loudness normalized to {normalizeLevel} LUFS</li>
                        <li>• High-pass filter applied to remove rumble</li>
                        <li>• Dynamic range compression for consistency</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">How it works</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Free version uses DeepFilterNet AI for noise removal</li>
                    <li>• Pro version uses Adobe Podcast Enhancer for studio quality</li>
                    <li>• Automatic loudness normalization (EBU R128 standard)</li>
                    <li>• Processing typically takes 30-60 seconds</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}