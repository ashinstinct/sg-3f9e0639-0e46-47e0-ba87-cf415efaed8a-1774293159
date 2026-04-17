import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Upload, Play, Pause, Scissors, Volume2, Gauge, Download, RefreshCw, X, SlidersHorizontal } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.esm.js";

export default function AudioEditorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [activeTool, setActiveTool] = useState<"trim" | "fade" | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [exportName, setExportName] = useState("edited-audio");
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const spectrogramRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const regionsPlugin = useRef<RegionsPlugin | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!audioUrl || !waveformRef.current || !spectrogramRef.current) return;

    // Create plugins
    const regions = RegionsPlugin.create();
    regionsPlugin.current = regions;

    const spectrogram = Spectrogram.create({
      container: spectrogramRef.current,
      labels: true,
      height: 60,
      splitChannels: false,
      labelsBackground: 'rgba(0, 0, 0, 0.1)',
      labelsColor: '#94a3b8',
      labelsHzColor: '#94a3b8',
    });

    // Initialize WaveSurfer
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'url(#waveform-gradient)',
      progressColor: '#ec4899', // pink-500
      cursorColor: '#06b6d4', // cyan-500
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 100,
      normalize: true,
      plugins: [regions, spectrogram],
    });

    wavesurfer.current = ws;

    // Add gradient definition to container
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.innerHTML = `
      <defs>
        <linearGradient id="waveform-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#a855f7" /> <!-- purple-500 -->
          <stop offset="50%" stop-color="#ec4899" /> <!-- pink-500 -->
          <stop offset="100%" stop-color="#06b6d4" /> <!-- cyan-500 -->
        </linearGradient>
      </defs>
    `;
    waveformRef.current.appendChild(svg);

    // Event listeners
    ws.on('ready', () => {
      ws.setVolume(volume);
      ws.setPlaybackRate(speed);
      
      // Default trim region
      regions.addRegion({
        start: 0,
        end: ws.getDuration(),
        color: 'rgba(168, 85, 247, 0.2)', // purple-500 with opacity
        drag: false,
        resize: true,
        id: 'trim-region'
      });
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));

    // Load audio
    ws.load(audioUrl);

    return () => {
      ws.destroy();
    };
  }, [audioUrl]);

  // Handle trim region updates
  useEffect(() => {
    if (!regionsPlugin.current || !wavesurfer.current) return;
    
    regionsPlugin.current.on('region-updated', (region) => {
      if (region.id === 'trim-region') {
        const duration = wavesurfer.current?.getDuration() || 1;
        setTrimStart((region.start / duration) * 100);
        setTrimEnd((region.end / duration) * 100);
      }
    });
  }, [audioUrl]);

  // Update region when sliders change
  useEffect(() => {
    if (!regionsPlugin.current || !wavesurfer.current) return;
    
    const duration = wavesurfer.current.getDuration();
    if (!duration) return;

    const regions = regionsPlugin.current.getRegions();
    const trimRegion = regions.find(r => r.id === 'trim-region');
    
    if (trimRegion) {
      trimRegion.setOptions({
        start: (trimStart / 100) * duration,
        end: (trimEnd / 100) * duration
      });
    }
  }, [trimStart, trimEnd]);

  // Volume & Speed updates
  useEffect(() => {
    wavesurfer.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    wavesurfer.current?.setPlaybackRate(speed);
  }, [speed]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setExportName(file.name.replace(/\.[^/.]+$/, ""));
      // Reset states
      setIsPlaying(false);
      setTrimStart(0);
      setTrimEnd(100);
      setFadeIn(0);
      setFadeOut(0);
      setActiveTool(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setExportName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const togglePlayback = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const resetEdits = () => {
    setTrimStart(0);
    setTrimEnd(100);
    setFadeIn(0);
    setFadeOut(0);
    setVolume(1);
    setSpeed(1);
    setActiveTool(null);
  };

  const handleExport = () => {
    // In a real app, this would process the audio file using FFmpeg.wasm or a backend
    alert(`Exporting ${exportName} with Trim: ${trimStart.toFixed(1)}-${trimEnd.toFixed(1)}%, Fade: ${fadeIn}s/${fadeOut}s, Vol: ${volume}, Speed: ${speed}`);
  };

  return (
    <>
      <SEO 
        title="Audio Editor - Back2Life.Studio"
        description="Professional audio editing with real-time waveform and spectrum visualization"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pb-20">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header - Compact */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
                <Scissors className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-blue-300">Audio Editor</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Audio Editor
              </h1>
            </div>

            {!audioFile ? (
              <Card className="bg-slate-800/50 border-slate-700/50 border-dashed">
                <CardContent className="p-8">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center space-y-4 text-center cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">Drop audio here or click to upload</p>
                      <p className="text-sm text-slate-400">Supports MP3, WAV, M4A, OGG</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Visualizer Card */}
                <Card className="bg-slate-800/80 border-slate-700/50 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 bg-slate-900/50 border-b border-slate-700/50 flex justify-between items-center">
                      <div className="truncate max-w-[200px] text-sm text-white font-medium">
                        {audioFile.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAudioFile(null);
                          setAudioUrl(null);
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Waveform & Spectrogram Container */}
                    <div className="relative w-full bg-slate-900/80 p-4">
                      <div ref={waveformRef} className="w-full relative z-10" />
                      <div ref={spectrogramRef} className="w-full mt-2 rounded overflow-hidden opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                {/* Main Controls row */}
                <div className="flex gap-2">
                  <Button
                    onClick={togglePlayback}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                  </Button>
                  <Button
                    variant={activeTool === "trim" ? "default" : "secondary"}
                    onClick={() => setActiveTool(activeTool === "trim" ? null : "trim")}
                    className={`flex-1 h-12 ${activeTool === "trim" ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-700 hover:bg-slate-600"}`}
                  >
                    <Scissors className="w-4 h-4 mr-2" /> Trim
                  </Button>
                  <Button
                    variant={activeTool === "fade" ? "default" : "secondary"}
                    onClick={() => setActiveTool(activeTool === "fade" ? null : "fade")}
                    className={`flex-1 h-12 ${activeTool === "fade" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-700 hover:bg-slate-600"}`}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" /> Fade
                  </Button>
                </div>

                {/* Tool Panels */}
                {activeTool === "trim" && (
                  <Card className="bg-slate-800/50 border-blue-500/30">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-300">Trim Region</span>
                        <span className="text-blue-400">{trimStart.toFixed(1)}% - {trimEnd.toFixed(1)}%</span>
                      </div>
                      <Slider
                        value={[trimStart, trimEnd]}
                        min={0}
                        max={100}
                        step={0.1}
                        onValueChange={([start, end]) => {
                          setTrimStart(start);
                          setTrimEnd(end);
                        }}
                        className="[&>span:first-child]:bg-blue-500/20 [&_[role=slider]]:border-blue-500"
                      />
                      <p className="text-xs text-slate-500 text-center">Drag sliders or edges of the purple box on the waveform</p>
                    </CardContent>
                  </Card>
                )}

                {activeTool === "fade" && (
                  <Card className="bg-slate-800/50 border-indigo-500/30">
                    <CardContent className="p-4 grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">Fade In</span>
                          <span className="text-indigo-400">{fadeIn}s</span>
                        </div>
                        <Slider
                          value={[fadeIn]}
                          min={0}
                          max={10}
                          step={0.1}
                          onValueChange={([v]) => setFadeIn(v)}
                          className="[&>span:first-child]:bg-indigo-500/20 [&_[role=slider]]:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">Fade Out</span>
                          <span className="text-indigo-400">{fadeOut}s</span>
                        </div>
                        <Slider
                          value={[fadeOut]}
                          min={0}
                          max={10}
                          step={0.1}
                          onValueChange={([v]) => setFadeOut(v)}
                          className="[&>span:first-child]:bg-indigo-500/20 [&_[role=slider]]:border-indigo-500"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Compact Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <Slider
                      value={[volume]}
                      min={0}
                      max={2}
                      step={0.1}
                      onValueChange={([v]) => setVolume(v)}
                      className="flex-1"
                    />
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
                    <Gauge className="w-4 h-4 text-slate-400" />
                    <Slider
                      value={[speed]}
                      min={0.25}
                      max={2}
                      step={0.05}
                      onValueChange={([v]) => setSpeed(v)}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Save As & Export */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={exportName}
                      onChange={(e) => setExportName(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white pr-12 h-12"
                      placeholder="Filename"
                    />
                    <div className="absolute right-3 top-3 text-sm text-slate-500">.mp3</div>
                  </div>
                  <Button onClick={resetEdits} variant="outline" className="border-slate-600 h-12 w-12 p-0 flex-shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleExport} className="bg-cyan-600 hover:bg-cyan-700 h-12 px-6">
                    <Download className="w-4 h-4 mr-2" /> Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}