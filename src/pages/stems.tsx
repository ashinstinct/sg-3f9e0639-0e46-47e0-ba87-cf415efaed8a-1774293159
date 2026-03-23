import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileAudio, Download, Loader2, Music, Mic2, Drum, Guitar, Piano, CheckCircle2, AlertCircle } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:5000";

export default function StemSeparator() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isSeparating, setIsSeparating] = useState(false);
  const [stemsUrl, setStemsUrl] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setStemsUrl("");
      setError("");
      setSuccess("");
      setProgress(0);
    } else {
      setError("Please select a valid audio file");
    }
  };

  const handleAudioLoad = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleSeparate = async () => {
    if (!audioFile) {
      setError("Please select an audio file first");
      return;
    }

    setIsSeparating(true);
    setError("");
    setSuccess("");
    setProgress(10);
    setStemsUrl("");

    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      setProgress(30);

      const response = await fetch(`${BACKEND_URL}/api/separate-stems`, {
        method: "POST",
        body: formData,
      });

      setProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Stem separation failed");
      }

      setProgress(80);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setStemsUrl(url);
      setProgress(100);
      setSuccess("Successfully separated into 4 stems (vocals, drums, bass, other)!");
    } catch (err) {
      console.error("Separation error:", err);
      setError(err instanceof Error ? err.message : "Failed to separate stems. Please try again.");
      setProgress(0);
    } finally {
      setIsSeparating(false);
    }
  };

  const handleDownload = () => {
    if (!stemsUrl || !audioFile) return;

    const a = document.createElement("a");
    a.href = stemsUrl;
    a.download = `${audioFile.name.split(".")[0]}_stems.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setAudioFile(null);
    setAudioUrl("");
    setStemsUrl("");
    setProgress(0);
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <SEO
        title="Stem Separator - Back2Life.Studio"
        description="Separate songs into vocals, drums, bass, and other instruments using AI-powered Spleeter technology."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Stem Separator</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Separate songs into vocals, drums, bass, and other instruments using AI.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left Column - Upload & Process */}
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Audio</CardTitle>
                    <CardDescription>
                      Choose a song to separate into stems
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP3, WAV, M4A, FLAC, OGG (Max 100MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {audioFile && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <FileAudio className="w-8 h-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{audioFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(audioFile.size)} • {formatTime(audioDuration)}
                          </p>
                        </div>
                      </div>
                    )}

                    {audioUrl && (
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        controls
                        onLoadedMetadata={handleAudioLoad}
                        className="w-full"
                      />
                    )}

                    {isSeparating && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Separating stems with AI...</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center">
                          This may take 30-60 seconds depending on song length
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSeparate}
                        disabled={isSeparating || !audioFile}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90"
                        size="lg"
                      >
                        {isSeparating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Separating...
                          </>
                        ) : (
                          <>
                            <Music className="w-4 h-4 mr-2" />
                            Separate Stems
                          </>
                        )}
                      </Button>

                      {audioFile && !isSeparating && (
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          size="lg"
                        >
                          Reset
                        </Button>
                      )}
                    </div>

                    {stemsUrl && (
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="w-full border-green-500/50 bg-green-500/10 hover:bg-green-500/20 text-green-600"
                        size="lg"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All Stems (ZIP)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Info */}
              <div className="lg:col-span-2">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Output Stems</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Mic2 className="w-5 h-5 text-pink-500" />
                        <div>
                          <p className="text-sm font-medium">Vocals</p>
                          <p className="text-xs text-muted-foreground">Singing & speaking</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Drum className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium">Drums</p>
                          <p className="text-xs text-muted-foreground">Percussion & beats</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Guitar className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Bass</p>
                          <p className="text-xs text-muted-foreground">Low-frequency instruments</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Piano className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium">Other</p>
                          <p className="text-xs text-muted-foreground">Everything else</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <p className="text-sm font-medium">Features:</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>AI-powered separation</li>
                        <li>4-stem output (vocals, drums, bass, other)</li>
                        <li>High-quality WAV files</li>
                        <li>Powered by Spleeter</li>
                        <li>Process songs up to 10 minutes</li>
                        <li>Download as ZIP package</li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        <strong>Powered by:</strong> Deezer's Spleeter (TensorFlow)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}