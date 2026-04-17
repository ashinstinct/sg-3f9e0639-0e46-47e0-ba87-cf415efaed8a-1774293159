import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, Download, Upload, X, Volume2, RotateCcw, Scissors, Music2, Repeat } from "lucide-react";

export default function AudioEditorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [filename, setFilename] = useState("");

  const [showTrimControls, setShowTrimControls] = useState(false);
  const [showFadeControls, setShowFadeControls] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);

  const wavesurferRef = useRef<any>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setFilename(file.name.replace(/\.[^/.]+$/, ""));
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

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
          height: 100,
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
        } catch (e) {}
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.un('finish');
      wavesurferRef.current.on('finish', () => {
        if (isLooping) {
          wavesurferRef.current?.setTime(trimStart);
          wavesurferRef.current?.play();
        } else {
          setIsPlaying(false);
        }
      });
    }
  }, [isLooping, trimStart]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleReset = () => {
    setTrimStart(0);
    setTrimEnd(duration);
    setFadeIn(0);
    setFadeOut(0);
    setVolume(0);
    setShowTrimControls(false);
    setShowFadeControls(false);
  };

  const handleExport = async () => {
    if (!audioFile) return;
    const exportFilename = `${filename || 'audio'}.mp3`;
    const link = document.createElement('a');
    link.href = audioUrl || '';
    link.download = exportFilename;
    link.click();
  };

  const dbToGain = (db: number) => Math.pow(10, db / 20);

  useEffect(() => {
    if (wavesurferRef.current) {
      const gain = dbToGain(volume);
      wavesurferRef.current.setVolume(gain);
    }
  }, [volume]);

  return (
    <>
      <SEO 
        title="Audio Editor - Back2Life.Studio"
        description="Professional audio editing with trim, fade, and volume controls"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Audio Editor
            </h1>

            {!audioFile ? (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">Upload Audio File</h3>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{audioFile.name}</p>
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
                          handleReset();
                        }}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <div ref={waveformRef} className="w-full rounded-lg overflow-hidden bg-slate-900/50" />
                    
                    {/* Trim Region Overlay */}
                    {showTrimControls && duration > 0 && (
                      <div 
                        className="absolute top-0 left-0 h-full bg-purple-500/20 border-l-2 border-r-2 border-purple-500 pointer-events-none"
                        style={{
                          left: `${(trimStart / duration) * 100}%`,
                          width: `${((trimEnd - trimStart) / duration) * 100}%`
                        }}
                      />
                    )}

                    {/* Fade In Overlay */}
                    {showFadeControls && fadeIn > 0 && duration > 0 && (
                      <div 
                        className="absolute top-0 left-0 h-full pointer-events-none"
                        style={{
                          left: `${(trimStart / duration) * 100}%`,
                          width: `${(fadeIn / duration) * 100}%`,
                          background: 'linear-gradient(to right, rgba(34, 197, 94, 0.3), transparent)'
                        }}
                      />
                    )}

                    {/* Fade Out Overlay */}
                    {showFadeControls && fadeOut > 0 && duration > 0 && (
                      <div 
                        className="absolute top-0 right-0 h-full pointer-events-none"
                        style={{
                          right: `${((duration - trimEnd) / duration) * 100}%`,
                          width: `${(fadeOut / duration) * 100}%`,
                          background: 'linear-gradient(to left, rgba(239, 68, 68, 0.3), transparent)'
                        }}
                      />
                    )}
                  </div>

                  {/* Compact Button Row */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={togglePlayPause}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>

                    <Button
                      onClick={() => {
                        setShowTrimControls(!showTrimControls);
                        setShowFadeControls(false);
                      }}
                      variant="outline"
                      className={`border-slate-600 ${
                        showTrimControls 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                          : 'text-slate-400 hover:bg-slate-700/50'
                      }`}
                    >
                      <Scissors className="w-4 h-4 mr-1" />
                      <span className="text-xs">Trim</span>
                    </Button>

                    <Button
                      onClick={() => {
                        setShowFadeControls(!showFadeControls);
                        setShowTrimControls(false);
                      }}
                      variant="outline"
                      className={`border-slate-600 ${
                        showFadeControls 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                          : 'text-slate-400 hover:bg-slate-700/50'
                      }`}
                    >
                      <Music2 className="w-4 h-4 mr-1" />
                      <span className="text-xs">Fade</span>
                    </Button>

                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="border-slate-600 text-slate-400 hover:bg-slate-700/50"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Volume Control */}
                  <div className="space-y-2 bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">Volume</span>
                      </div>
                      <span className="text-slate-400 font-mono">
                        {volume > 0 ? '+' : ''}{volume} dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-60"
                      max="12"
                      step="1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer slider-thumb"
                    />
                  </div>

                  {/* Trim Controls */}
                  {showTrimControls && (
                    <div className="space-y-3 bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Trim Range</span>
                        <span className="text-slate-400 font-mono">
                          {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
                        </span>
                      </div>
                      <div className="relative h-8">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full h-2 bg-slate-700 rounded-full">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{
                                marginLeft: `${(trimStart / duration) * 100}%`,
                                width: `${((trimEnd - trimStart) / duration) * 100}%`
                              }}
                            />
                          </div>
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
                          className="absolute inset-0 w-full h-8 bg-transparent appearance-none cursor-pointer slider-thumb-dual"
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
                          className="absolute inset-0 w-full h-8 bg-transparent appearance-none cursor-pointer slider-thumb-dual"
                          style={{ zIndex: 2 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fade Controls */}
                  {showFadeControls && (
                    <div className="space-y-3 bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
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
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer slider-thumb"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
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
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer slider-thumb"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save As */}
                  <div className="space-y-2 bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                    <Label className="text-sm text-slate-300">Save As</Label>
                    <div className="flex gap-2">
                      <Input
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        placeholder="filename"
                        className="bg-slate-900/50 border-slate-700 text-white flex-1"
                      />
                      <Button
                        onClick={handleExport}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6"
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
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #1e293b;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #1e293b;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
        }

        .slider-thumb-dual::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: #1e293b;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: auto;
        }
        
        .slider-thumb-dual::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #1e293b;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          pointer-events: auto;
        }

        .slider-thumb-dual {
          pointer-events: none;
        }
      `}</style>
    </>
  );
}