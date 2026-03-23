import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mic, Square, Download, Trash2, Play, Pause, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [format, setFormat] = useState<"webm" | "mp4">("webm");
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const getBitrate = () => {
    switch (quality) {
      case "high": return 192000;
      case "medium": return 128000;
      case "low": return 64000;
      default: return 128000;
    }
  };

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mimeType = format === "webm" 
        ? "audio/webm;codecs=opus"
        : "audio/mp4";

      const options = {
        mimeType,
        audioBitsPerSecond: getBitrate(),
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak into your microphone",
      });
    } catch (err) {
      console.error(err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
      toast({
        title: "Recording paused",
      });
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      toast({
        title: "Recording resumed",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast({
        title: "Recording stopped",
        description: `Duration: ${formatTime(duration)}`,
      });
    }
  };

  const downloadRecording = () => {
    if (!recordedUrl) return;

    const link = document.createElement("a");
    link.href = recordedUrl;
    link.download = `recording_${Date.now()}.${format}`;
    link.click();

    toast({
      title: "Downloaded!",
      description: `Recording saved as ${format.toUpperCase()}`,
    });
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    setRecordedUrl("");
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    toast({
      title: "Recording deleted",
    });
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  return (
    <>
      <SEO
        title="Voice Recorder - Back2Life.Studio"
        description="Record high-quality audio directly in your browser. No installation required, 100% client-side processing."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Voice Recorder</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Record high-quality audio directly in your browser. No installation required, 100% client-side processing.
              </p>
            </div>

            <div className="grid gap-6">
              {/* Recorder Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Record Audio</CardTitle>
                  <CardDescription>
                    Use your microphone to record voice, music, or any audio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Settings */}
                  {!isRecording && !recordedBlob && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="format">Audio Format</Label>
                        <Select value={format} onValueChange={(v) => setFormat(v as "webm" | "mp4")}>
                          <SelectTrigger id="format">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="webm">WebM (Recommended)</SelectItem>
                            <SelectItem value="mp4">MP4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quality">Audio Quality</Label>
                        <Select value={quality} onValueChange={(v) => setQuality(v as "high" | "medium" | "low")}>
                          <SelectTrigger id="quality">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High (192 kbps)</SelectItem>
                            <SelectItem value="medium">Medium (128 kbps)</SelectItem>
                            <SelectItem value="low">Low (64 kbps)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Recording Controls */}
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    {!isRecording && !recordedBlob && (
                      <Button
                        onClick={startRecording}
                        size="lg"
                        className="w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
                      >
                        <Mic className="w-12 h-12" />
                      </Button>
                    )}

                    {isRecording && (
                      <>
                        <div className="relative w-32 h-32">
                          <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-50" />
                          <Button
                            onClick={stopRecording}
                            size="lg"
                            className="relative w-full h-full rounded-full bg-red-500 hover:bg-red-600"
                          >
                            <Square className="w-12 h-12" />
                          </Button>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <div className="text-4xl font-mono font-bold">
                            {formatTime(duration)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {isPaused ? "Paused" : "Recording..."}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          {!isPaused ? (
                            <Button onClick={pauseRecording} variant="outline" size="lg">
                              <Pause className="w-5 h-5 mr-2" />
                              Pause
                            </Button>
                          ) : (
                            <Button onClick={resumeRecording} size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500">
                              <Play className="w-5 h-5 mr-2" />
                              Resume
                            </Button>
                          )}
                          <Button onClick={stopRecording} variant="destructive" size="lg">
                            <Square className="w-5 h-5 mr-2" />
                            Stop
                          </Button>
                        </div>
                      </>
                    )}

                    {recordedBlob && (
                      <>
                        <div className="w-full max-w-md space-y-4">
                          <audio
                            ref={audioRef}
                            src={recordedUrl}
                            onEnded={() => setIsPlaying(false)}
                            className="w-full"
                            controls
                          />
                          
                          <div className="text-center text-sm text-muted-foreground">
                            Duration: {formatTime(duration)}
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={togglePlayback}
                              variant="outline"
                              size="lg"
                              className="flex-1"
                            >
                              {isPlaying ? (
                                <><Pause className="w-5 h-5 mr-2" />Pause</>
                              ) : (
                                <><Play className="w-5 h-5 mr-2" />Play</>
                              )}
                            </Button>
                            <Button
                              onClick={downloadRecording}
                              size="lg"
                              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
                            >
                              <Download className="w-5 h-5 mr-2" />
                              Download
                            </Button>
                            <Button
                              onClick={deleteRecording}
                              variant="outline"
                              size="lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>

                          <Button
                            onClick={() => {
                              deleteRecording();
                              setDuration(0);
                            }}
                            variant="ghost"
                            size="sm"
                            className="w-full"
                          >
                            Record Again
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Error</p>
                        <p className="text-sm text-destructive/80 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Features:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Pause and resume recording</li>
                      <li>Real-time duration tracking</li>
                      <li>Echo cancellation & noise suppression</li>
                      <li>Multiple quality settings</li>
                      <li>Instant playback preview</li>
                      <li>Download as WebM or MP4</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}