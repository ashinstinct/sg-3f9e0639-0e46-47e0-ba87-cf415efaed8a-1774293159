import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Upload, Play, Pause, Scissors, Volume2, Download, RefreshCw, X, SlidersHorizontal } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

export default function AudioEditorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [activeTool, setActiveTool] = useState<"trim" | "fade" | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [exportName, setExportName] = useState("edited-audio");
  const [duration, setDuration] = useState(0);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const regionsPlugin = useRef<RegionsPlugin | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use refs for state accessed inside timeupdate event to avoid re-binding
  const stateRef = useRef({ trimStart, trimEnd, fadeIn, fadeOut, volume, activeTool });
  useEffect(() => {
    stateRef.current = { trimStart, trimEnd, fadeIn, fadeOut, volume, activeTool };
  }, [trimStart, trimEnd, fadeIn, fadeOut, volume, activeTool]);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

    // Create plugins
    const regions = RegionsPlugin.create();
    regionsPlugin.current = regions;

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
      plugins: [regions],
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
          <stop offset="0%" stop-color="#a855f7" />
          <stop offset="50%" stop-color="#ec4899" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
      </defs>
    `;
    waveformRef.current.appendChild(svg);

    // Event listeners
    ws.on('ready', () => {
      ws.setVolume(volume);
      const d = ws.getDuration();
      setDuration(d);
      
      // Default trim region
      regions.addRegion({
        start: 0,
        end: d,
        color: 'rgba(168, 85, 247, 0.3)', // purple
        drag: false,
        resize: false, // controlled by slider
        id: 'trim-region'
      });

      // Default fade in region (invisible initially)
      regions.addRegion({
        start: 0,
        end: 0,
        color: 'rgba(34, 197, 94, 0.4)', // green
        drag: false,
        resize: false,
        id: 'fade-in'
      });

      // Default fade out region
      regions.addRegion({
        start: d,
        end: d,
        color: 'rgba(239, 68, 68, 0.4)', // red
        drag: false,
        resize: false,
        id: 'fade-out'
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

  useEffect(() => {
    if (!wavesurfer.current) return;
    
    const ws = wavesurfer.current;
    
    const onTimeUpdate = (currentTime: number) => {
      const d = ws.getDuration();
      if (!d) return;

      const { trimStart, trimEnd, fadeIn, fadeOut, volume, activeTool } = stateRef.current;
      
      const startSec = (trimStart / 100) * d;
      const endSec = (trimEnd / 100) * d;

      // Handle Loop for Trim Tool
      if (activeTool === 'trim') {
        if (currentTime >= endSec) {
          ws.setTime(startSec);
        }
      }

      // Handle Real-time Fade Volume
      let newVol = volume;
      // Fade in applied to the trimStart boundary
      const actualTimeInTrim = currentTime - startSec;
      const trimDuration = endSec - startSec;
      
      if (currentTime >= startSec && currentTime <= endSec) {
        if (fadeIn > 0 && actualTimeInTrim < fadeIn) {
          newVol = volume * (actualTimeInTrim / fadeIn);
        } else if (fadeOut > 0 && (trimDuration - actualTimeInTrim) < fadeOut) {
          newVol = volume * ((trimDuration - actualTimeInTrim) / fadeOut);
        }
      }
      
      // Only mute if we are outside trim region
      if (currentTime < startSec || currentTime > endSec) {
        newVol = 0;
      }

      // clamp
      newVol = Math.max(0, Math.min(volume, newVol));
      ws.setVolume(newVol);
    };

    ws.on('timeupdate', onTimeUpdate);
    return () => {
      ws.un('timeupdate', onTimeUpdate);
    };
  }, [audioUrl]);

  // Update regions when sliders change
  useEffect(() => {
    if (!regionsPlugin.current || !wavesurfer.current || !duration) return;
    
    const regions = regionsPlugin.current.getRegions();
    
    const trimRegion = regions.find(r => r.id === 'trim-region');
    if (trimRegion) {
      trimRegion.setOptions({
        start: (trimStart / 100) * duration,
        end: (trimEnd / 100) * duration
      });
    }

    const fadeInRegion = regions.find(r => r.id === 'fade-in');
    if (fadeInRegion) {
      fadeInRegion.setOptions({
        start: (trimStart / 100) * duration,
        end: (trimStart / 100) * duration + fadeIn
      });
    }

    const fadeOutRegion = regions.find(r => r.id === 'fade-out');
    if (fadeOutRegion) {
      fadeOutRegion.setOptions({
        start: (trimEnd / 100) * duration - fadeOut,
        end: (trimEnd / 100) * duration
      });
    }
  }, [trimStart, trimEnd, fadeIn, fadeOut, duration]);

  // Volume updates manually if not playing
  useEffect(() => {
    if (wavesurfer.current && !isPlaying) {
      wavesurfer.current.setVolume(volume);
    }
  }, [volume, isPlaying]);

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
      // If we are currently outside trim bounds, jump to trimStart
      const ws = wavesurfer.current;
      const d = ws.getDuration();
      const startSec = (trimStart / 100) * d;
      const endSec = (trimEnd / 100) * d;
      
      if (!isPlaying && (ws.getCurrentTime() < startSec || ws.getCurrentTime() >= endSec)) {
        ws.setTime(startSec);
      }
      ws.playPause();
    }
  };

  const resetEdits = () => {
    setTrimStart(0);
    setTrimEnd(100);
    setFadeIn(0);
    setFadeOut(0);
    setVolume(1);
    setActiveTool(null);
  };

  const handleExport = () => {
    alert(`Exporting ${exportName} with Trim: ${trimStart.toFixed(1)}-${trimEnd.toFixed(1)}%, Fade: ${fadeIn}s/${fadeOut}s, Vol: ${volume}`);
  };

  return (
    <>
      <SEO 
        title="Audio Editor - Back2Life.Studio"
        description="Professional audio editing with real-time waveform visualization"
      />
      <div className="min-h-screen bg-slate-900 pb-20">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
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
                    
                    <div className="relative w-full bg-slate-900/80 p-4">
                      <div ref={waveformRef} className="w-full relative z-10" />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button
                    onClick={togglePlayback}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 ml-1 text-white" />}
                  </Button>
                  <Button
                    variant={activeTool === "trim" ? "default" : "secondary"}
                    onClick={() => setActiveTool(activeTool === "trim" ? null : "trim")}
                    className={`flex-1 h-12 ${activeTool === "trim" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
                  >
                    <Scissors className="w-4 h-4 mr-2" /> Trim
                  </Button>
                  <Button
                    variant={activeTool === "fade" ? "default" : "secondary"}
                    onClick={() => setActiveTool(activeTool === "fade" ? null : "fade")}
                    className={`flex-1 h-12 ${activeTool === "fade" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" /> Fade
                  </Button>
                </div>

                {activeTool === "trim" && (
                  <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Trim Range</span>
                        <span className="text-slate-400 font-mono">
                          {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
                        </span>
                      </div>
                      <div className="relative pt-2 pb-6">
                        <input
                          type="range"
                          min="0"
                          max={duration}
                          step="0.1"
                          value={trimStart}
                          onChange={(e) => {
                            const newStart = parseFloat(e.target.value);
                            if (newStart < trimEnd) {
                              setTrimStart(newStart);
                              updateTrimRegion(newStart, trimEnd);
                            }
                          }}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer"
                          style={{
                            background: 'transparent',
                            zIndex: 2
                          }}
                        />
                        <input
                          type="range"
                          min="0"
                          max={duration}
                          step="0.1"
                          value={trimEnd}
                          onChange={(e) => {
                            const newEnd = parseFloat(e.target.value);
                            if (newEnd > trimStart) {
                              setTrimEnd(newEnd);
                              updateTrimRegion(trimStart, newEnd);
                            }
                          }}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer"
                          style={{
                            background: 'transparent',
                            zIndex: 1
                          }}
                        />
                        <div className="w-full h-2 bg-slate-700 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                            style={{
                              marginLeft: `${(trimStart / duration) * 100}%`,
                              width: `${((trimEnd - trimStart) / duration) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTool === "fade" && (
                  <Card className="bg-slate-800/50 border-indigo-500/30">
                    <CardContent className="p-4 grid grid-cols-2 gap-6 pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">Fade In</span>
                          <span className="text-indigo-400">{fadeIn.toFixed(1)}s</span>
                        </div>
                        <Slider
                          value={[fadeIn]}
                          min={0}
                          max={10}
                          step={0.1}
                          onValueChange={([v]) => setFadeIn(v)}
                          className="[&>span:first-child]:bg-indigo-500/20 [&_[role=slider]]:bg-black [&_[role=slider]]:border-white [&_[role=slider]]:border-2"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">Fade Out</span>
                          <span className="text-indigo-400">{fadeOut.toFixed(1)}s</span>
                        </div>
                        <Slider
                          value={[fadeOut]}
                          min={0}
                          max={10}
                          step={0.1}
                          onValueChange={([v]) => setFadeOut(v)}
                          className="[&>span:first-child]:bg-indigo-500/20 [&_[role=slider]]:bg-black [&_[role=slider]]:border-white [&_[role=slider]]:border-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <Slider
                      value={[volume]}
                      min={0}
                      max={2}
                      step={0.1}
                      onValueChange={([v]) => setVolume(v)}
                      className="flex-1 [&_[role=slider]]:bg-black [&_[role=slider]]:border-white [&_[role=slider]]:border-2"
                    />
                  </div>
                </div>

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
                  <Button onClick={resetEdits} variant="outline" className="border-slate-600 h-12 w-12 p-0 flex-shrink-0 text-white hover:text-white">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleExport} className="bg-cyan-600 hover:bg-cyan-700 h-12 px-6 text-white">
                    <Download className="w-4 h-4 mr-2" /> Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #1e293b;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          position: relative;
          z-index: 10;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #1e293b;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          position: relative;
          z-index: 10;
        }
      `}</style>
    </>
  );
}