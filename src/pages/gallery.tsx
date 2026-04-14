import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Download, Trash2, Search, SlidersHorizontal, Play, Loader2 } from "lucide-react";

interface VideoGeneration {
  id: string;
  video_url: string;
  prompt: string;
  model_id: string;
  model_name: string;
  aspect_ratio: string;
  duration: number;
  credits_used: number;
  created_at: string;
  thumbnail_url?: string;
}

export default function Gallery() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchVideos();
  }, []);

  const checkAuthAndFetchVideos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/login");
        return;
      }

      await fetchVideos(session.user.id);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const fetchVideos = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("video_generations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;

    try {
      const { error } = await supabase
        .from("video_generations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setVideos(videos.filter(v => v.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.model_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModel = selectedModel === "all" || video.model_id === selectedModel;
    return matchesSearch && matchesModel;
  });

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
  });

  // Get unique models
  const uniqueModels = Array.from(new Set(videos.map(v => JSON.stringify({ id: v.model_id, name: v.model_name })))).map(s => JSON.parse(s));

  return (
    <>
      <SEO 
        title="Video Gallery - Back2Life.Studio"
        description="View and download your AI-generated videos"
      />
      
      <Navigation />
      
      <div className="min-h-screen bg-background pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Video Gallery</h1>
            <p className="text-white/60">View and manage your AI-generated videos</p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-cyan-500/50 outline-none"
              />
            </div>

            {/* Model Filter */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500/50 outline-none"
            >
              <option value="all">All Models</option>
              {uniqueModels.map((model: any) => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
              className="px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500/50 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && sortedVideos.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
              <p className="text-white/60 mb-6">Generate your first AI video to see it here</p>
              <button
                onClick={() => router.push("/video/generate")}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all"
              >
                Generate Video
              </button>
            </div>
          )}

          {/* Videos Grid */}
          {!loading && sortedVideos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedVideos.map((video) => (
                <div
                  key={video.id}
                  className="group bg-[#1a1a1c] border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all"
                >
                  {/* Video Preview */}
                  <div className="relative aspect-video bg-black">
                    {playingVideo === video.id ? (
                      <video
                        src={video.video_url}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        onEnded={() => setPlayingVideo(null)}
                      />
                    ) : (
                      <>
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
                          <div className="text-white/40 text-4xl">🎬</div>
                        </div>
                        <button
                          onClick={() => setPlayingVideo(video.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    {/* Metadata */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-white/60">
                      <span className="px-2 py-1 bg-white/5 rounded">{video.model_name}</span>
                      <span className="px-2 py-1 bg-white/5 rounded">{video.aspect_ratio}</span>
                      <span className="px-2 py-1 bg-white/5 rounded">{video.duration}s</span>
                    </div>

                    {/* Prompt */}
                    <p className="text-sm text-white mb-3 line-clamp-2">{video.prompt}</p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-white/40 mb-4">
                      <span>{new Date(video.created_at).toLocaleDateString()}</span>
                      <span>🪙 {video.credits_used}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => router.push(`/extract?video=${encodeURIComponent(video.video_url)}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg text-white text-xs hover:border-cyan-500/50 transition-all"
                        title="Extract frames from this video"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Extract
                      </button>
                      <button
                        onClick={() => handleDownload(video.video_url, `video-${video.id}.mp4`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-lg text-white text-xs hover:border-cyan-500/50 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-lg text-red-400 hover:border-red-500/50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}