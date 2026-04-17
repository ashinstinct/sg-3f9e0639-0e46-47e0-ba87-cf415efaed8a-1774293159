import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, Download, Upload, X, Volume2, RotateCcw, Scissors, Music, Repeat } from "lucide-react";

export default function AudioEditorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true); // Loop on by default
  const [volumeDb, setVolumeDb] = useState(0); // Volume in dB
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [showTrimControls, setShowTrimControls] = useState(false);
  const [showFadeControls, setShowFadeControls] = useState(false);
  const [fileName, setFileName] = useState("");

  const wavesurferRef = useRef<any>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const trimRegionRef = useRef<any>(null);
  const fadeInRegionRef = useRef<any>(null);
  const fadeOutRegionRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);

  // Convert dB to linear gain
  const dbToGain = (db: number) => Math.pow(10, db / 20);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

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
          ws.setVolume(dbToGain(volumeDb));
        });

        ws.on('finish', () => {
          if (isLooping) {
            ws.setTime(trimStart);
            ws.play();
          } else {
            setIsPlaying(false);
          }
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));

        wavesurferRef.current = ws;
      } catch (error) {
        console.error('WaveSurfer error:', error);
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
      document.head.appendChild(script);
    }

    return () => {
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (e) {
          console.error('Destroy error:', e);
        }
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl]);

  // Update volume
  useEffect(() => {
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.setVolume(dbToGain(volumeDb));
      } catch (error) {
        console.error('Volume update error:', error);
      }
    }
  }, [volumeDb]);

  // Update trim region
  useEffect(() => {
    if (!wavesurferRef.current || duration === 0) return;

    try {
      if (trimRegionRef.current) {
        trimRegionRef.current.remove();
      }

      const RegionsPlugin = (window as any).WaveSurfer?.Regions;
      if (RegionsPlugin && !wavesurferRef.current.regions) {
        wavesurferRef.current.registerPlugin(RegionsPlugin.create());
      }

      if (wavesurferRef.current.regions) {
        trimRegionRef.current = wavesurferRef.current.regions.addRegion({
          start: trimStart,
          end: trimEnd,
          color: 'rgba(168, 85, 247, 0.2)',
          drag: false,
          resize: false,
        });
      }
    } catch (error) {
      console.error('Trim region error:', error);
    }
  }, [trimStart, trimEnd, duration]);

  // Update fade regions
  useEffect(() => {
    if (!wavesurferRef.current || duration === 0) return;

    try {
      if (fadeInRegionRef.current) fadeInRegionRef.current.remove();
      if (fadeOutRegionRef.current) fadeOutRegionRef.current.remove();

      const RegionsPlugin = (window as any).WaveSurfer?.Regions;
      if (RegionsPlugin && !wavesurferRef.current.regions) {
        wavesurferRef.current.registerPlugin(RegionsPlugin.create());
      }

      if (wavesurferRef.current.regions && fadeIn > 0) {
        fadeInRegionRef.current = wavesurferRef.current.regions.addRegion({
          start: trimStart,
          end: Math.min(trimStart + fadeIn, trimEnd),
          color: 'rgba(34, 197, 94, 0.3)',
          drag: false,
          resize: false,
        });
      }

      if (wavesurferRef.current.regions && fadeOut > 0) {
        fadeOutRegionRef.current = wavesurferRef.current.regions.addRegion({
          start: Math.max(trimEnd - fadeOut, trimStart),
          end: trimEnd,
          color: 'rgba(239, 68, 68, 0.3)',
          drag: false,
          resize: false,
        });
      }
    } catch (error) {
      console.error('Fade region error:', error);
    }
  }, [fadeIn, fadeOut, trimStart, trimEnd, duration]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setTrimStart(0);
      setFadeIn(0);
      setFadeOut(0);
    }
  };

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleReset = () => {
    setVolumeDb(0);
    setTrimStart(0);
    setTrimEnd(duration);
    setFadeIn(0);
    setFadeOut(0);
  };

  const handleExport = async () => {
    if (!audioFile) return;
    
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("trimStart", trimStart.toString());
    formData.append("trimEnd", trimEnd.toString());
    formData.append("fadeIn", fadeIn.toString());
    formData.append("fadeOut", fadeOut.toString());
    formData.append("volumeDb", volumeDb.toString());

    try {
      const response = await fetch("/api/audio/edit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.mp3`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <>
      <SEO 
        title="Audio Editor - Back2Life.Studio"
        description="Professional audio editing tool with trim, fade, and volume controls"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
                <Scissors className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Audio Editor</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Audio Editor
              </h1>
              <p className="text-lg text-slate-300">
                Professional audio editing with real-time waveform visualization
              </p>
            </div>

            {/* Upload Section */}
            {!audioFile && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-12">
                  <label className="flex flex-col items-center justify-center cursor-pointer space-y-4 hover:opacity-80 transition-opacity">
                    <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">Upload Audio File</p>
                      <p className="text-sm text-slate-400">MP3, WAV, M4A, or other audio formats</p>
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </CardContent>
              </Card>
            )}

            {/* Editor Section */}
            {audioFile && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">{audioFile.name}</p>
                      <p className="text-xs text-slate-400">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
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
                          setIsLooping(true);
                        }}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Waveform */}
                  <div ref={waveformRef} className="rounded-lg overflow-hidden bg-slate-900/50" />

                  {/* Controls Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      onClick={togglePlayPause}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowTrimControls(!showTrimControls)}
                      className={`border-slate-600 ${
                        showTrimControls 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                          : 'text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <Scissors className="w-4 h-4 mr-2" />
                      Trim
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowFadeControls(!showFadeControls)}
                      className={`border-slate-600 ${
                        showFadeControls 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                          : 'text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <Music className="w-4 h-4 mr-2" />
                      Fade
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>

                  {/* Volume Control */}
                  <div className="space-y-2 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">Volume</span>
                      </div>
                      <span className="text-slate-400 font-mono">
                        {volumeDb > 0 ? '+' : ''}{volumeDb} dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-60"
                      max="12"
                      step="1"
                      value={volumeDb}
                      onChange={(e) => setVolumeDb(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Trim Controls */}
                  {showTrimControls && (
                    <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">Trim Range</span>
                          <span className="text-slate-400 font-mono">
                            {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
                          </span>
                        </div>
                        <div className="relative h-12 flex items-center">
                          <div className="absolute w-full h-2 bg-slate-700 rounded-full">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                              style={{
                                marginLeft: `${(trimStart / duration) * 100}%`,
                                width: `${((trimEnd - trimStart) / duration) * 100}%`
                              }}
                            />
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={duration}
                            step="0.1"
                            value={trimStart}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (val < trimEnd) setTrimStart(val);
                            }}
                            className="absolute w-full appearance-none bg-transparent cursor-pointer"
                            style={{ zIndex: 3 }}
                          />
                          <input
                            type="range"
                            min="0"
                            max={duration}
                            step="0.1"
                            value={trimEnd}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (val > trimStart) setTrimEnd(val);
                            }}
                            className="absolute w-full appearance-none bg-transparent cursor-pointer"
                            style={{ zIndex: 2 }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fade Controls */}
                  {showFadeControls && (
                    <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-400">Fade In</span>
                            <span className="text-slate-400 font-mono">{fadeIn.toFixed(1)}s</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={fadeIn}
                            onChange={(e) => setFadeIn(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-green-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-red-400">Fade Out</span>
                            <span className="text-slate-400 font-mono">{fadeOut.toFixed(1)}s</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={fadeOut}
                            onChange={(e) => setFadeOut(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save As */}
                  <div className="space-y-2 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <Label htmlFor="filename" className="text-sm text-slate-300">
                      Save As
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="filename"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="bg-slate-900/50 border-slate-600 text-white flex-1"
                        placeholder="Enter filename"
                      />
                      <Button
                        onClick={handleExport}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #1e293b;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #1e293b;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}