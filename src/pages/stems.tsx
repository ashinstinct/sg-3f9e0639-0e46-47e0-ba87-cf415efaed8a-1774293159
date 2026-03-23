import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Upload, Music, Download, Play, Pause, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const { toast } = useToast();

  const checkBackendHealth = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
    if (!backendUrl) {
      setBackendAvailable(false);
      return false;
    }

    try {
      const response = await fetch(`${backendUrl}/health`);
      const data = await response.json();
      setBackendAvailable(data.status === "healthy" && data.spleeter_available);
      return data.status === "healthy" && data.spleeter_available;
    } catch (err) {
      setBackendAvailable(false);
      return false;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await checkBackendHealth();
    }
  };

  const processSeparation = async () => {
    if (!file) return;

    const backendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
    if (!backendUrl) {
      setError("Backend URL not configured. Please set NEXT_PUBLIC_PYTHON_BACKEND_URL in your environment variables.");
      toast({
        title: "Configuration Error",
        description: "Python backend URL is not configured. Please deploy the backend and add the URL to .env.local",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError("");

    let progressInterval: NodeJS.Timeout;

    try {
      // Check backend health first
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        throw new Error("Backend service is not available. Please ensure the Python backend is running and accessible.");
      }

      // Simulate progress while processing
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 2000);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${backendUrl}/api/separate-stems`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Stem separation failed");
      }

      setProgress(95);

      // Backend returns a ZIP file containing all stems
      const zipBlob = await response.blob();
      
      // Extract individual stems from ZIP (we'll download the ZIP and let user extract)
      // For now, we'll create object URLs from the ZIP for download
      const zipUrl = URL.createObjectURL(zipBlob);

      // Update stems with mock URLs (in production, you'd extract from ZIP)
      // For demo, we'll just show the download ZIP option
      setProgress(100);
      
      toast({
        title: "Success!",
        description: "Stems separated successfully. Download the ZIP file to access all stems.",
      });

      // Download ZIP automatically
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `${file.name.split(".")[0]}_stems.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Mark stems as available (you could extract and create individual URLs here)
      setStems(stems.map(stem => ({ ...stem, url: "available" })));
      
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : "Separation failed";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error("Stem separation error:", err);
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

  const reprocessStems = async () => {
    await processSeparation();
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

            {backendAvailable === false && (
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Backend Not Connected</p>
                    <p className="text-xs text-muted-foreground">
                      Python backend is not running. Deploy the Flask app from <code className="bg-muted px-1 rounded">python-backend/</code> folder and add the URL to <code className="bg-muted px-1 rounded">.env.local</code>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

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

                {file && !processing && !stems.some(s => s.url) && (
                  <Button
                    onClick={processSeparation}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                    disabled={backendAvailable === false}
                  >
                    <Music className="w-5 h-5 mr-2" />
                    Separate Stems with AI
                  </Button>
                )}

                {processing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">AI is separating audio into stems...</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      This may take 30-90 seconds depending on file length
                    </p>
                  </div>
                )}

                {stems.some(s => s.url) && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Stems Separated ✓</h3>
                      <Button
                        onClick={reprocessStems}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download ZIP Again
                      </Button>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">✅ Stems Ready</p>
                      <p className="text-xs text-muted-foreground">
                        Your stems have been downloaded as a ZIP file. Extract the ZIP to access:
                      </p>
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4">
                        <li>• vocals.wav - Isolated vocals</li>
                        <li>• drums.wav - Drum track</li>
                        <li>• bass.wav - Bass line</li>
                        <li>• other.wav - Other instruments</li>
                      </ul>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">💡 Pro Tip</h4>
                      <p className="text-sm text-muted-foreground">
                        Import the separated stems into your DAW (FL Studio, Ableton, Logic Pro) for remixing, sampling, or karaoke creation.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">How it works</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Free version uses Spleeter (open-source AI model by Deezer)</li>
                    <li>• Pro version uses lalal.ai for higher quality separation</li>
                    <li>• Processing typically takes 30-90 seconds per track</li>
                    <li>• All 4 stems are downloaded as WAV files in a ZIP</li>
                    <li>• Works with any audio format (MP3, WAV, FLAC, etc.)</li>
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