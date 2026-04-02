import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileAudio, Mic, Link as LinkIcon, Download, Loader2, AlertCircle, FileText, Square, Copy, Check } from "lucide-react";

type TranscriptionSource = "upload" | "record" | "url";
type ExportFormat = "txt" | "srt";

export default function Transcriber() {
  const [source, setSource] = useState<TranscriptionSource>("upload");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("txt");
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
        setError("Please select an audio or video file");
        return;
      }
      setAudioFile(file);
      setError("");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
        setAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "🎙️ Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (err) {
      console.error("Recording error:", err);
      setError("Could not access microphone. Please check permissions.");
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Please allow microphone access and try again",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "✅ Recording stopped",
        description: "Your recording is ready to transcribe",
      });
    }
  };

  const transcribeFile = async () => {
    if (!audioFile) {
      setError("Please select or record an audio file");
      return;
    }

    setIsTranscribing(true);
    setError("");
    setTranscript("");

    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      toast({
        title: "🎵 Processing audio...",
        description: "This may take 30-60 seconds",
      });

      const response = await fetch("/api/transcriber/file", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Unexpected non-JSON response from /api/transcriber/file:", text.substring(0, 200));
        throw new Error("Transcription service is currently unavailable. Please try again in a moment.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      setTranscript(data.text || "No transcription available");
      
      toast({
        title: "✅ Transcription complete!",
        description: `${data.text?.split(" ").length || 0} words transcribed`,
      });
    } catch (err) {
      console.error("Transcription error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to transcribe audio. Please try again.";
      setError(errorMsg);
      
      toast({
        variant: "destructive",
        title: "Transcription failed",
        description: errorMsg,
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const transcribeYouTube = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    setIsTranscribing(true);
    setError("");
    setTranscript("");

    try {
      toast({
        title: "🎬 Extracting audio from video...",
        description: "This may take a minute",
      });

      const response = await fetch("/api/transcriber/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Unexpected non-JSON response from /api/transcriber/url:", text.substring(0, 200));
        throw new Error("Transcription service is currently unavailable. Please try again in a moment.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      setTranscript(data.text || "No transcription available");
      
      toast({
        title: "✅ Transcription complete!",
        description: `${data.text?.split(" ").length || 0} words transcribed`,
      });
    } catch (err) {
      console.error("YouTube transcription error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to transcribe video. Please try again.";
      setError(errorMsg);
      
      toast({
        variant: "destructive",
        title: "Transcription failed",
        description: errorMsg,
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!transcript) return;
    
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      toast({
        title: "✅ Copied to clipboard",
        description: "Transcript copied successfully",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try again",
      });
    }
  };

  const downloadTranscript = () => {
    if (!transcript) return;

    let content = transcript;
    let filename = `transcript-${Date.now()}`;
    let mimeType = "text/plain";

    if (exportFormat === "srt") {
      content = "1\n00:00:00,000 --> 00:00:10,000\n" + transcript;
      filename += ".srt";
      mimeType = "application/x-subrip";
    } else {
      filename += ".txt";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "✅ Download started",
      description: `Saved as ${filename}`,
    });
  };

  return (
    <>
      <SEO
        title="AI Transcriber - Convert Speech to Text | Back2Life.Studio"
        description="Free AI transcription tool. Upload audio/video, record from mic, or transcribe YouTube videos. Supports 50+ languages."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">AI Transcriber</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Convert speech to text with AI. Upload audio/video, record from mic, or transcribe YouTube videos.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Audio Source</CardTitle>
                  <CardDescription>
                    Choose how to provide audio for transcription
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs value={source} onValueChange={(v) => setSource(v as TranscriptionSource)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="upload">
                        <FileAudio className="w-4 h-4 mr-2" />
                        Upload
                      </TabsTrigger>
                      <TabsTrigger value="record">
                        <Mic className="w-4 h-4 mr-2" />
                        Record
                      </TabsTrigger>
                      <TabsTrigger value="url">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        YouTube
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*,video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          size="lg"
                          className="w-full h-32 border-dashed"
                        >
                          <div className="text-center">
                            <FileAudio className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              {audioFile ? audioFile.name : "Click to select audio/video file"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              MP3, WAV, MP4, MOV, etc. (max 25MB)
                            </p>
                          </div>
                        </Button>
                      </div>
                      <Button
                        onClick={transcribeFile}
                        disabled={!audioFile || isTranscribing}
                        size="lg"
                        className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90"
                      >
                        {isTranscribing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Transcribing...
                          </>
                        ) : (
                          <>
                            <FileText className="w-5 h-5 mr-2" />
                            Transcribe File
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="record" className="space-y-4 mt-4">
                      <div className="text-center space-y-4">
                        {!isRecording && !audioFile && (
                          <Button
                            onClick={startRecording}
                            size="lg"
                            className="w-full h-32 bg-gradient-to-r from-red-500 to-rose-500 hover:opacity-90"
                          >
                            <div className="text-center">
                              <Mic className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm font-medium">Start Recording</p>
                            </div>
                          </Button>
                        )}
                        {isRecording && (
                          <Button
                            onClick={stopRecording}
                            size="lg"
                            variant="destructive"
                            className="w-full h-32"
                          >
                            <div className="text-center">
                              <Square className="w-8 h-8 mx-auto mb-2" />
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                <p className="text-sm font-medium">Stop Recording</p>
                              </div>
                            </div>
                          </Button>
                        )}
                        {audioFile && !isRecording && (
                          <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-sm font-medium">Recording saved: {audioFile.name}</p>
                            </div>
                            <Button
                              onClick={transcribeFile}
                              disabled={isTranscribing}
                              size="lg"
                              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90"
                            >
                              {isTranscribing ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Transcribing...
                                </>
                              ) : (
                                <>
                                  <FileText className="w-5 h-5 mr-2" />
                                  Transcribe Recording
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">YouTube URL</label>
                        <Input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && !isTranscribing && transcribeYouTube()}
                        />
                      </div>
                      <Button
                        onClick={transcribeYouTube}
                        disabled={!youtubeUrl.trim() || isTranscribing}
                        size="lg"
                        className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90"
                      >
                        {isTranscribing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Transcribing...
                          </>
                        ) : (
                          <>
                            <FileText className="w-5 h-5 mr-2" />
                            Transcribe YouTube Video
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  </Tabs>

                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Error</p>
                        <p className="text-sm text-destructive/80 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Why people use this tool:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Fast AI transcription in 50+ languages</li>
                      <li>Works with audio/video files, mic recordings and YouTube links</li>
                      <li>Cloud-based processing – no app install required</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Transcript Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Transcript</CardTitle>
                  <CardDescription>
                    Your transcribed text will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!transcript && !isTranscribing && (
                    <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No transcript yet</p>
                        <p className="text-xs mt-1">Select an audio source to begin</p>
                      </div>
                    </div>
                  )}

                  {isTranscribing && (
                    <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
                        <p className="text-sm font-medium">Transcribing audio...</p>
                        <p className="text-xs text-muted-foreground mt-1">This may take 30-60 seconds</p>
                      </div>
                    </div>
                  )}

                  {transcript && (
                    <>
                      <Textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        className="min-h-[300px] resize-none font-mono text-sm"
                        placeholder="Transcript will appear here..."
                      />

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={copyToClipboard}
                            variant="outline"
                            size="lg"
                            className="flex-1"
                          >
                            {copied ? (
                              <>
                                <Check className="w-5 h-5 mr-2 text-green-500" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-5 h-5 mr-2" />
                                Copy Text
                              </>
                            )}
                          </Button>
                          
                          <Select
                            value={exportFormat}
                            onValueChange={(v) => setExportFormat(v as ExportFormat)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="txt">TXT</SelectItem>
                              <SelectItem value="srt">SRT</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            onClick={downloadTranscript}
                            size="lg"
                            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download
                          </Button>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">
                            💡 You can edit the transcript before downloading or copying
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}