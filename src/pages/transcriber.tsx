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
import { FileAudio, Mic, Link as LinkIcon, Download, Loader2, AlertCircle, FileText, Square } from "lucide-react";

type TranscriptionSource = "upload" | "record" | "url";
type ExportFormat = "txt" | "srt";

export default function Transcriber() {
  const [source, setSource] = useState<TranscriptionSource>("upload");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("txt");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
    } catch (err) {
      console.error("Recording error:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeFile = async () => {
    if (!audioFile) {
      setError("Please select or record an audio file");
      return;
    }

    const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
    if (!HF_TOKEN) {
      setError("HuggingFace API token not configured. Please add NEXT_PUBLIC_HF_TOKEN to your environment variables.");
      return;
    }

    setIsTranscribing(true);
    setError("");
    setTranscript("");

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
          },
          body: audioFile,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();
      setTranscript(result.text || "No transcription available");
    } catch (err) {
      console.error("Transcription error:", err);
      setError(err instanceof Error ? err.message : "Failed to transcribe audio. Please try again.");
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
      // Step 1: Extract audio using cobalt.tools
      const cobaltResponse = await fetch("https://api.cobalt.tools/api/json", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: youtubeUrl.trim(),
          downloadMode: "audio",
        }),
      });

      const cobaltData = await cobaltResponse.json();

      if (cobaltData.status === "error" || cobaltData.error) {
        throw new Error(cobaltData.text || "Failed to extract audio from YouTube");
      }

      const audioUrl = cobaltData.url;
      if (!audioUrl) {
        throw new Error("No audio URL received from cobalt.tools");
      }

      // Step 2: Download audio
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();

      // Step 3: Transcribe with Whisper
      const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
      if (!HF_TOKEN) {
        throw new Error("HuggingFace API token not configured");
      }

      const whisperResponse = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
          },
          body: audioBlob,
        }
      );

      if (!whisperResponse.ok) {
        const errorData = await whisperResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Transcription failed");
      }

      const result = await whisperResponse.json();
      setTranscript(result.text || "No transcription available");
    } catch (err) {
      console.error("YouTube transcription error:", err);
      setError(err instanceof Error ? err.message : "Failed to transcribe YouTube video. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const downloadTranscript = () => {
    if (!transcript) return;

    let content = transcript;
    let filename = `transcript-${Date.now()}`;
    let mimeType = "text/plain";

    if (exportFormat === "srt") {
      // Simple SRT format (no timestamps from Whisper basic response)
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
  };

  return (
    <>
      <SEO
        title="AI Transcriber - Back2Life.Studio"
        description="Convert speech to text with AI. Upload audio/video, record from mic, or transcribe YouTube videos."
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
                              MP3, WAV, MP4, MOV, etc.
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
                    <p className="text-sm font-medium">Powered by:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>OpenAI Whisper (Large v3) for transcription</li>
                      <li>cobalt.tools for YouTube audio extraction</li>
                      <li>Supports 50+ languages automatically</li>
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
                            className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download Transcript
                          </Button>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">
                            💡 You can edit the transcript before downloading
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