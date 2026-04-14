import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Download, Trash2, Video, Calendar, Coins, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/router";

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
  
  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    fetchVideos();
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("video_generations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: sortBy === "oldest" });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (videoUrl: string, prompt: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prompt.substring(0, 30)}_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from("video_generations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setVideos(videos.filter(v => v.id !== id));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.model_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModel = selectedModel === "all" || video.model_id === selectedModel;
    return matchesSearch && matchesModel;
  });

  // Get unique models for filter
  const uniqueModels = Array.from(new Set(videos.map(v => JSON.stringify({ id: v.model_id, name: v.model_name })))).map(s => JSON.parse(s));

  return (
    <>
      <SEO
        title="Video Gallery | Back2Life.Studio"
        description="View and download your generated videos"
      />
      <Navigation />
      
      <div className="min-h-screen bg-black pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Video Gallery</h1>
            <p className="text-white/60">View and download your generated videos</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by prompt or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1a1a1c] border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-cyan-500/50 outline-none text-sm"
              />
            </div>

            {/* Model Filter */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-4 py-2 bg-[#1a1a1c] border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500/50 outline-none"
            >
              <option value="all">All Models</option>
              {uniqueModels.map((model: any) => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as "newest" | "oldest");
                fetchVideos();
              }}
              className="px-4 py-2 bg-[#1a1a1c] border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500/50 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1a1a1c] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg">
                  <Video className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Total Videos</p>
                  <p className="text-white text-xl font-semibold">{videos.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1c] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg">
                  <Coins className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">Credits Spent</p>
                  <p className="text-white text-xl font-semibold">
                    {videos.reduce((sum, v) => sum + v.credits_used, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1c] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-white/60 text-xs">This Month</p>
                  <p className="text-white text-xl font-semibold">
                    {videos.filter(v => {
                      const videoDate = new Date(v.created_at);
                      const now = new Date();
                      return videoDate.getMonth() === now.getMonth() &&
                             videoDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Loading videos...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-2">
                {searchQuery || selectedModel !== "all" 
                  ? "No videos match your filters" 
                  : "No videos generated yet"}
              </p>
              <p className="text-white/40 text-sm">
                {searchQuery || selectedModel !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start creating videos to see them here"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="group bg-[#1a1a1c] border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all"
                >
                  {/* Video Preview */}
                  <div className="relative aspect-video bg-black">
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-white text-sm line-clamp-2 mb-3">
                      {video.prompt}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-white/60">
                      <span className="px-2 py-1 bg-white/5 rounded">{video.model_name}</span>
                      <span className="px-2 py-1 bg-white/5 rounded">{video.aspect_ratio}</span>
                      <span className="px-2 py-1 bg-white/5 rounded">{video.duration}s</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-white/40 mb-3">
                      <span>{new Date(video.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {video.credits_used}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(video.video_url, video.prompt)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
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