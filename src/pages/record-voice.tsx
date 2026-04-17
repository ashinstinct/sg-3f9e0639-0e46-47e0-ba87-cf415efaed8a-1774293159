import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Mic, Square, Play, Pause, Download, Trash2, Share2, Edit, Sparkles, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";

export default function RecordVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const volumeCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const drawVolumeMonitor = () => {
    const canvas = volumeCanvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const normalizedVolume = average / 255;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 60 + (normalizedVolume * 30);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(34, 197, 94, ${0.3 + normalizedVolume * 0.7})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const drawWaveform = () => {
    const canvas = waveformCanvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 40;

    const draw = () => {
      if (!isPlaying) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const percent = value / 255;
        const barHeight = canvas.height * percent * 0.8;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, "#a855f7");
        gradient.addColorStop(1, "#ec4899");

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const mp3Blob = audioBufferToWav(audioBuffer);
          const url = URL.createObjectURL(mp3Blob);
          setAudioURL(url);
          
          toast({
            title: "Recording saved",
            description: "Your recording has been converted to MP3",
          });
        } catch (error) {
          console.error("Conversion error:", error);
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      drawVolumeMonitor();

      toast({
        title: "Recording started",
        description: "Speak into your microphone",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(pos + i, str.charCodeAt(i));
      }
    };

    writeString("RIFF"); pos += 4;
    view.setUint32(pos, 36 + length, true); pos += 4;
    writeString("WAVE"); pos += 4;
    writeString("fmt "); pos += 4;
    view.setUint32(pos, 16, true); pos += 4;
    view.setUint16(pos, 1, true); pos += 2;
    view.setUint16(pos, numberOfChannels, true); pos += 2;
    view.setUint32(pos, audioBuffer.sampleRate, true); pos += 4;
    view.setUint32(pos, audioBuffer.sampleRate * numberOfChannels * 2, true); pos += 4;
    view.setUint16(pos, numberOfChannels * 2, true); pos += 2;
    view.setUint16(pos, 16, true); pos += 2;
    writeString("data"); pos += 4;
    view.setUint32(pos, length, true); pos += 4;

    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < buffer.byteLength) {
      for (let i = 0; i < numberOfChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset]));
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: "audio/mp3" });
  };

  const togglePlayback = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioURL);
      
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });

      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioContext();
      }

      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
      drawWaveform();
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleShare = async () => {
    if (!audioURL) return;

    try {
      const response = await fetch(audioURL);
      const blob = await response.blob();
      const file = new File([blob], `recording-${Date.now()}.mp3`, { type: "audio/mp3" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "My Audio Recording",
        });
        toast({
          title: "Shared successfully",
          description: "Audio file shared",
        });
      } else {
        await navigator.clipboard.writeText(audioURL);
        toast({
          title: "Link copied",
          description: "Audio URL copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Share failed",
        description: "Could not share audio file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    setAudioURL("");
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    toast({
      title: "Recording deleted",
      description: "Your recording has been removed",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <SEO
        title="Audio Recorder - Record Voice"
        description="Record high-quality audio with MP3 output"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        
        <main className="container mx-auto px-4 py-12 pt-24 max-w-6xl">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Audio Recorder
            </h1>
            <p className="text-muted-foreground">
              Record high-quality audio with one click
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <canvas
                      ref={volumeCanvasRef}
                      width={200}
                      height={200}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      size="lg"
                      className={`w-24 h-24 rounded-full ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      }`}
                    >
                      {isRecording ? (
                        <Square className="w-10 h-10" />
                      ) : (
                        <Mic className="w-10 h-10" />
                      )}
                    </Button>
                  </div>

                  <div className="text-4xl font-bold text-center">
                    {formatTime(duration)}
                  </div>

                  {audioURL && !isRecording && (
                    <Button
                      onClick={() => {
                        setAudioURL("");
                        setDuration(0);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      New Recording
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                {audioURL ? (
                  <div className="space-y-6">
                    <div className="relative rounded-lg overflow-hidden bg-muted/20 border">
                      <canvas
                        ref={waveformCanvasRef}
                        width={800}
                        height={200}
                        className="w-full h-[200px]"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <Button
                          onClick={togglePlayback}
                          size="lg"
                          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6 ml-1" />
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Slider
                          value={[currentTime]}
                          max={duration || 100}
                          step={0.1}
                          onValueChange={handleSeek}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <Slider
                          value={[volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full"
                        >
                          <a href={audioURL} download={`recording-${Date.now()}.mp3`}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </Button>
                        <Button
                          onClick={handleShare}
                          variant="outline"
                          className="w-full"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-blue-500/50 hover:bg-blue-500/10"
                        >
                          <Link href="/edit">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Audio
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-emerald-500/50 hover:bg-emerald-500/10"
                        >
                          <Link href="/enhance">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Enhance
                          </Link>
                        </Button>
                      </div>

                      <Button
                        onClick={handleDelete}
                        variant="outline"
                        className="w-full border-red-500/50 hover:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground py-20">
                    {isRecording ? "Recording in progress..." : "Your recording will appear here"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}