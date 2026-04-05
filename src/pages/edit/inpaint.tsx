import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Loader2, Download, Eraser, RotateCcw, Check } from "lucide-react";
import { hasEnoughCredits, deductCredits } from "@/services/creditsService";

const CREDITS_COST = 3;

export default function InpaintPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [strength, setStrength] = useState(0.95);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [maskCanvas, setMaskCanvas] = useState<string>("");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushSize, setBrushSize] = useState(20);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setEditedImage(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // Initialize canvas for mask drawing
        setTimeout(() => initCanvas(reader.result as string), 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const initCanvas = (imgSrc: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = imgSrc;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== "mousedown") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearMask = () => {
    if (imagePreview) {
      initCanvas(imagePreview);
    }
  };

  const handleInpaint = async () => {
    if (!imageFile || !prompt.trim()) {
      setError("Please upload an image and provide a prompt");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Please draw a mask on the image");
      return;
    }

    const hasCredits = await hasEnoughCredits(CREDITS_COST);
    if (!hasCredits) {
      setError(`Insufficient credits. You need ${CREDITS_COST} credits for inpainting.`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert canvas to mask image
      const maskDataUrl = canvas.toDataURL("image/png");

      const response = await fetch("/api/fal/image-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "inpaint",
          imageUrl: imagePreview,
          maskUrl: maskDataUrl,
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          strength,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process image");
      }

      if (data.success && data.image) {
        await deductCredits(
          CREDITS_COST,
          "AI Inpainting",
          {
            operation: "inpaint",
            prompt: prompt.trim(),
          }
        );

        setEditedImage(data.image.url);
      } else {
        throw new Error("No output image received");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process image");
      console.error("Inpainting error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <SEO
        title="AI Inpainting - Remove & Replace Objects"
        description="Remove or replace objects in your images with AI-powered inpainting"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              AI Inpainting
            </h1>
            <p className="text-muted-foreground">
              Remove or replace objects by painting a mask and describing what you want
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Controls */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Upload Image</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Image
                    </Button>
                    {imageFile && (
                      <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {imageFile.name}
                      </span>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {imagePreview && (
                  <>
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Draw Mask</Label>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1">
                          <Label className="text-sm mb-2 block">Brush Size: {brushSize}px</Label>
                          <Slider
                            value={[brushSize]}
                            onValueChange={(val) => setBrushSize(val[0])}
                            min={5}
                            max={50}
                            step={5}
                            className="w-full"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearMask}
                          className="flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Clear
                        </Button>
                      </div>
                      <div className="border rounded-lg overflow-hidden bg-muted/20">
                        <canvas
                          ref={canvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="w-full cursor-crosshair"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Paint over the areas you want to remove or replace
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="prompt" className="text-base font-semibold mb-2 block">
                        What to Replace With
                      </Label>
                      <Textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A blue sky, green grass, remove the person..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="negative" className="text-sm mb-2 block">
                        Negative Prompt (Optional)
                      </Label>
                      <Textarea
                        id="negative"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="blurry, low quality..."
                        className="min-h-[60px]"
                      />
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">
                        Strength: {strength.toFixed(2)}
                      </Label>
                      <Slider
                        value={[strength]}
                        onValueChange={(val) => setStrength(val[0])}
                        min={0.5}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                <Button
                  onClick={handleInpaint}
                  disabled={isProcessing || !imageFile || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Eraser className="w-5 h-5 mr-2" />
                      Inpaint ({CREDITS_COST} credits)
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}
              </div>
            </Card>

            {/* Right Column - Result */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <Label className="text-base font-semibold mb-4 block">Result</Label>
              {editedImage ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border">
                    <img src={editedImage} alt="Edited" className="w-full h-auto" />
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <a href={editedImage} download="inpainted.png">
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="aspect-square rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground">
                  {isProcessing ? (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                      <p>Processing your image...</p>
                    </div>
                  ) : (
                    <p>Your edited image will appear here</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}