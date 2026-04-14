import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { hasEnoughCredits, deductCredits } from "@/services/creditsService";
import { saveVideoGeneration } from "@/services/libraryService";
import {
  Video,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Volume2,
  Clock,
  Maximize2,
  Loader2,
  ChevronDown,
  Upload,
  Copy,
  Share2,
  Download,
  ArrowLeft,
  Search,
  Check,
  X,
  Info,
  Monitor,
  Twitter,
  Facebook,
  MessageCircle,
  Link2,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9", icon: "▭" },
  { id: "9:16", label: "9:16", icon: "▯" },
  { id: "1:1", label: "1:1", icon: "□" },
  { id: "4:3", label: "4:3", icon: "▭" },
  { id: "3:4", label: "3:4", icon: "▯" },
];

// Video model configurations with exact fal.ai specs
  const videoModels = [
    {
      id: "kling-3.0",
      name: "Kling 3.0",
      logo: "/logos/kling.svg",
      maxImages: 2,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
      durations: [5, 10, 15],
      credits: 20,
      maxBatch: 1
    },
    {
      id: "kling-2.6",
      name: "Kling 2.6",
      logo: "/logos/kling.svg",
      maxImages: 2,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: [5, 10],
      credits: 18,
      maxBatch: 1
    },
    {
      id: "luma-1.6",
      name: "Luma Dream Machine 1.6",
      logo: "/logos/luma.svg",
      maxImages: 2,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
      durations: [5],
      credits: 15,
      maxBatch: 1
    },
    {
      id: "runway-gen3-alpha",
      name: "Runway Gen-3 Alpha",
      logo: "/logos/runway.svg",
      maxImages: 2,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: [5, 10],
      credits: 18,
      maxBatch: 1
    },
    {
      id: "runway-gen3-turbo",
      name: "Runway Gen-3 Turbo",
      logo: "/logos/runway.svg",
      maxImages: 2,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: [5, 10],
      credits: 16,
      maxBatch: 1
    },
    {
      id: "minimax-02",
      name: "MiniMax 02",
      logo: "/logos/minimax.svg",
      maxImages: 1,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: [6],
      credits: 14,
      maxBatch: 1
    },
    {
      id: "minimax-02-fast",
      name: "MiniMax 02 Fast",
      logo: "/logos/minimax.svg",
      maxImages: 1,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: [6],
      credits: 12,
      maxBatch: 1
    },
    {
      id: "hunyuan-1.0",
      name: "Hunyuan Video",
      logo: "/logos/hunyuan.svg",
      maxImages: 1,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: [5, 8],
      credits: 16,
      maxBatch: 1
    },
    {
      id: "grok-1.0",
      name: "Grok Imagine Video",
      logo: "/logos/grok.svg",
      maxImages: 1,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: [5, 10, 15],
      credits: 22,
      maxBatch: 1
    },
    {
      id: "seedance-1.5-pro",
      name: "Seedance 1.5 Pro",
      logo: "/logos/seedance.svg",
      maxImages: 1,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: [5, 10, 12],
      credits: 20,
      maxBatch: 1
    },
    {
      id: "sora-2-pro-max",
      name: "Sora 2 Pro Max",
      logo: "/logos/sora.svg",
      maxImages: 1,
      maxVideo: 0,
      maxAudio: 1,
      aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21", "4:3", "3:4"],
      durations: [5, 10, 15, 20],
      credits: 35,
      maxBatch: 1
    },
    {
      id: "sora-2-max",
      name: "Sora 2 Max",
      logo: "/logos/sora.svg",
      maxImages: 1,
      maxVideo: 0,
      maxAudio: 1,
      aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21"],
      durations: [5, 10, 15, 20],
      credits: 30,
      maxBatch: 1
    },
    {
      id: "veo-3.1",
      name: "Veo 3.1",
      logo: "/logos/veo.svg",
      maxImages: 1,
      maxVideo: 0,
      maxAudio: 1,
      aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
      durations: [5, 10, 15],
      credits: 22,
      maxBatch: 1
    },
    {
      id: "ltx-2-19b",
      name: "LTX-2-19B",
      logo: "/logos/ltx.svg",
      maxImages: 1,
      maxVideo: 1,
      maxAudio: 1,
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: [5, 10],
      credits: 16,
      maxBatch: 1
    },
    {
      id: "wan-2.2",
      name: "Wan 2.2",
      logo: "/logos/wan.svg",
      maxImages: 2,
      maxVideo: 0,
      maxAudio: 0,
      aspectRatios: ["16:9", "9:16", "1:1"],
      durations: [5, 10],
      credits: 16,
      maxBatch: 1
    }
  ];

