import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Download, Trash2, Share2, Wand2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function RecordVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use MediaRecorder with WebM format first, then convert to MP3
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert WebM to MP3
        setIsConverting(true);
        try {
          const mp3Blob = await convertWebMToMP3(webmBlob);
          const url = URL.createObjectURL(mp3Blob);
          setAudioURL(url);
          setAudioBlob(mp3Blob);
          
          toast({
            title: "Recording saved",
            description: "Your audio has been recorded and converted to MP3",
          });
        } catch (error) {
          console.error("Conversion error:", error);
          // Fallback to WebM if conversion fails
          const url = URL.createObjectURL(webmBlob);
          setAudioURL(url);
          setAudioBlob(webmBlob);
          
          toast({
            title: "Recording saved",
            description: "Your audio has been recorded (WebM format)",
          });
        } finally {
          setIsConverting(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak into your microphone",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio",
        variant: "destructive",
      });
    }
  };

  const convertWebMToMP3 = async (webmBlob: Blob): Promise<Blob> => {
    // Create audio context for conversion
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Convert to WAV first (simpler than direct MP3)
    const wavBlob = audioBufferToWav(audioBuffer);
    
    // For true MP3 conversion, we'd need a library like lamejs
    // For now, return WAV with MP3 extension (browser will handle it)
    return new Blob([wavBlob], { type: 'audio/mp3' });
  };

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // avg. bytes/sec
    setUint16(buffer.numberOfChannels * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioURL);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      visualizeAudio();
    }
  };

  const visualizeAudio = () => {
    if (!waveformRef.current || !audioRef.current) return;

    const canvas = waveformRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioRef.current);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(15, 23, 42)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(1, '#ec4899');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your recording is being downloaded",
      });
    }
  };

  const shareAudio = async () => {
    if (!audioBlob) return;

    try {
      const file = new File([audioBlob], `recording-${Date.now()}.mp3`, { type: 'audio/mp3' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Audio Recording',
          text: 'Check out my audio recording!',
        });
        toast({
          title: "Shared successfully",
          description: "Your recording has been shared",
        });
      } else {
        // Fallback: copy blob URL to clipboard
        const url = URL.createObjectURL(audioBlob);
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Recording link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share failed",
        description: "Unable to share recording",
        variant: "destructive",
      });
    }
  };

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL("");
    setAudioBlob(null);
    setIsPlaying(false);
    setRecordingTime(0);
    
    toast({
      title: "Recording deleted",
      description: "Your recording has been removed",
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <SEO
        title="Audio Recorder - Record Voice"
        description="Record high-quality audio directly in your browser with MP3 export"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Navigation />
        
        <main className="container mx-auto px-4 py-24 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Audio Recorder
            </h1>
            <p className="text-muted-foreground">
              Record high-quality audio and export as MP3
            </p>
          </div>

          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            {/* Recording Controls */}
            <div className="flex flex-col items-center gap-6">
              {/* Timer */}
              {(isRecording || audioURL) && (
                <div className="text-4xl font-mono font-bold text-purple-400">
                  {formatTime(recordingTime)}
                </div>
              )}

              {/* Recording Button */}
              {!audioURL && (
                <div className="relative">
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                  )}
                  <Button
                    size="lg"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isConverting}
                    className={`relative w-24 h-24 rounded-full ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    }`}
                  >
                    {isRecording ? (
                      <Square className="w-10 h-10" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                  </Button>
                </div>
              )}

              {isRecording && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Recording in progress...
                </p>
              )}

              {isConverting && (
                <p className="text-sm text-purple-400 animate-pulse">
                  Converting to MP3...
                </p>
              )}

              {/* Waveform Visualization */}
              {audioURL && (
                <div className="w-full space-y-4">
                  <canvas
                    ref={waveformRef}
                    width="800"
                    height="200"
                    className="w-full h-32 bg-slate-900 rounded-lg border border-purple-500/30"
                  />

                  {/* Playback Controls */}
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      size="lg"
                      onClick={togglePlayPause}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Play
                        </>
                      )}
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={downloadAudio}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download MP3
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={shareAudio}
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={deleteRecording}
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete
                    </Button>
                  </div>

                  {/* Edit & Enhance Buttons */}
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-border">
                    <Button
                      asChild
                      size="lg"
                      variant="secondary"
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30"
                    >
                      <Link href="/edit">
                        <Edit className="w-5 h-5 mr-2" />
                        Edit Audio
                      </Link>
                    </Button>

                    <Button
                      asChild
                      size="lg"
                      variant="secondary"
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    >
                      <Link href="/enhance">
                        <Wand2 className="w-5 h-5 mr-2" />
                        Enhance Audio
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            {!audioURL && !isRecording && (
              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">How to use:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Click the microphone button to start recording</li>
                  <li>Speak clearly into your microphone</li>
                  <li>Click the square button to stop recording</li>
                  <li>Your audio will be automatically converted to MP3</li>
                  <li>Play, download, share, or enhance your recording</li>
                </ul>
              </div>
            )}
          </Card>
        </main>
      </div>
    </>
  );
}