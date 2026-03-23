import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageIcon, Upload, Loader2, AlertCircle, Copy, Download, Sparkles, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type OutputFormat = "text" | "json";
type ModelTier = "free" | "pro";

interface JSONPrompt {
  subject: string;
  style: string;
  lighting: string;
  colors: string[];
  mood: string;
  composition: string;
  quality: string;
  technical_details: string;
}

export default function ImageToPrompt() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("text");
  const [modelTier, setModelTier] = useState<ModelTier>("free");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [textPrompt, setTextPrompt] = useState("");
  const [jsonPrompt, setJsonPrompt] = useState<JSONPrompt | null>(null);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setSelectedImage(file);
    setError("");
    setTextPrompt("");
    setJsonPrompt(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const analyzeImageFree = async () => {
    if (!selectedImage) return;

    const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
    if (!HF_TOKEN) {
      setError("HuggingFace API token not configured. Please add NEXT_PUBLIC_HF_TOKEN to your environment variables.");
      return;
    }

    try {
      // Use BLIP-2 for image captioning
      const response = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
          },
          body: selectedImage,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      const caption = result[0]?.generated_text || "No description generated";

      if (outputFormat === "text") {
        // Enhance the caption into a proper prompt
        const enhancedPrompt = `${caption}, highly detailed, professional photography, 8k resolution, sharp focus, vibrant colors, professional lighting`;
        setTextPrompt(enhancedPrompt);
      } else {
        // Parse caption into JSON structure
        const words = caption.toLowerCase().split(" ");
        const jsonOutput: JSONPrompt = {
          subject: caption,
          style: "photorealistic",
          lighting: words.some(w => ["sunset", "sunrise", "golden"].includes(w)) ? "golden hour" : "natural lighting",
          colors: words.filter(w => ["red", "blue", "green", "yellow", "orange", "purple", "pink"].includes(w)),
          mood: "professional, high quality",
          composition: "centered, balanced",
          quality: "8k, highly detailed, sharp focus",
          technical_details: "professional photography, vibrant colors",
        };
        setJsonPrompt(jsonOutput);
      }
    } catch (err) {
      console.error("Free analysis error:", err);
      throw err;
    }
  };

  const analyzeImagePro = async () => {
    if (!selectedImage) return;

    const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      setError("OpenAI API key not configured for Pro features. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.");
      return;
    }

    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedImage);
      });

      const systemPrompt = outputFormat === "text"
        ? "Analyze this image and generate a detailed, professional AI image generation prompt that could recreate it. Include subject, style, lighting, mood, composition, and technical details. Be specific and descriptive."
        : `Analyze this image and return ONLY a valid JSON object with these exact keys: subject, style, lighting, colors (array), mood, composition, quality, technical_details. No additional text, just the JSON object.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: systemPrompt },
                { type: "image_url", image_url: { url: base64 } },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Pro analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content || "";

      if (outputFormat === "text") {
        setTextPrompt(content.trim());
      } else {
        try {
          const parsed = JSON.parse(content);
          setJsonPrompt(parsed);
        } catch {
          throw new Error("Failed to parse JSON response from GPT-4");
        }
      }
    } catch (err) {
      console.error("Pro analysis error:", err);
      throw err;
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setTextPrompt("");
    setJsonPrompt(null);

    try {
      if (modelTier === "free") {
        await analyzeImageFree();
      } else {
        await analyzeImagePro();
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async () => {
    const content = outputFormat === "text" ? textPrompt : JSON.stringify(jsonPrompt, null, 2);
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please select and copy manually",
        variant: "destructive",
      });
    }
  };

  const downloadPrompt = () => {
    const content = outputFormat === "text" ? textPrompt : JSON.stringify(jsonPrompt, null, 2);
    if (!content) return;

    const extension = outputFormat === "text" ? "txt" : "json";
    const blob = new Blob([content], { type: `text/${extension}` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prompt-${Date.now()}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEO
        title="Image to Prompt - Back2Life.Studio"
        description="Reverse engineer images into AI prompts. Upload any image and get detailed text prompts or structured JSON output."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Image to Prompt</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Reverse engineer images into AI prompts. Upload any image and get detailed text prompts or structured JSON output.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Upload Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Image</CardTitle>
                  <CardDescription>
                    Select an image to analyze and generate prompts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Upload */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    
                    {!imagePreview ? (
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="lg"
                        className="w-full h-64 border-dashed"
                      >
                        <div className="text-center">
                          <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm font-medium">Click to upload or drag & drop</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            PNG, JPG, WebP (max 10MB)
                          </p>
                        </div>
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden border">
                          <img
                            src={imagePreview}
                            alt="Selected"
                            className="w-full h-auto max-h-64 object-contain"
                          />
                        </div>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change Image
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    {/* Model Tier */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                        <Label>Pro Mode (GPT-4 Vision)</Label>
                        <p className="text-xs text-muted-foreground">
                          Higher quality analysis
                        </p>
                      </div>
                      <Switch
                        checked={modelTier === "pro"}
                        onCheckedChange={(checked) => setModelTier(checked ? "pro" : "free")}
                      />
                    </div>

                    {/* Output Format */}
                    <Tabs value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Text Prompt
                        </TabsTrigger>
                        <TabsTrigger value="json">
                          <Code className="w-4 h-4 mr-2" />
                          JSON Format
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Analyze Button */}
                  <Button
                    onClick={handleAnalyze}
                    disabled={!selectedImage || isAnalyzing}
                    size="lg"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 h-14 text-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyze Image
                      </>
                    )}
                  </Button>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Error</p>
                        <p className="text-sm text-destructive/80 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">How it works:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Free: BLIP-2 image captioning model</li>
                      <li>Pro: GPT-4 Vision for detailed analysis</li>
                      <li>Text: Natural language prompt</li>
                      <li>JSON: Structured metadata format</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Generated Prompt</CardTitle>
                  <CardDescription>
                    Your AI-generated prompt will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!textPrompt && !jsonPrompt && !isAnalyzing && (
                    <div className="h-[400px] bg-muted/50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No prompt generated yet</p>
                        <p className="text-xs mt-1">Upload an image and click analyze</p>
                      </div>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="h-[400px] bg-muted/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
                        <p className="text-sm font-medium">Analyzing your image...</p>
                        <p className="text-xs text-muted-foreground mt-1">This may take 5-15 seconds</p>
                      </div>
                    </div>
                  )}

                  {(textPrompt || jsonPrompt) && (
                    <div className="space-y-4">
                      {outputFormat === "text" ? (
                        <Textarea
                          value={textPrompt}
                          onChange={(e) => setTextPrompt(e.target.value)}
                          className="min-h-[320px] resize-none font-mono text-sm"
                          placeholder="Generated prompt will appear here..."
                        />
                      ) : (
                        <Textarea
                          value={JSON.stringify(jsonPrompt, null, 2)}
                          onChange={(e) => {
                            try {
                              setJsonPrompt(JSON.parse(e.target.value));
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                          className="min-h-[320px] resize-none font-mono text-xs"
                          placeholder="JSON output will appear here..."
                        />
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={copyToClipboard}
                          variant="outline"
                          size="lg"
                          className="flex-1"
                        >
                          <Copy className="w-5 h-5 mr-2" />
                          Copy
                        </Button>
                        <Button
                          onClick={downloadPrompt}
                          size="lg"
                          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download
                        </Button>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground">
                          💡 You can edit the {outputFormat === "text" ? "prompt" : "JSON"} before copying or downloading
                        </p>
                      </div>
                    </div>
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