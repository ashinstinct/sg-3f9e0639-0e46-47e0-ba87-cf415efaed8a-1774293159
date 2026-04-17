import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, Download, Upload, X, RotateCcw, Scissors, Music, Repeat } from "lucide-react";

export default function AudioEditorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [volume, setVolume] = useState(0); // dB scale
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [showTrimControls, setShowTrimControls] = useState(false);
  const [showFadeControls, setShowFadeControls] = useState(false);
  const [filename, setFilename] = useState("");

  const wavesurferRef = useRef<any>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const scriptLoadedRef = useRef(false);

  // dB to gain conversion
  const dbToGain = (db: number) => Math.pow(10, db / 20);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setFilename(file.name.replace(/\.[^/.]+$/, ""));
      setTrimStart(0);
      setFadeIn(0);
      setFadeOut(0);
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
        // Create AudioContext and GainNode for volume control
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (!gainNodeRef.current && audioContextRef.current) {
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

        // Connect WaveSurfer to our gain node
        ws.load(audioUrl);
        
        ws.on('ready', () => {
          const dur = ws.getDuration();
          setDuration(dur);
          setTrimEnd(dur);
          
          // Connect audio pipeline: WaveSurfer -> GainNode -> Destination
          if (gainNodeRef.current && ws.backend && ws.backend.ac) {
            try {
              ws.backend.setFilter(gainNodeRef.current);
            } catch (e) {
              console.log('Filter connection handled by WaveSurfer');
            }
          }
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

        // Apply fade effects during playback
        ws.on('audioprocess', (currentTime: number) => {
          if (!gainNodeRef.current) return;
          
          const relativeTime = currentTime - trimStart;
          const trimmedDuration = trimEnd - trimStart;
          let gain = dbToGain(volume);

          // Apply fade in
          if (fadeIn > 0 && relativeTime < fadeIn) {
            const fadeGain = relativeTime / fadeIn;
            gain *= fadeGain;
          }

          // Apply fade out
          if (fadeOut > 0 && relativeTime > trimmedDuration - fadeOut) {
            const timeLeftInFade = trimmedDuration - relativeTime;
            const fadeGain = timeLeftInFade / fadeOut;
            gain *= fadeGain;
          }

          // Apply volume smoothly
          gainNodeRef.current.gain.setValueAtTime(gain, audioContextRef.current!.currentTime);
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

  // Update volume when slider changes
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      try {
        const gain = dbToGain(volume);
        gainNodeRef.current.gain.setValueAtTime(gain, audioContextRef.current.currentTime);
      } catch (error) {
        console.error('Volume update error:', error);
      }
    }
  }, [volume]);

  // Update loop handling
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.un('finish');
      wavesurferRef.current.on('finish', () => {
        if (isLooping) {
          wavesurferRef.current.setTime(trimStart);
          wavesurferRef.current.play();
        } else {
          setIsPlaying(false);
        }
      });
    }
  }, [isLooping, trimStart]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        if (wavesurferRef.current.getCurrentTime() < trimStart || wavesurferRef.current.getCurrentTime() > trimEnd) {
          wavesurferRef.current.setTime(trimStart);
        }
        wavesurferRef.current.play();
      }
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
      const response = await fetch('/api/audio-edit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <>
      <SEO 
        title="Audio Editor - Back2Life.Studio"
        description="Edit audio files with trim, fade, and volume controls"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white text-center">Audio Editor</h1>

            {!audioFile ? (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-12">
                  <label className="flex flex-col items-center gap-4 cursor-pointer group">
                    <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-white" />
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
                          if (audioContextRef.current) {
                            audioContextRef.current.close();
                            audioContextRef.current = null;
                          }
                          gainNodeRef.current = null;
                        }}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <div ref={waveformRef} />
                    
                    {/* Fade In Overlay */}
                    {showFadeControls && fadeIn > 0 && (
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500/30 to-transparent pointer-events-none"
                        style={{ width: `${(fadeIn / duration) * 100}%` }}
                      />
                    )}
                    
                    {/* Fade Out Overlay */}
                    {showFadeControls && fadeOut > 0 && (
                      <div 
                        className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-500/30 to-transparent pointer-events-none"
                        style={{ width: `${(fadeOut / duration) * 100}%` }}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      onClick={togglePlay}
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
                      <span className="text-xs">Trim</span>
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
                      <span className="text-xs">Fade</span>
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
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-400">Start</Label>
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
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-400">End</Label>
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
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {showFadeControls && (
                    <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-slate-400">Fade In</Label>
                          <span className="text-xs text-slate-500 font-mono">{fadeIn.toFixed(1)}s</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={fadeIn}
                          onChange={(e) => setFadeIn(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-slate-400">Fade Out</Label>
                          <span className="text-xs text-slate-500 font-mono">{fadeOut.toFixed(1)}s</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={fadeOut}
                          onChange={(e) => setFadeOut(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-slate-300">Volume</Label>
                      <span className="text-sm text-slate-400 font-mono">
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
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                    <Label className="text-sm text-slate-300">Save As</Label>
                    <div className="flex gap-2">
                      <Input
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        className="flex-1 bg-slate-900/50 border-slate-700 text-white"
                        placeholder="filename"
                      />
                      <span className="flex items-center text-slate-400 text-sm">.mp3</span>
                    </div>
                    <Button
                      onClick={handleExport}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
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
          height: 8px;
          background: rgb(51, 65, 85);
          border-radius: 4px;
          outline: none;
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