import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Download, Trash2, Play, Pause, AlertCircle, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AudioFormat = "mp3-192" | "mp3-256" | "mp3-320" | "wav" | "flac" | "aiff";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [format, setFormat] = useState<AudioFormat>("mp3-192");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState(true);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const transcriptionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;

  const getFormatConfig = (fmt: AudioFormat) => {
    const configs = {
      "mp3-192": { mimeType: "audio/webm;codecs=opus", bitrate: 192000, ext: "mp3", label: "MP3 192 kbps" },
      "mp3-256": { mimeType: "audio/webm;codecs=opus", bitrate: 256000, ext: "mp3", label: "MP3 256 kbps" },
      "mp3-320": { mimeType: "audio/webm;codecs=opus", bitrate: 320000, ext: "mp3", label: "MP3 320 kbps" },
      "wav": { mimeType: "audio/wav", bitrate: 1411000, ext: "wav", label: "WAV (Lossless)" },
      "flac": { mimeType: "audio/webm;codecs=opus", bitrate: 1411000, ext: "flac", label: "FLAC (Lossless)" },
      "aiff": { mimeType: "audio/webm;codecs=opus", bitrate: 1411000, ext: "aiff", label: "AIFF (Lossless)" },
    };
    return configs[fmt];
  };

  const setupWaveform = (stream: MediaStream) => {
    if (!canvasRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 2048;
    source.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    drawWaveform();
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "hsl(var(--background))";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const transcribeChunk = async (audioBlob: Blob) => {
    if (!HF_TOKEN) {
      setError("HuggingFace API token not configured");
      return;
    }

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
          },
          body: audioBlob,
        }
      );

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const result = await response.json();
      if (result.text) {
        setTranscript(prev => prev + " " + result.text.trim());
      }
    } catch (err) {
      console.error("Transcription error:", err);
    }
  };

  const startRecording = async () => {
    try {
      setError("");
      setTranscript("");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      streamRef.current = stream;
      setupWaveform(stream);

      const config = getFormatConfig(format);
      const options = {
        mimeType: config.mimeType,
        audioBitsPerSecond: config.bitrate,
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          
          // Progressive transcription every 10 seconds
          if (liveTranscription && chunksRef.current.length % 10 === 0) {
            const chunk = new Blob([e.data], { type: config.mimeType });
            transcribeChunk(chunk);
          }
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: config.mimeType });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        // Final transcription of complete recording
        if (liveTranscription) {
          transcribeChunk(blob);
        }
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

  const transcribeRecording = async () => {
    if (!recordedBlob || !HF_TOKEN) {
      setError("No recording to transcribe or API token missing");
      return;
    }

    setIsTranscribing(true);
    setError("");

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
          },
          body: recordedBlob,
        }
      );

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const result = await response.json();
      setTranscript(result.text || "No transcription available");
      
      toast({
        title: "Transcription complete!",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard!",
    });
  };

  const downloadRecording = () => {
    if (!recordedUrl) return;

    const config = getFormatConfig(format);
    const link = document.createElement("a");
    link.href = recordedUrl;
    link.download = `recording_${Date.now()}.${config.ext}`;
    link.click();

    toast({
      title: "Downloaded!",
      description: `Recording saved as ${config.label}`,
    });
  };

  const deleteRecording = () => {
    setRecordedBlob(null);
    setRecordedUrl("");
    setDuration(0);
    setTranscript("");
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
      if (transcriptionTimerRef.current) clearInterval(transcriptionTimerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [recordedUrl]);

  return (
    <>
      <SEO
        title="Voice Recorder - Back2Life.Studio"
        description="Record high-quality audio with live waveform visualization and AI transcription. Supports MP3, WAV, FLAC, and AIFF formats."
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
                Record high-quality audio with live waveform visualization and AI transcription. Supports MP3, WAV, FLAC, and AIFF formats.
              </p>
            </div>

            <div className="grid gap-6">
              {/* Recorder Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Record Audio</CardTitle>
                  <CardDescription>
                    Professional audio recording with real-time visualization and transcription
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Settings */}
                  {!isRecording && !recordedBlob && (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="format">Audio Format</Label>
                          <Select value={format} onValueChange={(v) => setFormat(v as AudioFormat)}>
                            <SelectTrigger id="format">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mp3-192">MP3 192 kbps (Default)</SelectItem>
                              <SelectItem value="mp3-256">MP3 256 kbps</SelectItem>
                              <SelectItem value="mp3-320">MP3 320 kbps</SelectItem>
                              <SelectItem value="wav">WAV (Lossless)</SelectItem>
                              <SelectItem value="flac">FLAC (Lossless)</SelectItem>
                              <SelectItem value="aiff">AIFF (Lossless)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="live-transcription">Live Transcription</Label>
                          <div className="flex items-center space-x-2 h-10">
                            <Switch
                              id="live-transcription"
                              checked={liveTranscription}
                              onCheckedChange={setLiveTranscription}
                            />
                            <Label htmlFor="live-transcription" className="font-normal cursor-pointer">
                              {liveTranscription ? "Enabled (AI powered)" : "Disabled"}
                            </Label>
                          </div>
                        </div>
                      </div>

                      {!HF_TOKEN && liveTranscription && (
                        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                              Transcription Unavailable
                            </p>
                            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                              Add NEXT_PUBLIC_HF_TOKEN to enable AI transcription
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Waveform Visualization */}
                  {isRecording && (
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={120}
                        className="w-full h-[120px] bg-muted/30 rounded-lg border border-border"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                        LIVE
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

                        {/* Live Transcript Preview */}
                        {liveTranscription && transcript && (
                          <div className="w-full max-w-2xl">
                            <Label className="text-sm text-muted-foreground mb-2 block">
                              Live Transcript:
                            </Label>
                            <div className="bg-muted/50 rounded-lg p-4 max-h-32 overflow-y-auto">
                              <p className="text-sm">{transcript}</p>
                            </div>
                          </div>
                        )}
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
                            Duration: {formatTime(duration)} • Format: {getFormatConfig(format).label}
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

                          {/* Transcribe Button */}
                          {!liveTranscription && HF_TOKEN && !transcript && (
                            <Button
                              onClick={transcribeRecording}
                              disabled={isTranscribing}
                              variant="outline"
                              size="lg"
                              className="w-full"
                            >
                              {isTranscribing ? "Transcribing..." : "Transcribe Recording"}
                            </Button>
                          )}

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

                  {/* Transcript Output */}
                  {transcript && recordedBlob && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Transcript</Label>
                        <Button
                          onClick={copyTranscript}
                          variant="outline"
                          size="sm"
                        >
                          {copied ? (
                            <><Check className="w-4 h-4 mr-2" />Copied!</>
                          ) : (
                            <><Copy className="w-4 h-4 mr-2" />Copy</>
                          )}
                        </Button>
                      </div>
                      <Textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows={6}
                        className="resize-none font-mono text-sm"
                        placeholder="Transcript will appear here..."
                      />
                    </div>
                  )}

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
                      <li>Real-time waveform visualization</li>
                      <li>Live AI transcription (optional)</li>
                      <li>Pause and resume recording</li>
                      <li>Multiple formats: MP3 (192/256/320 kbps), WAV, FLAC, AIFF</li>
                      <li>Echo cancellation & noise suppression</li>
                      <li>Instant playback preview</li>
                      <li>Copy transcript to clipboard</li>
                      <li>100% browser-based processing</li>
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