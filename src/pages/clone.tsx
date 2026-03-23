import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Mic, Play, Pause, Download, Sparkles } from "lucide-react";

export default function VoiceCloner() {
  const [voiceSample, setVoiceSample] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [playingSample, setPlayingSample] = useState(false);
  const [playingCloned, setPlayingCloned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleAudioRef = useRef<HTMLAudioElement>(null);
  const clonedAudioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("audio/")) {
        setError("Please select an audio file");
        return;
      }
      
      // Check duration (should be 5-60 seconds for best results)
      const audio = new Audio(URL.createObjectURL(selectedFile));
      audio.onloadedmetadata = () => {
        if (audio.duration < 5) {
          setError("Voice sample should be at least 5 seconds long");
          return;
        }
        if (audio.duration > 120) {
          setError("Voice sample should be under 2 minutes for best results");
          return;
        }
        setVoiceSample(selectedFile);
        setError("");
        setClonedAudioUrl(null);
      };
    }
  };

  const processCloning = async () => {
    if (!voiceSample || !text.trim()) {
      setError("Please upload a voice sample and enter text to clone");
      return;
    }

    if (text.length < 10) {
      setError("Text should be at least 10 characters long");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError("");

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);

      // TODO: Implement E2-F5-TTS API call via Hugging Face Gradio
      // For now, show mock processing
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Mock result - in production, this would be the cloned voice audio
      setError("Backend API not yet configured. Free version requires E2-F5-TTS hosted on Hugging Face Space (Gradio REST API). Pro version will use Fish Audio API. The UI is ready - just needs the processing endpoint.");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice cloning failed");
    } finally {
      setProcessing(false);
    }
  };

  const toggleSamplePlay = () => {
    const audio = sampleAudioRef.current;
    if (!audio) return;
    
    if (playingSample) {
      audio.pause();
    } else {
      audio.play();
      if (clonedAudioRef.current) {
        clonedAudioRef.current.pause();
        setPlayingCloned(false);
      }
    }
    setPlayingSample(!playingSample);
  };

  const toggleClonedPlay = () => {
    const audio = clonedAudioRef.current;
    if (!audio) return;
    
    if (playingCloned) {
      audio.pause();
    } else {
      audio.play();
      if (sampleAudioRef.current) {
        sampleAudioRef.current.pause();
        setPlayingSample(false);
      }
    }
    setPlayingCloned(!playingCloned);
  };

  const downloadCloned = () => {
    if (!clonedAudioUrl) return;
    const a = document.createElement("a");
    a.href = clonedAudioUrl;
    a.download = "cloned_voice.wav";
    a.click();
  };

  return (
    <>
      <SEO 
        title="Voice Cloner - Back2Life.Studio"
        description="Clone any voice with AI and make it speak your custom text using advanced voice synthesis"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Voice Cloner
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload a voice sample and clone it to speak any text you want using AI voice synthesis
              </p>
            </div>

            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle>Step 1: Upload Voice Sample</CardTitle>
                <CardDescription>
                  Upload 5-60 seconds of clear speech for best cloning results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-500/30 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <p className="text-lg font-medium mb-2">
                    {voiceSample ? voiceSample.name : "Click to upload voice sample"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports MP3, WAV, M4A, OGG (5-60 seconds recommended)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {voiceSample && (
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mic className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Voice Sample Ready</span>
                      </div>
                      <Button
                        onClick={toggleSamplePlay}
                        variant="outline"
                        size="sm"
                      >
                        {playingSample ? (
                          <Pause className="w-4 h-4 mr-2" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        {playingSample ? "Pause" : "Play"}
                      </Button>
                      <audio
                        ref={sampleAudioRef}
                        src={voiceSample ? URL.createObjectURL(voiceSample) : ""}
                        onEnded={() => setPlayingSample(false)}
                      />
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle>Step 2: Enter Text to Clone</CardTitle>
                <CardDescription>
                  Type or paste the text you want the cloned voice to speak
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Textarea
                  placeholder="Enter the text you want the cloned voice to speak... (minimum 10 characters)"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-32 resize-none"
                  maxLength={1000}
                />
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{text.length} / 1000 characters</span>
                  {text.length > 0 && text.length < 10 && (
                    <span className="text-destructive">Minimum 10 characters required</span>
                  )}
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {voiceSample && text.length >= 10 && !processing && !clonedAudioUrl && (
                  <Button
                    onClick={processCloning}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Clone Voice
                  </Button>
                )}

                {processing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cloning voice...</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Analyzing voice patterns and synthesizing speech...
                    </p>
                  </div>
                )}

                {clonedAudioUrl && (
                  <div className="space-y-6">
                    <Tabs defaultValue="cloned" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="sample">Original Sample</TabsTrigger>
                        <TabsTrigger value="cloned">Cloned Voice</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="sample" className="space-y-4">
                        <Card className="bg-muted/30">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">Original Voice Sample</h3>
                              <Button
                                onClick={toggleSamplePlay}
                                variant="outline"
                                size="sm"
                              >
                                {playingSample ? (
                                  <Pause className="w-4 h-4 mr-2" />
                                ) : (
                                  <Play className="w-4 h-4 mr-2" />
                                )}
                                {playingSample ? "Pause" : "Play"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="cloned" className="space-y-4">
                        <Card className="bg-blue-500/5 border-blue-500/20">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-500" />
                                <h3 className="font-medium">Cloned Voice</h3>
                              </div>
                              <Button
                                onClick={toggleClonedPlay}
                                variant="outline"
                                size="sm"
                              >
                                {playingCloned ? (
                                  <Pause className="w-4 h-4 mr-2" />
                                ) : (
                                  <Play className="w-4 h-4 mr-2" />
                                )}
                                {playingCloned ? "Pause" : "Play"}
                              </Button>
                            </div>
                            <audio
                              ref={clonedAudioRef}
                              src={clonedAudioUrl}
                              onEnded={() => setPlayingCloned(false)}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    <Button
                      onClick={downloadCloned}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Cloned Voice
                    </Button>

                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">🎭 Text Spoken</h4>
                      <p className="text-sm text-muted-foreground">{text}</p>
                    </div>
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">💡 Tips for Best Results</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use 10-30 seconds of clear, high-quality speech</li>
                    <li>• Avoid background noise in the voice sample</li>
                    <li>• Single speaker works better than multiple voices</li>
                    <li>• Consistent tone and volume throughout sample</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">How it works</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Free version uses E2-F5-TTS (Hugging Face Gradio API)</li>
                <li>• Pro version uses Fish Audio API for higher quality</li>
                <li>• Processing typically takes 20-40 seconds</li>
                <li>• Supports multiple languages and accents</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}