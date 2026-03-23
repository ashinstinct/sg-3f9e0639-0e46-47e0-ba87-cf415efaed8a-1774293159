import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileAudio, Play, Pause, Download, Loader2, Volume2, Zap, Scissors, TrendingUp } from "lucide-react";

type AudioEffect = {
  volume: number;
  speed: number;
  trimStart: number;
  trimEnd: number;
  fadeIn: number;
  fadeOut: number;
  normalize: boolean;
};

export default function AudioEditor() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const [effects, setEffects] = useState<AudioEffect>({
    volume: 100,
    speed: 1.0,
    trimStart: 0,
    trimEnd: 100,
    fadeIn: 0,
    fadeOut: 0,
    normalize: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      // Generate waveform
      await generateWaveform(file);
    }
  };

  const generateWaveform = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = audioBuffer.getChannelData(0);
      const samples = 200; // Number of waveform bars
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];

      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      const multiplier = Math.max(...filteredData) ** -1;
      setWaveformData(filteredData.map(n => n * multiplier));
      
      audioContextRef.current = audioContext;
    } catch (error) {
      console.error("Error generating waveform:", error);
    }
  };

  const handleAudioLoad = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
      setEffects(prev => ({ ...prev, trimEnd: audioRef.current!.duration }));
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Apply trim bounds
      if (audioRef.current.currentTime < effects.trimStart) {
        audioRef.current.currentTime = effects.trimStart;
      }
      if (audioRef.current.currentTime >= effects.trimEnd) {
        audioRef.current.pause();
        audioRef.current.currentTime = effects.trimStart;
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleExport = async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    
    // This would call your FFmpeg API endpoint with all the effects
    setTimeout(() => {
      setIsProcessing(false);
      alert(`Audio editing requires server-side FFmpeg processing.\n\nEffects to apply:\n- Volume: ${effects.volume}%\n- Speed: ${effects.speed}x\n- Trim: ${formatTime(effects.trimStart)} → ${formatTime(effects.trimEnd)}\n- Fade In: ${effects.fadeIn}s\n- Fade Out: ${effects.fadeOut}s\n- Normalize: ${effects.normalize ? "Yes" : "No"}`);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Draw waveform on canvas
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Gradient for waveform
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgb(99, 102, 241)");
      gradient.addColorStop(1, "rgb(168, 85, 247)");

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw trim markers
    const trimStartX = (effects.trimStart / audioDuration) * width;
    const trimEndX = (effects.trimEnd / audioDuration) * width;

    ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
    ctx.fillRect(0, 0, trimStartX, height);
    ctx.fillRect(trimEndX, 0, width - trimEndX, height);

    // Draw playhead
    const playheadX = (currentTime / audioDuration) * width;
    ctx.strokeStyle = "rgb(34, 197, 94)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

  }, [waveformData, currentTime, audioDuration, effects.trimStart, effects.trimEnd]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = effects.speed;
      audioRef.current.volume = effects.volume / 100;
    }
  }, [effects.speed, effects.volume]);

  return (
    <>
      <SEO
        title="Audio Editor - Back2Life.Studio"
        description="Professional audio editing with trim, volume, speed, fade effects. CapCut-style interface."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Audio Editor</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Professional audio editing with trim, volume, speed, and fade effects.
              </p>
            </div>

            {!audioFile ? (
              <Card>
                <CardContent className="pt-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-16 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Upload Audio File</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP3, WAV, M4A, FLAC, OGG (max 100MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* File Info */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <FileAudio className="w-12 h-12 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{audioFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(audioFile.size)} • {formatTime(audioDuration)}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setAudioFile(null);
                          setAudioUrl("");
                          setWaveformData([]);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Change File
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Waveform & Playback */}
                <Card>
                  <CardHeader>
                    <CardTitle>Waveform Timeline</CardTitle>
                    <CardDescription>
                      Visual representation of your audio. Use trim markers to select region.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={150}
                      className="w-full rounded-lg bg-muted/30"
                    />

                    <div className="flex items-center gap-4">
                      <Button
                        onClick={togglePlayPause}
                        size="lg"
                        variant={isPlaying ? "destructive" : "default"}
                        className="w-24"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </>
                        )}
                      </Button>

                      <div className="flex-1 space-y-2">
                        <Slider
                          value={[currentTime]}
                          max={audioDuration}
                          step={0.01}
                          onValueChange={handleSeek}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(audioDuration)}</span>
                        </div>
                      </div>
                    </div>

                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onLoadedMetadata={handleAudioLoad}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  </CardContent>
                </Card>

                {/* Effects Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle>Audio Effects</CardTitle>
                    <CardDescription>
                      Adjust audio properties and apply effects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="trim" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="trim">
                          <Scissors className="w-4 h-4 mr-2" />
                          Trim
                        </TabsTrigger>
                        <TabsTrigger value="volume">
                          <Volume2 className="w-4 h-4 mr-2" />
                          Volume
                        </TabsTrigger>
                        <TabsTrigger value="speed">
                          <Zap className="w-4 h-4 mr-2" />
                          Speed
                        </TabsTrigger>
                        <TabsTrigger value="fade">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Fade
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="trim" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Start Time: {formatTime(effects.trimStart)}</Label>
                          <Slider
                            value={[effects.trimStart]}
                            max={audioDuration}
                            step={0.1}
                            onValueChange={(v) => setEffects({ ...effects, trimStart: Math.min(v[0], effects.trimEnd - 0.5) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Time: {formatTime(effects.trimEnd)}</Label>
                          <Slider
                            value={[effects.trimEnd]}
                            max={audioDuration}
                            step={0.1}
                            onValueChange={(v) => setEffects({ ...effects, trimEnd: Math.max(v[0], effects.trimStart + 0.5) })}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Selected duration: {formatTime(effects.trimEnd - effects.trimStart)}
                        </p>
                      </TabsContent>

                      <TabsContent value="volume" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Volume: {effects.volume}%</Label>
                          <Slider
                            value={[effects.volume]}
                            max={200}
                            step={1}
                            onValueChange={(v) => setEffects({ ...effects, volume: v[0] })}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEffects({ ...effects, volume: 50 })}>
                              50%
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEffects({ ...effects, volume: 100 })}>
                              100%
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEffects({ ...effects, volume: 150 })}>
                              150%
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEffects({ ...effects, volume: 200 })}>
                              200%
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="speed" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Speed: {effects.speed}x</Label>
                          <Slider
                            value={[effects.speed]}
                            min={0.5}
                            max={2}
                            step={0.1}
                            onValueChange={(v) => setEffects({ ...effects, speed: v[0] })}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEffects({ ...effects, speed: 0.5 })}>
                              0.5x
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEffects({ ...effects, speed: 0.75 })}>
                              0.75x
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEffects({ ...effects, speed: 1.0 })}>
                              1.0x
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEffects({ ...effects, speed: 1.5 })}>
                              1.5x
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEffects({ ...effects, speed: 2.0 })}>
                              2.0x
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="fade" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Fade In: {effects.fadeIn}s</Label>
                          <Slider
                            value={[effects.fadeIn]}
                            max={5}
                            step={0.1}
                            onValueChange={(v) => setEffects({ ...effects, fadeIn: v[0] })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fade Out: {effects.fadeOut}s</Label>
                          <Slider
                            value={[effects.fadeOut]}
                            max={5}
                            step={0.1}
                            onValueChange={(v) => setEffects({ ...effects, fadeOut: v[0] })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={effects.normalize}
                            onChange={(e) => setEffects({ ...effects, normalize: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <Label>Normalize audio (auto-level)</Label>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Export */}
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      onClick={handleExport}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export Edited Audio
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Note: Audio processing requires FFmpeg backend. Contact support to enable this feature.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}