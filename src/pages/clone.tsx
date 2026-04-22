import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Mic, Download, Loader2, Sparkles, CheckCircle2, AlertCircle, Wand2, X } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:5000";
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

export default function VoiceCloner() {
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceUrl, setReferenceUrl] = useState<string>("");
  const [text, setText] = useState<string>("");
  
  const [isCloning, setIsCloning] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setReferenceFile(file);
      const url = URL.createObjectURL(file);
      setReferenceUrl(url);
      setError("");
      setSuccess("");
      setClonedAudioUrl("");
    } else {
      setError("Please select a valid audio file");
    }
  };

  const handleEnhancePrompt = async () => {
    if (!text.trim()) {
      setError("Please enter some text first");
      return;
    }

    if (!OPENAI_API_KEY) {
      setError("OpenAI API key not configured. Add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file");
      return;
    }

    setIsEnhancing(true);
    setError("");

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a voice cloning script writer. Enhance the user's text to make it more natural, expressive, and suitable for voice synthesis. Keep the core message but improve flow, emotion, and clarity. Return ONLY the enhanced text, no explanations."
            },
            {
              role: "user",
              content: text
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance text");
      }

      const data = await response.json();
      const enhancedText = data.choices[0]?.message?.content || text;
      setText(enhancedText);
      setSuccess("Text enhanced successfully!");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Enhance error:", err);
      setError("Failed to enhance text. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleClone = async () => {
    if (!referenceFile) {
      setError("Please upload a reference audio file first");
      return;
    }

    if (!text.trim()) {
      setError("Please enter the text you want to speak");
      return;
    }

    setIsCloning(true);
    setError("");
    setSuccess("");
    setProgress(10);
    setClonedAudioUrl("");

    try {
      const formData = new FormData();
      formData.append("file", referenceFile);
      formData.append("text", text);

      setProgress(30);

      const response = await fetch(`${BACKEND_URL}/api/clone-voice`, {
        method: "POST",
        body: formData,
      });

      setProgress(60);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Voice cloning failed");
      }

      setProgress(80);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setClonedAudioUrl(url);

      setProgress(100);
      setSuccess("Voice cloned successfully! You can now download or play the audio.");
    } catch (err) {
      console.error("Clone error:", err);
      setError(err instanceof Error ? err.message : "Failed to clone voice. Please try again.");
      setProgress(0);
    } finally {
      setIsCloning(false);
    }
  };

  const handleDownload = () => {
    if (!clonedAudioUrl || !referenceFile) return;
    const a = document.createElement("a");
    a.href = clonedAudioUrl;
    a.download = `${referenceFile.name.split(".")[0]}_cloned.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setReferenceFile(null);
    setReferenceUrl("");
    setText("");
    setClonedAudioUrl("");
    setProgress(0);
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      <SEO
        title="AI Voice Cloner - Back2Life.Studio"
        description="Clone any voice with AI. Upload a reference recording and generate speech in that voice."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI Voice Cloner</h1>
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  Pro
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Clone any voice using AI. Upload a reference recording and generate speech in that voice.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left Column - Upload & Input */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>1. Upload Reference Audio</CardTitle>
                    <CardDescription>
                      Upload a clear voice sample (5-30 seconds recommended)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload reference audio
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP3, WAV, M4A (Max 10MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {referenceFile && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Mic className="w-8 h-8 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{referenceFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(referenceFile.size)}
                            </p>
                          </div>
                        </div>
                        
                        {referenceUrl && (
                          <Card className="bg-slate-800/50 border-slate-700/50">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-white">{referenceFile.name}</p>
                                  <p className="text-xs text-slate-400">
                                    {(referenceFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setReferenceFile(null);
                                    setReferenceUrl("");
                                  }}
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Remove
                                </Button>
                              </div>

                              {referenceUrl && (
                                <WaveformVisualizer audioUrl={referenceUrl} height={100} />
                              )}

                              <audio
                                ref={audioRef}
                                src={referenceUrl}
                                controls
                                className="w-full"
                              />
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {referenceFile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>2. Enter Text to Speak</CardTitle>
                      <CardDescription>
                        Type the text you want the cloned voice to say
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Text to Speak</Label>
                        <Textarea
                          placeholder="Enter the text you want to generate in the cloned voice..."
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          className="min-h-[120px] resize-none"
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">
                            {text.length} characters
                          </p>
                          <Button
                            onClick={handleEnhancePrompt}
                            disabled={isEnhancing || !text.trim()}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            {isEnhancing ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Enhancing...</>
                            ) : (
                              <><Wand2 className="w-3 h-3" /> Enhance Text</>
                            )}
                          </Button>
                        </div>
                      </div>

                      {isCloning && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Cloning voice...</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={handleClone}
                          disabled={isCloning || !text.trim()}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                        >
                          {isCloning ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cloning...</>
                          ) : (
                            <><Sparkles className="w-4 h-4 mr-2" /> Clone Voice</>
                          )}
                        </Button>
                        {!isCloning && (
                          <Button onClick={handleReset} variant="outline" size="icon">
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Results */}
              <div className="lg:col-span-3">
                <Card className="min-h-[400px] h-full">
                  <CardHeader>
                    <CardTitle>Cloned Voice Output</CardTitle>
                    <CardDescription>
                      {clonedAudioUrl 
                        ? "Your cloned voice is ready!" 
                        : "Your cloned audio will appear here"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!clonedAudioUrl && !isCloning && (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Mic className="w-12 h-12 mb-4 opacity-50" />
                        <p>Upload reference audio and enter text to clone voice</p>
                      </div>
                    )}

                    {isCloning && (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                        <p className="font-medium">Cloning voice with AI...</p>
                        <p className="text-sm text-muted-foreground">This may take a few moments</p>
                      </div>
                    )}

                    {clonedAudioUrl && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-purple-500/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Cloned Voice Ready</h3>
                              <p className="text-sm text-muted-foreground">AI-generated speech in your voice</p>
                            </div>
                          </div>
                          
                          <audio
                            src={clonedAudioUrl}
                            controls
                            className="w-full mb-4"
                          />

                          <Button
                            onClick={handleDownload}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Cloned Voice
                          </Button>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm">Generated Text:</h4>
                          <p className="text-sm text-muted-foreground">{text}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}