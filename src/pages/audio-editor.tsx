import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Download, Upload, X, Volume2, RotateCcw, Scissors, Music, Repeat, RefreshCw, SlidersHorizontal } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

export default function AudioEditorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(100);
  const [activeTool, setActiveTool] = useState<"trim" | "fade" | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [exportName, setExportName] = useState("edited-audio");
  const [duration, setDuration] = useState(0);
  
  const wavesurferRef = useRef<any>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const trimRegionRef = useRef<any>(null);
  const fadeInRegionRef = useRef<any>(null);
  const fadeOutRegionRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use refs for state accessed inside timeupdate event to avoid re-binding
  const stateRef = useRef({ trimStart, trimEnd, fadeIn, fadeOut, volume, activeTool });
  useEffect(() => {
    stateRef.current = { trimStart, trimEnd, fadeIn, fadeOut, volume, activeTool };
  }, [trimStart, trimEnd, fadeIn, fadeOut, volume, activeTool]);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

    // Cleanup previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    const initWaveSurfer = () => {
      const WaveSurfer = (window as any).WaveSurfer;
      if (!WaveSurfer || !waveformRef.current) return;

      try {
        const ws = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: 'rgb(148, 163, 184)',
          progressColor: 'rgb(168, 85, 247)',
          cursorColor: 'rgb(236, 72, 153)',
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          height: 128,
          normalize: true,
        });

        ws.load(audioUrl);
        
        ws.on('ready', () => {
          const dur = ws.getDuration();
          setDuration(dur);
          setTrimEnd(dur);
        });

        ws.on('finish', () => {
          if (isLooping) {
            ws.play();
          } else {
            setIsPlaying(false);
          }
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));

        wavesurferRef.current = ws;
      } catch (error) {
        console.error('WaveSurfer initialization error:', error);
      }
    };

    if (scriptLoadedRef.current) {
      initWaveSurfer();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/wavesurfer.js@7';
      script.onload = () => {
        scriptLoadedRef.current = true;
        initWaveSurfer();
      };
      script.onerror = () => {
        console.error('Failed to load WaveSurfer.js');
      };
      document.head.appendChild(script);
    }

    return () => {
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (error) {
          console.error('Error destroying WaveSurfer:', error);
        }
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl]);

  // Handle loop state changes
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.un('finish');
      wavesurferRef.current.on('finish', () => {
        if (isLooping) {
          wavesurferRef.current?.play();
        } else {
          setIsPlaying(false);
        }
      });
    }
  }, [isLooping]);

  useEffect(() => {
    if (!wavesurferRef.current) return;
    
    const ws = wavesurferRef.current;
    
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
    if (!trimRegionRef.current || !fadeInRegionRef.current || !fadeOutRegionRef.current || !wavesurferRef.current || !duration) return;
    
    const trimRegion = trimRegionRef.current;
    const fadeInRegion = fadeInRegionRef.current;
    const fadeOutRegion = fadeOutRegionRef.current;
    
    const startSec = (trimStart / 100) * duration;
    const endSec = (trimEnd / 100) * duration;
    const fadeInSec = startSec + fadeIn;
    const fadeOutSec = endSec - fadeOut;

    trimRegion.setOptions({
      start: startSec,
      end: endSec
    });

    fadeInRegion.setOptions({
      start: startSec,
      end: fadeInSec
    });

    fadeOutRegion.setOptions({
      start: fadeOutSec,
      end: endSec
    });
  }, [trimStart, trimEnd, fadeIn, fadeOut, duration]);

  // Volume updates manually if not playing
  useEffect(() => {
    if (wavesurferRef.current && !isPlaying) {
      wavesurferRef.current.setVolume(volume);
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
    if (wavesurferRef.current) {
      // If we are currently outside trim bounds, jump to trimStart
      const ws = wavesurferRef.current;
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsLooping(!isLooping)}
                          className={`border-slate-600 ${
                            isLooping 
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                              : 'text-slate-400 hover:bg-slate-700/50'
                          }`}
                        >
                          <Repeat className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAudioFile(null);
                            setAudioUrl(null);
                            setIsPlaying(false);
                            setIsLooping(false);
                          }}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
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