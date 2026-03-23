import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Mic, Square, Download, Play, Pause, Video } from "lucide-react";

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [includeMicrophone, setIncludeMicrophone] = useState(true);
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true);
  const [resolution, setResolution] = useState("1080");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      setError("");
      chunksRef.current = [];

      // Request screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: parseInt(resolution) === 1080 ? 1920 : parseInt(resolution) === 720 ? 1280 : 1920 },
          height: { ideal: parseInt(resolution) === 1080 ? 1080 : parseInt(resolution) === 720 ? 720 : 1080 },
          frameRate: { ideal: 30 }
        },
        audio: includeSystemAudio
      });

      let audioStream: MediaStream | null = null;
      
      // Request microphone if enabled
      if (includeMicrophone) {
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
          console.warn("Microphone access denied:", err);
        }
      }

      // Combine streams
      const tracks: MediaStreamTrack[] = [...displayStream.getVideoTracks()];
      
      if (includeSystemAudio) {
        const systemAudioTracks = displayStream.getAudioTracks();
        tracks.push(...systemAudioTracks);
      }
      
      if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
      }

      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;

      // Show preview
      if (previewRef.current) {
        previewRef.current.srcObject = combinedStream;
        previewRef.current.muted = true;
        previewRef.current.play();
      }

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 2500000
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        if (previewRef.current) {
          previewRef.current.srcObject = null;
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Handle user stopping screen share
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

    } catch (err) {
      setError("Failed to start screen recording. Please ensure you grant permission.");
      console.error("Screen recording error:", err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const downloadRecording = () => {
    if (!recordedUrl) return;
    const a = document.createElement("a");
    a.href = recordedUrl;
    a.download = `screen-recording-${new Date().getTime()}.webm`;
    a.click();
  };

  return (
    <>
      <SEO 
        title="Screen Recorder - Back2Life.Studio"
        description="Record your screen with audio directly in your browser"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-500/5">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Screen Recorder
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Record your screen, webcam, or both with audio directly in your browser
              </p>
            </div>

            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle>Recording Settings</CardTitle>
                <CardDescription>
                  Configure your screen recording preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select value={resolution} onValueChange={setResolution} disabled={isRecording}>
                      <SelectTrigger id="resolution">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1080">1080p (1920×1080)</SelectItem>
                        <SelectItem value="720">720p (1280×720)</SelectItem>
                        <SelectItem value="max">Maximum Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="microphone" className="cursor-pointer">
                        Include Microphone
                      </Label>
                      <Switch
                        id="microphone"
                        checked={includeMicrophone}
                        onCheckedChange={setIncludeMicrophone}
                        disabled={isRecording}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="system-audio" className="cursor-pointer">
                        Include System Audio
                      </Label>
                      <Switch
                        id="system-audio"
                        checked={includeSystemAudio}
                        onCheckedChange={setIncludeSystemAudio}
                        disabled={isRecording}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {!isRecording && !recordedUrl && (
                  <Button
                    onClick={startRecording}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                    size="lg"
                  >
                    <Monitor className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="font-mono text-2xl font-bold">
                            {formatTime(recordingTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {includeMicrophone && <Mic className="w-4 h-4" />}
                          {includeSystemAudio && <Video className="w-4 h-4" />}
                        </div>
                      </div>

                      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                        <video
                          ref={previewRef}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={pauseRecording}
                          variant="outline"
                          className="flex-1"
                        >
                          {isPaused ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          className="flex-1"
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {recordedUrl && (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={recordedUrl}
                        controls
                        className="w-full h-full"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={downloadRecording}
                        className="flex-1"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Recording
                      </Button>
                      <Button
                        onClick={() => {
                          setRecordedUrl(null);
                          setRecordingTime(0);
                        }}
                        className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                      >
                        <Monitor className="w-4 h-4 mr-2" />
                        New Recording
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">📝 Tips for Best Results</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Grant browser permissions for screen and microphone access</li>
                    <li>• Choose specific window/tab for focused recordings</li>
                    <li>• Close unnecessary apps to improve performance</li>
                    <li>• Higher resolutions create larger file sizes</li>
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