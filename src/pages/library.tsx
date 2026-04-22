import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Play, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Filter,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Wand2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";

interface Generation {
  id: string;
  type: "image" | "video";
  prompt: string;
  url: string;
  status: "completed" | "processing" | "failed";
  created_at: string;
  model: string;
  credits_used: number;
  aspect_ratio?: string;
  duration?: string;
}

export default function Library() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    setIsLoading(true);
    try {
      const mockGenerations: Generation[] = [
        {
          id: "1",
          type: "image",
          prompt: "A futuristic cityscape with neon lights and flying cars",
          url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
          status: "completed",
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          model: "FLUX.1",
          credits_used: 4,
          aspect_ratio: "16:9",
        },
        {
          id: "2",
          type: "video",
          prompt: "A cat playing piano in a jazz club",
          url: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&q=80",
          status: "completed",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          model: "Kling 1.6",
          credits_used: 15,
          duration: "5s",
        },
        {
          id: "3",
          type: "image",
          prompt: "Abstract art with flowing colors and geometric shapes",
          url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80",
          status: "completed",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          model: "Nano Banana 2",
          credits_used: 5,
          aspect_ratio: "1:1",
        },
      ];

      setGenerations(mockGenerations);
    } catch (error) {
      console.error("Error fetching generations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id));
  };

  const handleDownload = async (url: string, type: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `generation-${Date.now()}.${type === "video" ? "mp4" : "png"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading:", error);
    }
  };

  const filteredGenerations = generations
    .filter((g) => {
      if (filter === "all") return true;
      return g.type === filter;
    })
    .filter((g) => g.prompt.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-0">
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-0">
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-0">
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              My Library
            </h1>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search generations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs
                value={filter}
                onValueChange={(v) => setFilter(v as any)}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full sm:w-auto grid-cols-3">
                  <TabsTrigger value="all" className="gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="image" className="gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Images
                  </TabsTrigger>
                  <TabsTrigger value="video" className="gap-2">
                    <Video className="w-4 h-4" />
                    Videos
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-muted border-border">
                  <div className="aspect-video bg-muted/50" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGenerations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Grid3X3 className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No generations yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating amazing AI-generated images and videos
              </p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Create Your First Generation
                </Button>
              </Link>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGenerations.map((generation) => (
                <Card
                  key={generation.id}
                  className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={generation.url}
                      alt={generation.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-foreground hover:bg-white"
                        onClick={() => handleDownload(generation.url, generation.type)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 text-foreground hover:bg-white"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(generation.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="secondary"
                        className="bg-black/50 text-white border-0 backdrop-blur-sm"
                      >
                        {generation.type === "video" ? (
                          <Video className="w-3 h-3 mr-1" />
                        ) : (
                          <ImageIcon className="w-3 h-3 mr-1" />
                        )}
                        {generation.type === "video" ? generation.duration : generation.aspect_ratio}
                      </Badge>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">{getStatusBadge(generation.status)}</div>
                  </div>

                  <CardContent className="p-4">
                    <p className="text-sm line-clamp-2 mb-3 text-foreground">{generation.prompt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(generation.created_at))}
                        </span>
                        <span>{generation.credits_used} credits</span>
                      </div>
                      <span className="font-medium text-primary">{generation.model}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredGenerations.map((generation) => (
                <Card
                  key={generation.id}
                  className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-muted">
                      <img
                        src={generation.url}
                        alt={generation.prompt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant="secondary"
                          className="bg-black/50 text-white border-0 backdrop-blur-sm"
                        >
                          {generation.type === "video" ? (
                            <Video className="w-3 h-3 mr-1" />
                          ) : (
                            <ImageIcon className="w-3 h-3 mr-1" />
                          )}
                          {generation.type === "video" ? generation.duration : generation.aspect_ratio}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">{getStatusBadge(generation.status)}</div>
                    </div>
                    <CardContent className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                      <div>
                        <p className="text-sm sm:text-base mb-3 text-foreground">{generation.prompt}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            {formatDistanceToNow(new Date(generation.created_at))}
                          </span>
                          <span>{generation.credits_used} credits</span>
                          <Badge variant="outline" className="font-medium text-primary">
                            {generation.model}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(generation.url, generation.type)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(generation.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}