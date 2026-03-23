import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Upload, Music, Download, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface Stem {
  name: string;
  label: string;
  url: string | null;
  volume: number;
  muted: boolean;
  playing: boolean;
}

export default function StemSeparator() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stems, setStems] = useState<Stem[]>([
    { name: "vocals", label: "Vocals", url: null, volume: 100, muted: false, playing: false },
    { name: "drums", label: "Drums", url: null, volume: 100, muted: false, playing: false },
    { name: "bass", label: "Bass", url: null, volume: 100, muted: false, playing: false },
    { name: "other", label: "Other", url: null, volume: 100, muted: false, playing: false }
  ]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

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
      setStems(stems.map(stem => ({ ...stem, url: null })));
    }
  };

  const processSeparation = async () => {
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

      // TODO: Implement actual Spleeter API call
      // For now, show mock processing
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Mock result - in production, these would be actual separated audio files
      setError("Backend API not yet configured. This requires Spleeter (Python/TensorFlow) on the server. The UI is ready - just needs the processing endpoint.");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Separation failed");
    } finally {
      setProcessing(false);
    }
  };

  const toggleStemPlay = (stemName: string) => {
    const audio = audioRefs.current[stemName];
    if (!audio) return;

    const newStems = stems.map(stem => {
      if (stem.name === stemName) {
        if (stem.playing) {
          audio.pause();
        } else {
          audio.play();
        }
        return { ...stem, playing: !stem.playing };
      }
      return stem;
    });
    setStems(newStems);
  };

  const updateStemVolume = (stemName: string, volume: number) => {
    const audio = audioRefs.current[stemName];
    if (audio) {
      audio.volume = volume / 100;
    }
    setStems(stems.map(stem => 
      stem.name === stemName ? { ...stem, volume } : stem
    ));
  };

  const toggleStemMute = (stemName: string) => {
    const audio = audioRefs.current[stemName];
    if (audio) {
      audio.muted = !audio.muted;
    }
    setStems(stems.map(stem => 
      stem.name === stemName ? { ...stem, muted: !stem.muted } : stem
    ));
  };

  const downloadStem = (stem: Stem) => {
    if (!stem.url) return;
    const a = document.createElement("a");
    a.href = stem.url;
    a.download = `${file?.name.split(".")[0]}_${stem.name}.wav`;
    a.click();
  };

  const downloadAllStems = () => {
    stems.forEach(stem => {
      if (stem.url) {
        setTimeout(() => downloadStem(stem), 100);
      }
    });
  };

  return (
    <>
      <SEO 
        title="Stem Separator - Back2Life.Studio"
        description="Separate vocals, drums, bass, and instruments from any audio track using AI-powered stem separation"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                Stem Separator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Isolate vocals, drums, bass, and instruments from any audio track using AI-powered separation
              </p>
            </div>

            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle>Upload Audio</CardTitle>
                <CardDescription>
                  Select an audio or video file to separate into individual stems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-500/30 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-purple-500" />
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

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {file && !processing && stems.every(s => !s.url) && (
                  <Button
                    onClick={processSeparation}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                  >
                    <Music className="w-5 h-5 mr-2" />
                    Separate Stems
                  </Button>
                )}

                {processing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Separating audio...</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {stems.some(s => s.url) && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Separated Stems</h3>
                      <Button
                        onClick={downloadAllStems}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      {stems.map(stem => (
                        <Card key={stem.name} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Button
                                onClick={() => toggleStemPlay(stem.name)}
                                variant="outline"
                                size="icon"
                                disabled={!stem.url}
                              >
                                {stem.playing ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>

                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{stem.label}</span>
                                  <Button
                                    onClick={() => downloadStem(stem)}
                                    variant="ghost"
                                    size="sm"
                                    disabled={!stem.url}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="flex items-center gap-4">
                                  <Button
                                    onClick={() => toggleStemMute(stem.name)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={!stem.url}
                                  >
                                    {stem.muted ? (
                                      <VolumeX className="w-4 h-4" />
                                    ) : (
                                      <Volume2 className="w-4 h-4" />
                                    )}
                                  </Button>

                                  <div className="flex-1">
                                    <Slider
                                      value={[stem.volume]}
                                      onValueChange={([value]) => updateStemVolume(stem.name, value)}
                                      max={100}
                                      step={1}
                                      disabled={!stem.url}
                                    />
                                  </div>

                                  <span className="text-sm text-muted-foreground w-12 text-right">
                                    {stem.volume}%
                                  </span>
                                </div>
                              </div>

                              {stem.url && (
                                <audio
                                  ref={el => {
                                    if (el) audioRefs.current[stem.name] = el;
                                  }}
                                  src={stem.url}
                                  onEnded={() => {
                                    setStems(stems.map(s => 
                                      s.name === stem.name ? { ...s, playing: false } : s
                                    ));
                                  }}
                                />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">💡 Pro Tip</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the volume sliders to create custom mixes. Mute stems you don't need, or adjust volumes for the perfect balance.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">How it works</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Free version uses Spleeter (open-source AI model)</li>
                    <li>• Pro version uses lalal.ai for higher quality separation</li>
                    <li>• Processing typically takes 30-60 seconds per track</li>
                    <li>• Download individual stems or all at once as separate files</li>
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