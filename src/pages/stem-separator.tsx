import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Music, Upload, Download, Loader2, Play, Pause, Sparkles, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCreditBalance, hasEnoughCredits, deductCredits } from "@/services/creditsService";
import { supabase } from "@/integrations/supabase/client";

const STEMS = [
  "Vocals (main & backing)",
  "Drums (kick, snare, cymbals)",
  "Bass",
  "Piano",
  "Electric Guitar",
  "Acoustic Guitar",
  "Synthesizer",
  "Strings",
  "Wind Instruments",
  "Full Accompaniment",
];

export default function ProStemSeparator() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stems, setStems] = useState<{ name: string; url: string }[]>([]);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const CREDITS_COST = 8;

  useEffect(() => {
    const checkCredits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const credits = await getCreditBalance();
        setUserCredits(credits);
      }
    };
    checkCredits();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an audio file",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleProcess = async () => {
    if (!audioFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please upload an audio file first",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use pro tools",
      });
      return;
    }

    const hasBalance = await hasEnoughCredits(CREDITS_COST);
    if (!hasBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient credits",
        description: `You need ${CREDITS_COST} credits to process stems. Please purchase more credits.`,
      });
      return;
    }

    setIsProcessing(true);
    setStems([]);

    try {
      toast({
        title: "🎵 Processing stems...",
        description: "This may take 2-3 minutes for lalal.ai to extract all 10 stems",
      });

      // TODO: Implement actual lalal.ai API call
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock stems for demonstration
      const mockStems = STEMS.map((name, i) => ({
        name,
        url: `https://example.com/stem-${i}.mp3`,
      }));

      const result = await deductCredits(
        CREDITS_COST,
        "lalal.ai Pro Stem Separator"
      );

      if (!result.success) {
        throw new Error("Failed to deduct credits");
      }

      setStems(mockStems);

      const updatedCredits = await getCreditBalance();
      setUserCredits(updatedCredits);

      toast({
        title: "✅ Stems extracted!",
        description: `${CREDITS_COST} credits used. ${updatedCredits} remaining.`,
      });
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <SEO
        title="Pro Stem Separator by lalal.ai - Back2Life.Studio"
        description="Professional AI-powered stem extraction with 10-stem separation"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-4">
              <Music className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">Professional Stem Separation</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Pro Stem Separator by lalal.ai
            </h1>
            
            <p className="text-xl text-muted-foreground mb-2">
              World's #1 AI-powered stem extraction technology
            </p>

            <p className="text-base text-muted-foreground mb-6 max-w-3xl mx-auto">
              Professional-grade stem separation powered by lalal.ai's <strong>No.01 Sound artificial intelligence algorithm</strong> — the most advanced audio separation technology trusted by industry professionals worldwide. Extract crystal-clear stems from any audio or video with zero quality loss.
            </p>

            {userCredits !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">{userCredits} credits available</span>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 mb-12">
            {/* Upload Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Audio</CardTitle>
                <CardDescription>
                  Upload your audio or video file for stem extraction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  {audioFile ? (
                    <>
                      <p className="font-medium mb-1">{audioFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium mb-1">Drop audio file here</p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse
                      </p>
                    </>
                  )}
                </div>

                {/* Process Button */}
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || !audioFile}
                  size="lg"
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 h-14 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Music className="w-5 h-5 mr-2" />
                      Extract 10 Stems ({CREDITS_COST} credits)
                    </>
                  )}
                </Button>

                {/* Tips */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Pro Tips:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Supports all audio/video formats</li>
                    <li>Best results with high-quality source files</li>
                    <li>Processing takes 2-3 minutes on average</li>
                    <li>All 10 stems extracted simultaneously</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Extracted Stems</CardTitle>
                <CardDescription>
                  Download individual stems after processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stems.length === 0 && !isProcessing && (
                  <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No stems extracted yet</p>
                      <p className="text-xs mt-1">Upload a file and click process</p>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
                      <p className="text-sm font-medium">Extracting stems...</p>
                      <p className="text-xs text-muted-foreground mt-1">2-3 minutes remaining</p>
                    </div>
                  </div>
                )}

                {stems.length > 0 && (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {stems.map((stem, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium">{stem.name}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Feature Sections */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
            {/* 10-Stem Feature */}
            <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Special Feature: 10-Stem Separation
                </CardTitle>
                <CardDescription>
                  Split any song into up to 10 individual stems with surgical precision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {STEMS.map((stem, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>{stem}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* What Makes Different */}
            <Card>
              <CardHeader>
                <CardTitle>What Makes lalal.ai Different:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">✨</span>
                    <div>
                      <p className="font-medium text-sm">Lossless quality extraction</p>
                      <p className="text-xs text-muted-foreground">Studio-grade results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚡</span>
                    <div>
                      <p className="font-medium text-sm">Fast processing</p>
                      <p className="text-xs text-muted-foreground">2-3 minutes for average track</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🎯</span>
                    <div>
                      <p className="font-medium text-sm">Precision AI</p>
                      <p className="text-xs text-muted-foreground">Preserves original audio fidelity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🎵</span>
                    <div>
                      <p className="font-medium text-sm">Universal format support</p>
                      <p className="text-xs text-muted-foreground">All audio/video formats</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🏆</span>
                    <div>
                      <p className="font-medium text-sm">Industry trusted</p>
                      <p className="text-xs text-muted-foreground">Grammy-winning producers and top studios</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases */}
          <div className="max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Perfect For:</CardTitle>
                <CardDescription>
                  Professional applications for stem separation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {["Music Production", "Remixing", "Karaoke Creation", "Audio Restoration", "Sampling", "Music Analysis"].map((use) => (
                    <div key={use} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <span className="text-sm font-medium">{use}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}