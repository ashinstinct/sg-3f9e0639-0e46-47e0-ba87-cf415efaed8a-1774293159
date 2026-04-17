import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Scissors, Upload, Play, Pause, Download, RotateCcw, Volume2, Gauge, FileAudio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AudioEditorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState("");
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(100);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const regionsRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

    const loadWaveSurfer = async () => {
      if (typeof window === "undefined") return;

      const WaveSurfer = (window as any).WaveSurfer;
      const RegionsPlugin = (window as any).WaveSurfer?.Regions;
      const TimelinePlugin = (window as any).WaveSurfer?.Timeline;

      if (!WaveSurfer || !RegionsPlugin || !TimelinePlugin) {
        console.error("WaveSurfer plugins not loaded");
        return;
      }

      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }

      const regions = RegionsPlugin.create();
      regionsRef.current = regions;

      const timeline = TimelinePlugin.create({
        height: 20,
        insertPosition: 'beforebegin',
        style: {
          color: '#94a3b8',
        }
      });

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#94a3b8',
        progressColor: '#a855f7',
        cursorColor: '#ec4899',
        height: 180,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        normalize: true,
        plugins: [regions, timeline],
      });

      wavesurferRef.current = ws;

      ws.load(audioUrl);

      ws.on('ready', () => {
        const duration = ws.getDuration();
        
        // Add trim region covering full audio initially
        regions.addRegion({
          start: 0,
          end: duration,
          color: 'rgba(168, 85, 247, 0.2)',
          drag: true,
          resize: true,
        });

        // Add fade in region
        regions.addRegion({
          start: 0,
          end: Math.min(2, duration),
          color: 'rgba(34, 197, 94, 0.3)',
          drag: false,
          resize: 'right',
          id: 'fade-in',
        });

        // Add fade out region
        regions.addRegion({
          start: Math.max(0, duration - 2),
          end: duration,
          color: 'rgba(239, 68, 68, 0.3)',
          drag: false,
          resize: 'left',
          id: 'fade-out',
        });

        toast({
          title: "Audio Loaded",
          description: "Drag the region markers to trim and adjust fades",
        });
      });

      ws.on('play', () => setIsPlaying(true));
      ws.on('pause', () => setIsPlaying(false));
      ws.on('finish', () => setIsPlaying(false));

      // Update fade values when regions change
      regions.on('region-updated', (region: any) => {
        if (region.id === 'fade-in') {
          setFadeIn(region.end);
        } else if (region.id === 'fade-out') {
          const duration = ws.getDuration();
          setFadeOut(duration - region.start);
        }
      });
    };

    loadWaveSurfer();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl, toast]);

  // Update volume
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volume / 100);
    }
  }, [volume]);

  // Update playback rate
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(playbackRate / 100);
    }
  }, [playbackRate]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an audio or video file",
        variant: "destructive",
      });
      return;
    }

    setAudioFile(file);
    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleReset = () => {
    setVolume(100);
    setPlaybackRate(100);
    if (regionsRef.current && wavesurferRef.current) {
      regionsRef.current.clearRegions();
      const duration = wavesurferRef.current.getDuration();
      
      regionsRef.current.addRegion({
        start: 0,
        end: duration,
        color: 'rgba(168, 85, 247, 0.2)',
        drag: true,
        resize: true,
      });

      regionsRef.current.addRegion({
        start: 0,
        end: Math.min(2, duration),
        color: 'rgba(34, 197, 94, 0.3)',
        drag: false,
        resize: 'right',
        id: 'fade-in',
      });

      regionsRef.current.addRegion({
        start: Math.max(0, duration - 2),
        end: duration,
        color: 'rgba(239, 68, 68, 0.3)',
        drag: false,
        resize: 'left',
        id: 'fade-out',
      });
    }
  };

  const handleExport = async () => {
    if (!audioFile) return;

    toast({
      title: "Exporting Audio",
      description: "Processing your audio file...",
    });

    // TODO: Send to backend API for processing with trim/fade/volume/speed settings
    // For now, just download original file with new name
    const link = document.createElement("a");
    link.href = audioUrl!;
    link.download = `${fileName}.${audioFile.name.split('.').pop()}`;
    link.click();

    toast({
      title: "Export Complete",
      description: `Saved as ${fileName}`,
    });
  };

  return (
    <>
      <SEO 
        title="Audio Editor - Back2Life.Studio"
        description="Professional audio editing with real-time waveform visualization"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navigation />
        <main className="container mx-auto px-4 py-20 md:py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
                <Scissors className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Audio Editor</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Audio Editor
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Drag region markers to trim • Adjust fade handles • Real-time playback
              </p>
            </div>

            {/* Upload Area */}
            {!audioFile ? (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-8">
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                    <Upload className="w-12 h-12 text-slate-400 mb-4" />
                    <span className="text-slate-300 font-medium mb-2">Drop audio file here</span>
                    <span className="text-sm text-slate-500">or click to browse</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="audio/*,video/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    />
                  </label>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Waveform with Controls */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-4 md:p-6 space-y-4">
                    {/* Waveform */}
                    <div className="space-y-2">
                      <div ref={timelineRef}></div>
                      <div ref={waveformRef} className="rounded-lg overflow-hidden bg-slate-900/50"></div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p>🟣 Purple: Trim region (drag edges to trim)</p>
                        <p>🟢 Green: Fade in (drag right edge)</p>
                        <p>🔴 Red: Fade out (drag left edge)</p>
                      </div>
                    </div>

                    {/* Compact Controls */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button
                        onClick={togglePlayPause}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {isPlaying ? "Pause" : "Play"}
                      </Button>

                      <div className="space-y-1">
                        <Label className="text-xs text-slate-400 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          Volume {volume}%
                        </Label>
                        <Slider
                          value={[volume]}
                          onValueChange={([v]) => setVolume(v)}
                          max={150}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-slate-400 flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          Speed {playbackRate}%
                        </Label>
                        <Slider
                          value={[playbackRate]}
                          onValueChange={([v]) => setPlaybackRate(v)}
                          min={25}
                          max={200}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="border-slate-600"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>

                    {/* Save As & Export */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm text-slate-300 flex items-center gap-2">
                          <FileAudio className="w-4 h-4" />
                          Save As
                        </Label>
                        <Input
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          placeholder="Enter filename"
                          className="bg-slate-900/50 border-slate-700"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button
                          onClick={handleExport}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Instructions */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-blue-400" />
                  How to Edit
                </h3>
                <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                  <li><strong className="text-white">Trim:</strong> Drag the purple region edges to select the part you want to keep</li>
                  <li><strong className="text-white">Fade In:</strong> Drag the right edge of the green region to adjust fade duration</li>
                  <li><strong className="text-white">Fade Out:</strong> Drag the left edge of the red region to adjust fade duration</li>
                  <li><strong className="text-white">Volume:</strong> Use the slider to adjust audio loudness (up to 150%)</li>
                  <li><strong className="text-white">Speed:</strong> Change playback speed from 25% to 200%</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}