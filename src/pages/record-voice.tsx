import { useState, useRef, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Mic, Square, Play, Pause, Download, Trash2, Loader2 } from "lucide-react";

type RecordingState = "idle" | "recording" | "paused" | "stopped";

export default function VoiceRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        setRecordingState("stopped");
        
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        cancelAnimationFrame(animationFrameRef.current);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };

      mediaRecorder.start();
      setRecordingState("recording");
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;
      
      updateAudioLevel();
      startTimer();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current || recordingState !== "recording") return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(Math.min(100, (average / 255) * 100));

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const startTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current - pausedDurationRef.current;
      setDuration(Math.floor(elapsed / 1000));
    }, 100);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
      pauseStartRef.current = Date.now();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
      pausedDurationRef.current += Date.now() - pauseStartRef.current;
      updateAudioLevel();
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const downloadRecording = () => {
    if (!audioBlob) return;

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `recording-${Date.now()}.webm`;
    link.click();
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl("");
    setAudioBlob(null);
    setDuration(0);
    setRecordingState("idle");
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [audioUrl]);

  return (
    <>
      <SEO
        title="Voice Recorder - Back2Life.Studio"
        description="Record high-quality audio in your browser. No upload required - 100% client-side processing."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-3xl mx-auto">
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
                Record high-quality audio in your browser. No upload required - 100% client-side processing.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recording Controls</CardTitle>
                <CardDescription>
                  {recordingState === "idle" && "Click the microphone to start recording"}
                  {recordingState === "recording" && "Recording in progress..."}
                  {recordingState === "paused" && "Recording paused"}
                  {recordingState === "stopped" && "Recording complete"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timer Display */}
                <div className="text-center">
                  <div className="text-6xl font-bold font-mono text-primary mb-2">
                    {formatTime(duration)}
                  </div>
                  {recordingState === "recording" && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Recording
                    </div>
                  )}
                </div>

                {/* Audio Level Meter */}
                {(recordingState === "recording" || recordingState === "paused") && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Audio Level</span>
                      <span>{Math.round(audioLevel)}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Recording Controls */}
                <div className="flex flex-col gap-3">
                  {recordingState === "idle" && (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 h-14 text-lg"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  )}

                  {recordingState === "recording" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={pauseRecording}
                        size="lg"
                        variant="outline"
                        className="h-14"
                      >
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </Button>
                      <Button
                        onClick={stopRecording}
                        size="lg"
                        variant="destructive"
                        className="h-14"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </div>
                  )}

                  {recordingState === "paused" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={resumeRecording}
                        size="lg"
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 h-14"
                      >
                        <Mic className="w-5 h-5 mr-2" />
                        Resume
                      </Button>
                      <Button
                        onClick={stopRecording}
                        size="lg"
                        variant="destructive"
                        className="h-14"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </div>
                  )}

                  {recordingState === "stopped" && audioUrl && (
                    <>
                      {/* Audio Playback */}
                      <Card className="bg-surface-tint">
                        <CardContent className="pt-6">
                          <audio
                            ref={audioRef}
                            src={audioUrl}
                            controls
                            className="w-full"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                          />
                        </CardContent>
                      </Card>

                      {/* Download/Clear Controls */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={downloadRecording}
                          size="lg"
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 h-14"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download
                        </Button>
                        <Button
                          onClick={clearRecording}
                          size="lg"
                          variant="outline"
                          className="h-14"
                        >
                          <Trash2 className="w-5 h-5 mr-2" />
                          Clear
                        </Button>
                      </div>

                      <Button
                        onClick={() => {
                          clearRecording();
                          startRecording();
                        }}
                        variant="ghost"
                        className="w-full"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Record Another
                      </Button>
                    </>
                  )}
                </div>

                {/* Tips */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Recording Tips:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Speak clearly and maintain consistent distance from microphone</li>
                    <li>Use headphones to prevent audio feedback</li>
                    <li>Recording quality depends on your microphone hardware</li>
                    <li>Audio is saved as WebM format (widely supported)</li>
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