// Video models organized by company with all variants
  const videoModelGroups = [
    {
      company: "Kling",
      models: [
        {
          id: "kling-3.0",
          name: "Kling 3.0",
          logo: "/logos/kling.svg",
          maxImages: 2,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10, 15],
          credits: 20,
          maxBatch: 1
        },
        {
          id: "kling-2.6",
          name: "Kling 2.6",
          logo: "/logos/kling.svg",
          maxImages: 2,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 18,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Sora",
      models: [
        {
          id: "sora-2-pro-max",
          name: "Sora 2 Pro Max",
          logo: "/logos/sora.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 1,
          aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21", "4:3", "3:4"],
          durations: [5, 10, 15, 20],
          credits: 35,
          maxBatch: 1
        },
        {
          id: "sora-2-pro",
          name: "Sora 2 Pro",
          logo: "/logos/sora.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 1,
          aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21", "4:3", "3:4"],
          durations: [5, 10, 15, 20],
          credits: 32,
          maxBatch: 1
        },
        {
          id: "sora-2-max",
          name: "Sora 2 Max",
          logo: "/logos/sora.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 1,
          aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21"],
          durations: [5, 10, 15, 20],
          credits: 30,
          maxBatch: 1
        },
        {
          id: "sora-2-fast",
          name: "Sora 2 Fast",
          logo: "/logos/sora.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 1,
          aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21"],
          durations: [5, 10, 15],
          credits: 20,
          maxBatch: 1
        },
        {
          id: "sora-1-turbo",
          name: "Sora 1 Turbo",
          logo: "/logos/sora.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 20,
          maxBatch: 1
        },
        {
          id: "sora-1-pro",
          name: "Sora 1 Pro",
          logo: "/logos/sora.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10, 15],
          credits: 22,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Veo",
      models: [
        {
          id: "veo-3.1-pro-max",
          name: "Veo 3.1 Pro Max",
          logo: "/logos/veo.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 1,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9", "9:21"],
          durations: [5, 10, 15, 20],
          credits: 28,
          maxBatch: 1
        },
        {
          id: "veo-3.1-pro",
          name: "Veo 3.1 Pro",
          logo: "/logos/veo.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 1,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10, 15],
          credits: 25,
          maxBatch: 1
        },
        {
          id: "veo-3.1-fast",
          name: "Veo 3.1 Fast",
          logo: "/logos/veo.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 1,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10],
          credits: 20,
          maxBatch: 1
        },
        {
          id: "veo-3.0-pro",
          name: "Veo 3.0 Pro",
          logo: "/logos/veo.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 1,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10, 15],
          credits: 22,
          maxBatch: 1
        },
        {
          id: "veo-3.0-fast",
          name: "Veo 3.0 Fast",
          logo: "/logos/veo.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 1,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 18,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Runway",
      models: [
        {
          id: "runway-gen3-alpha",
          name: "Runway Gen-3 Alpha",
          logo: "/logos/runway.svg",
          maxImages: 2,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 18,
          maxBatch: 1
        },
        {
          id: "runway-gen3-turbo",
          name: "Runway Gen-3 Turbo",
          logo: "/logos/runway.svg",
          maxImages: 2,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 16,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Luma",
      models: [
        {
          id: "luma-1.6",
          name: "Luma Dream Machine 1.6",
          logo: "/logos/luma.svg",
          maxImages: 2,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5],
          credits: 15,
          maxBatch: 1
        }
      ]
    },
    {
      company: "MiniMax",
      models: [
        {
          id: "minimax-02",
          name: "MiniMax 02",
          logo: "/logos/minimax.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [6],
          credits: 14,
          maxBatch: 1
        },
        {
          id: "minimax-02-fast",
          name: "MiniMax 02 Fast",
          logo: "/logos/minimax.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [6],
          credits: 12,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Hunyuan",
      models: [
        {
          id: "hunyuan-1.0",
          name: "Hunyuan Video",
          logo: "/logos/hunyuan.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 8],
          credits: 16,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Grok",
      models: [
        {
          id: "grok-1.0",
          name: "Grok Imagine Video",
          logo: "/logos/grok.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10, 15],
          credits: 22,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Seedance",
      models: [
        {
          id: "seedance-1.5-pro",
          name: "Seedance 1.5 Pro",
          logo: "/logos/seedance.svg",
          maxImages: 1,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10, 12],
          credits: 20,
          maxBatch: 1
        }
      ]
    },
    {
      company: "LTX",
      models: [
        {
          id: "ltx-2-19b",
          name: "LTX-2-19B",
          logo: "/logos/ltx.svg",
          maxImages: 1,
          maxVideo: 1,
          maxAudio: 1,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 16,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Wan",
      models: [
        {
          id: "wan-2.2",
          name: "Wan 2.2",
          logo: "/logos/wan.svg",
          maxImages: 2,
          maxVideo: 0,
          maxAudio: 0,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 16,
          maxBatch: 1
        }
      ]
    }
  ];

  // Flatten for easy lookup
  const videoModels = videoModelGroups.flatMap(group => group.models);

                <div className="flex items-center justify-between gap-2 mb-3">
                  <select
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value);
                      setUploadedImages([]);
                      setUploadedVideo(null);
                      setUploadedAudio(null);
                    }}
                    className="flex-1 bg-black/40 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#c5f04a]/50 focus:ring-[#c5f04a]/20 outline-none"
                  >
                    {videoModelGroups.map(group => (
                      <optgroup key={group.company} label={group.company}>
                        {group.models.map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name} - 🪙{model.credits}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>