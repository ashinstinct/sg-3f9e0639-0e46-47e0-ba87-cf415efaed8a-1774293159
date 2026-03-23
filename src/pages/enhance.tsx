import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Sparkles, Download, Play, Pause, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AudioEnhancer() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enhancedAudioUrl, setEnhancedAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [playingOriginal, setPlayingOriginal] = useState(false);
  const [playingEnhanced, setPlayingEnhanced] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const enhancedAudioRef = useRef<HTMLAudioElement>(null);
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
      setBackendAvailable(data.status === "healthy" && data.deepfilternet_available);
      return data.status === "healthy" && data.deepfilternet_available;
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
      setEnhancedAudioUrl(null);
      setProgress(0);
      await checkBackendHealth();
    }
  };

  const processEnhancement = async () => {
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

    try {
      // Check backend health first
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        throw new Error("Backend service is not available. Please ensure the Python backend is running and accessible.");
      }

      // Simulate progress while processing
      const progressInterval = setInterval(() => {
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

      const response = await fetch(`${backendUrl}/api/enhance-audio`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Audio enhancement failed");
      }

      setProgress(95);

      // Backend returns enhanced WAV file
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setEnhancedAudioUrl(audioUrl);

      setProgress(100);
      
      toast({
        title: "Success!",
        description: "Audio enhanced successfully. Compare the before/after to hear the difference.",
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Enhancement failed";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error("Audio enhancement error:", err);
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

            <Card className="border-emerald-500/20">
              <CardHeader>
                <CardTitle>Upload Audio</CardTitle>
                <CardDescription>
                  Select an audio or video file to enhance with AI noise removal
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
                  <Button
                    onClick={processEnhancement}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    size="lg"
                    disabled={backendAvailable === false}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Enhance Audio with AI
                  </Button>
                )}

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {processing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">AI is removing noise and enhancing audio...</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      This may take 30-60 seconds depending on file length
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
                        <li>• AI-powered noise removal (DeepFilterNet)</li>
                        <li>• Background noise and hum reduction</li>
                        <li>• Echo and reverb removal</li>
                        <li>• Voice clarity enhancement</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">How it works</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Free version uses DeepFilterNet AI for noise removal</li>
                    <li>• Pro version uses Adobe Podcast Enhancer for studio quality</li>
                    <li>• Removes background noise, hum, echo, and reverb</li>
                    <li>• Processing typically takes 30-60 seconds</li>
                    <li>• Perfect for podcasts, interviews, and voice recordings</li>
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