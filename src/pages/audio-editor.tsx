import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, Download, Upload, X, Volume2, RotateCcw, Scissors, Music, Repeat } from "lucide-react";

export default function AudioEditorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [filename, setFilename] = useState("edited-audio");
  const [showTrimControls, setShowTrimControls] = useState(false);
  const [showFadeControls, setShowFadeControls] = useState(false);

  const wavesurferRef = useRef<any>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptLoadedRef = useRef(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setFilename(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Initialize WaveSurfer with Web Audio API
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
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (!gainNodeRef.current) {
          gainNodeRef.current = audioContextRef.current.createGain();
          gainNodeRef.current.connect(audioContextRef.current.destination);
        }

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
          backend: 'WebAudio',
          audioContext: audioContextRef.current,
        });

        ws.load(audioUrl);
        
        ws.on('ready', () => {
          const dur = ws.getDuration();
          setDuration(dur);
          setTrimEnd(dur);

          if (gainNodeRef.current) {
            const backend = ws.backend as any;
            if (backend.gainNode) {
              backend.gainNode.disconnect();
              backend.gainNode.connect(gainNodeRef.current);
            }
          }
        });

        ws.on('finish', () => {
          if (isLooping) {
            ws.seekTo(trimStart / duration);
            ws.play();
          } else {
            setIsPlaying(false);
          }
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));

        ws.on('audioprocess', (currentTime: number) => {
          if (!gainNodeRef.current) return;

          const trimmedStart = trimStart;
          const trimmedEnd = trimEnd;
          const relativeTime = currentTime - trimmedStart;
          const trimmedDuration = trimmedEnd - trimmedStart;

          let fadeGain = 1;

          if (fadeIn > 0 && relativeTime < fadeIn) {
            fadeGain = Math.min(fadeGain, relativeTime / fadeIn);
          }

          if (fadeOut > 0 && relativeTime > trimmedDuration - fadeOut) {
            const fadeOutStart = trimmedDuration - fadeOut;
            const fadeOutProgress = (relativeTime - fadeOutStart) / fadeOut;
            fadeGain = Math.min(fadeGain, 1 - fadeOutProgress);
          }

          const dbGain = Math.pow(10, volume / 20);
          const finalGain = fadeGain * dbGain;

          try {
            gainNodeRef.current.gain.setValueAtTime(
              finalGain,
              audioContextRef.current!.currentTime
            );
          } catch (error) {
            console.error('Gain setting error:', error);
          }
        });

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

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.un('finish');
      wavesurferRef.current.on('finish', () => {
        if (isLooping) {
          wavesurferRef.current?.seekTo(trimStart / duration);
          wavesurferRef.current?.play();
        } else {
          setIsPlaying(false);
        }
      });
    }
  }, [isLooping, trimStart, duration]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      try {
        const dbGain = Math.pow(10, volume / 20);
        gainNodeRef.current.gain.setValueAtTime(
          dbGain,
          audioContextRef.current.currentTime
        );
      } catch (error) {
        console.error('Volume adjustment error:', error);
      }
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleReset = () => {
    setVolume(0);
    setTrimStart(0);
    setTrimEnd(duration);
    setFadeIn(0);
    setFadeOut(0);
    setShowTrimControls(false);
    setShowFadeControls(false);
  };

  const handleExport = async () => {
    if (!audioFile) return;

    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('trimStart', trimStart.toString());
    formData.append('trimEnd', trimEnd.toString());
    formData.append('fadeIn', fadeIn.toString());
    formData.append('fadeOut', fadeOut.toString());
    formData.append('volume', volume.toString());

    try {
      const response = await fetch('/api/audio/edit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.mp3`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <>
      <SEO title="Audio Editor - Back2Life.Studio" />
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <main className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white text-center">Audio Editor</h1>

            {!audioFile ? (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-12">
                  <label className="flex flex-col items-center gap-4 cursor-pointer">
                    <div className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <Upload className="w-12 h-12 text-white" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-xl font-semibold text-white">Upload Audio File</p>
                      <p className="text-sm text-slate-400">MP3, WAV, M4A, OGG, FLAC</p>
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
            ) : (
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

                  <div className="relative">
                    <div ref={waveformRef} className="rounded-lg overflow-hidden" />
                    
                    {showTrimControls && (
                      <div 
                        className="absolute top-0 left-0 h-full bg-purple-500/20 pointer-events-none"
                        style={{
                          marginLeft: `${(trimStart / duration) * 100}%`,
                          width: `${((trimEnd - trimStart) / duration) * 100}%`
                        }}
                      />
                    )}

                    {showFadeControls && fadeIn > 0 && (
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500/30 to-transparent pointer-events-none"
                        style={{
                          marginLeft: `${(trimStart / duration) * 100}%`,
                          width: `${(fadeIn / duration) * 100}%`
                        }}
                      />
                    )}

                    {showFadeControls && fadeOut > 0 && (
                      <div 
                        className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-500/30 to-transparent pointer-events-none"
                        style={{
                          marginRight: `${(1 - trimEnd / duration) * 100}%`,
                          width: `${(fadeOut / duration) * 100}%`
                        }}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={togglePlayPause}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowTrimControls(!showTrimControls)}
                      className={`border-slate-600 ${
                        showTrimControls 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                          : 'text-slate-400 hover:bg-slate-700/50'
                      }`}
                    >
                      <Scissors className="w-4 h-4 mr-1" />
                      Trim
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowFadeControls(!showFadeControls)}
                      className={`border-slate-600 ${
                        showFadeControls 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                          : 'text-slate-400 hover:bg-slate-700/50'
                      }`}
                    >
                      <Music className="w-4 h-4 mr-1" />
                      Fade
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="border-slate-600 text-slate-400 hover:bg-slate-700/50"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {showTrimControls && (
                    <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Trim Range</span>
                        <span className="text-slate-400 font-mono">
                          {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
                        </span>
                      </div>
                      <div className="relative h-10">
                        <input
                          type="range"
                          min="0"
                          max={duration}
                          step="0.1"
                          value={trimStart}
                          onChange={(e) => {
                            const newStart = parseFloat(e.target.value);
                            if (newStart < trimEnd - 0.5) {
                              setTrimStart(newStart);
                            }
                          }}
                          className="absolute w-full slider-start"
                          style={{ zIndex: 3 }}
                        />
                        <input
                          type="range"
                          min="0"
                          max={duration}
                          step="0.1"
                          value={trimEnd}
                          onChange={(e) => {
                            const newEnd = parseFloat(e.target.value);
                            if (newEnd > trimStart + 0.5) {
                              setTrimEnd(newEnd);
                            }
                          }}
                          className="absolute w-full slider-end"
                          style={{ zIndex: 2 }}
                        />
                        <div className="absolute w-full h-2 bg-slate-700 rounded-full top-4">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{
                              marginLeft: `${(trimStart / duration) * 100}%`,
                              width: `${((trimEnd - trimStart) / duration) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

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
                            className="w-full slider-fade-in"
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
                            className="w-full slider-fade-out"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">Volume</span>
                      </div>
                      <span className="text-purple-400 font-mono">
                        {volume > 0 ? '+' : ''}{volume.toFixed(1)} dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-60"
                      max="12"
                      step="0.5"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full slider-volume"
                    />
                  </div>

                  <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Save As</label>
                      <div className="flex gap-2">
                        <Input
                          value={filename}
                          onChange={(e) => setFilename(e.target.value)}
                          className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                        />
                        <span className="flex items-center px-3 bg-slate-700/50 border border-slate-600 rounded-md text-slate-400 text-sm">
                          .mp3
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={handleExport}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Audio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        input[type="range"]::-webkit-slider-runnable-track {
          background: transparent;
          height: 8px;
        }
        
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 8px;
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
          margin-top: -6px;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #1e293b;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
        }

        .slider-start::-webkit-slider-thumb {
          z-index: 3;
        }

        .slider-end::-webkit-slider-thumb {
          z-index: 2;
        }
      `}</style>
    </>
  );
}