import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getImageGenerations,
  getVideoGenerations,
  deleteImageGeneration,
  deleteVideoGeneration,
  type ImageGeneration,
  type VideoGeneration,
} from "@/services/libraryService";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/router";
import {
  ImageIcon,
  Video,
  Download,
  Trash2,
  Calendar,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Library,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Library() {
  const router = useRouter();
  const [images, setImages] = useState<ImageGeneration[]>([]);
  const [videos, setVideos] = useState<VideoGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("images");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    loadGenerations();
  };

  const loadGenerations = async () => {
    setIsLoading(true);
    const [imageData, videoData] = await Promise.all([
      getImageGenerations(),
      getVideoGenerations(),
    ]);
    setImages(imageData);
    setVideos(videoData);
    setIsLoading(false);
  };

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const result = await deleteImageGeneration(id);
    if (result.success) {
      setImages(images.filter(img => img.id !== id));
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    const result = await deleteVideoGeneration(id);
    if (result.success) {
      setVideos(videos.filter(vid => vid.id !== id));
    }
  };

  return (
    <>
      <SEO
        title="My Library - Back2Life.Studio"
        description="View your AI generation history"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="text-center space-y-3 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Library className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your Creations</span>
            </div>
            
            <h1 className="font-heading font-bold text-4xl md:text-5xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Library
            </h1>
            
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Browse your AI-generated images and videos
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-4">
              <TabsTrigger value="images" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                Images ({images.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="w-4 h-4" />
                Videos ({videos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : images.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-xl mb-2">No images yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start creating beautiful images with AI
                    </p>
                    <Button onClick={() => router.push("/images/generate")}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image) => (
                    <Card key={image.id} className="overflow-hidden group">
                      <div className="relative aspect-square bg-muted">
                        <img
                          src={image.image_url}
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <p className="text-sm line-clamp-2 flex-1">{image.prompt}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="font-medium">{image.model_name}</span>
                          <span>{image.credits_used} credits</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleCopyPrompt(image.prompt, image.id)}
                          >
                            {copiedId === image.id ? (
                              <Check className="w-4 h-4 mr-1" />
                            ) : (
                              <Copy className="w-4 h-4 mr-1" />
                            )}
                            Prompt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(image.image_url, "_blank")}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : videos.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Video className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-xl mb-2">No videos yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start creating amazing videos with AI
                    </p>
                    <Button onClick={() => router.push("/video/generate")}>
                      <Video className="w-4 h-4 mr-2" />
                      Generate Video
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden group">
                      <div className="relative aspect-video bg-muted">
                        <video
                          src={video.video_url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <p className="text-sm line-clamp-2 flex-1">{video.prompt}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="font-medium">{video.model_name}</span>
                          <span>{video.credits_used} credits</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleCopyPrompt(video.prompt, video.id)}
                          >
                            {copiedId === video.id ? (
                              <Check className="w-4 h-4 mr-1" />
                            ) : (
                              <Copy className="w-4 h-4 mr-1" />
                            )}
                            Prompt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(video.video_url, "_blank")}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteVideo(video.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}