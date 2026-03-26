import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Pause, Play, Download, Loader2 } from "lucide-react";

export default function RecordVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize audio monitoring
  useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        microphone.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        monitorAudioLevel();
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    initAudio();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
      }
      animationRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const startRecording = async () => {
    try {
      if (!streamRef.current) return;

      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Transcribe the audio
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Start live transcription every 5 seconds
      startLiveTranscription();
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const startLiveTranscription = () => {
    const transcribeInterval = setInterval(async () => {
      if (!isRecording || chunksRef.current.length === 0) {
        clearInterval(transcribeInterval);
        return;
      }

      const recentChunks = chunksRef.current.slice(-5);
      const blob = new Blob(recentChunks, { type: "audio/webm" });
      await transcribeAudio(blob, true);
    }, 5000);
  };

  const transcribeAudio = async (audioBlob: Blob, isLive = false) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-base",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_HF_TOKEN || ""}`,
          },
          body: audioBlob,
        }
      );

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const result = await response.json();
      const text = result.text || "";

      if (isLive) {
        setTranscript(prev => prev + " " + text);
      } else {
        setTranscript(text);
      }
    } catch (err) {
      console.error("Transcription error:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const downloadRecording = () => {
    if (audioURL) {
      const a = document.createElement("a");
      a.href = audioURL;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
    }
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <SEO
        title="Voice Recorder | Back2Life.Studio"
        description="Professional voice recorder with live transcription powered by Whisper AI"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        {/* Animated background particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse top-20 -left-20" />
          <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse bottom-20 -right-20" />
        </div>

        <Navigation />

        <main className="relative container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Voice Recorder
              </h1>
              <p className="text-gray-400 text-lg">
                Record with live transcription powered by Whisper AI
              </p>
            </div>

            {/* Main Recording Interface */}
            <Card className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-8">
              {/* Glassmorphic overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />

              <div className="relative space-y-8">
                {/* Circular Visualizer */}
                <div className="flex justify-center">
                  <div className="relative w-64 h-64">
                    {/* Background circle */}
                    <div className="absolute inset-0 rounded-full border-2 border-slate-800/50" />
                    
                    {/* Audio level ring */}
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#audioGradient)"
                        strokeWidth="4"
                        strokeDasharray={`${audioLevel * 283} 283`}
                        className="transition-all duration-100"
                        style={{ filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))" }}
                      />
                      <defs>
                        <linearGradient id="audioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        isRecording 
                          ? "bg-gradient-to-br from-red-500 to-pink-500 animate-pulse" 
                          : "bg-gradient-to-br from-indigo-500 to-purple-500"
                      }`}>
                        <Mic className="w-10 h-10 text-white" />
                      </div>
                      <div className="mt-4 text-center">
                        <div className="text-3xl font-bold text-white font-mono">
                          {formatTime(duration)}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {isRecording ? (isPaused ? "PAUSED" : "RECORDING") : "READY"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audio Level Bars */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Audio Level</span>
                    <span>{Math.round(audioLevel * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-100 rounded-full"
                      style={{ 
                        width: `${audioLevel * 100}%`,
                        boxShadow: audioLevel > 0.5 ? "0 0 10px rgba(16, 185, 129, 0.5)" : "none"
                      }}
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center gap-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="w-32 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Record
                    </Button>
                  ) : (
                    <>
                      {!isPaused ? (
                        <Button
                          onClick={pauseRecording}
                          size="lg"
                          variant="outline"
                          className="w-32 border-slate-700"
                        >
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          onClick={resumeRecording}
                          size="lg"
                          className="w-32 bg-gradient-to-r from-green-600 to-emerald-600"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Resume
                        </Button>
                      )}
                      <Button
                        onClick={stopRecording}
                        size="lg"
                        variant="destructive"
                        className="w-32"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>

                {/* Recorded Audio Player */}
                {audioURL && (
                  <div className="space-y-4 pt-8 border-t border-slate-800/50">
                    <h3 className="text-lg font-semibold text-white">Recording Complete</h3>
                    <audio src={audioURL} controls className="w-full" />
                    <Button
                      onClick={downloadRecording}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Recording
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Live Transcription */}
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    Live Transcription
                    {isTranscribing && (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    )}
                  </h3>
                  {transcript && (
                    <Button
                      onClick={downloadTranscript}
                      size="sm"
                      variant="outline"
                      className="border-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Text
                    </Button>
                  )}
                </div>
                <div className="min-h-[120px] p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                  {transcript ? (
                    <p className="text-gray-300 leading-relaxed">{transcript}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      {isRecording 
                        ? "Transcribing your voice..." 
                        : "Start recording to see live transcription"}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: "🎯", title: "Real-Time Levels", desc: "Live audio monitoring" },
                { icon: "🤖", title: "AI Transcription", desc: "Powered by Whisper" },
                { icon: "💾", title: "Instant Download", desc: "Audio + transcript" }
              ].map((feature, i) => (
                <Card key={i} className="bg-slate-900/30 backdrop-blur-xl border-slate-800/50 p-4 text-center">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}