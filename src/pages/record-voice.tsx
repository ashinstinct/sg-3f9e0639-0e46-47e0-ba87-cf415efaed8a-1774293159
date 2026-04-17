import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Download, Share2, Edit, Sparkles, Trash2, Play, Pause, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function RecordVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        try {
          // Convert to MP3
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const mp3Blob = audioBufferToMp3(audioBuffer);
          const url = URL.createObjectURL(mp3Blob);
          setAudioURL(url);
          
          toast({
            title: "Recording saved",
            description: "Your recording is ready to play",
          });
        } catch (error) {
          // Fallback to WebM if conversion fails
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
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
        timerRef.current = null;
      }
    }
  };

  const audioBufferToMp3 = (audioBuffer: AudioBuffer): Blob => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952);
    setUint32(36 + length);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numberOfChannels);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numberOfChannels);
    setUint16(numberOfChannels * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length);

    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < buffer.byteLength) {
      for (let i = 0; i < numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: "audio/mp3" });
  };

  const setupAudioVisualization = () => {
    if (!audioRef.current) return;

    try {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      drawWaveform();
    } catch (error) {
      console.error("Error setting up visualization:", error);
    }
  };

  const drawWaveform = () => {
    if (!waveformCanvasRef.current || !analyserRef.current) return;

    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgb(15, 23, 42)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, "#a855f7");
        gradient.addColorStop(1, "#ec4899");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      if (!analyserRef.current) {
        setupAudioVisualization();
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = parseFloat(e.target.value);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleDownload = () => {
    if (!audioURL) return;
    const a = document.createElement("a");
    a.href = audioURL;
    a.download = `recording-${Date.now()}.mp3`;
    a.click();
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
          title: "My Recording",
        });
      } else {
        await navigator.clipboard.writeText(audioURL);
        toast({
          title: "Link copied",
          description: "Audio link copied to clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not share audio",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    setAudioURL(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.src = "";
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <SEO
        title="Voice Recorder - Record Audio in Browser"
        description="Record high-quality audio directly in your browser"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Navigation />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Voice Recorder
              </h1>
              <p className="text-muted-foreground">
                Record audio in MP3 format
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Left - Recorder */}
              <Card className="p-8 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex flex-col items-center gap-8">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        disabled={!!audioURL}
                        className={cn(
                          "w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95",
                          audioURL && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Mic className="w-16 h-16 text-white" />
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="w-32 h-32 rounded-full bg-red-500 flex items-center justify-center animate-pulse transition-all hover:scale-105 active:scale-95"
                      >
                        <Square className="w-16 h-16 text-white fill-white" />
                      </button>
                    )}

                    {isRecording && (
                      <div className="text-center">
                        <p className="text-2xl font-mono text-white mb-1">
                          {formatTime(recordingTime)}
                        </p>
                        <p className="text-sm text-muted-foreground">Recording...</p>
                      </div>
                    )}

                    {audioURL && !isRecording && (
                      <Button
                        onClick={handleDelete}
                        variant="outline"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        New Recording
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right - Playback */}
              <Card className="p-8 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  {audioURL ? (
                    <div className="space-y-6">
                      {/* Waveform */}
                      <div className="rounded-lg overflow-hidden border border-border">
                        <canvas
                          ref={waveformCanvasRef}
                          width={800}
                          height={200}
                          className="w-full h-[200px]"
                        />
                      </div>

                      {/* Audio element */}
                      <audio
                        ref={audioRef}
                        src={audioURL}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleEnded}
                        className="hidden"
                      />

                      {/* Controls */}
                      <div className="space-y-4">
                        {/* Play/Pause */}
                        <Button
                          onClick={togglePlayPause}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 mr-2" />
                          ) : (
                            <Play className="w-5 h-5 mr-2" />
                          )}
                          {isPlaying ? "Pause" : "Play"}
                        </Button>

                        {/* Timeline */}
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-4 h-4 text-muted-foreground" />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button onClick={handleDownload} variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button onClick={handleShare} variant="outline" className="w-full">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button asChild variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                          <Link href="/edit">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Audio
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                          <Link href="/enhance">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Enhance
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center py-16">
                      <p className="text-muted-foreground">
                        {isRecording ? "Recording in progress..." : "Your recording will appear here"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}