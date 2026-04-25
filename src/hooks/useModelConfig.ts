import { useState, useMemo } from "react";

// Model Types
export type MediaType = "video" | "image" | "audio";

export interface VideoModel {
  id: string;
  name: string;
  category: "premium" | "standard" | "budget";
  costPerSec: number;
  minDuration: number;
  maxDuration: number;
  defaultDuration: string;
  ratios: string[];
  defaultRatio: string;
  resolutions: string[];
  defaultResolution: string;
  supportsReference: boolean;
  supportsMultimodal: boolean; // Can upload audio/video/images
  supportsStartEndFrame: boolean;
}

export interface ImageModel {
  id: string;
  name: string;
  category: "premium" | "standard" | "budget";
  cost: number;
  ratios: string[];
  defaultRatio: string;
  resolutions: string[];
  defaultResolution: string;
  supportsUpscale: boolean;
}

export interface AudioModel {
  id: string;
  name: string;
  category: "premium" | "standard" | "budget";
  cost: number;
  maxDuration: number;
  defaultDuration: number;
  supportsPrompt: boolean;
}

export type Model = VideoModel | ImageModel | AudioModel;

// Validated Model Configurations from fal.ai API
const VIDEO_MODELS: VideoModel[] = [
  // Premium Models (Latest)
  { 
    id: "seedance-2", 
    name: "Seedance 2.0", 
    category: "premium", 
    costPerSec: 0.25, 
    minDuration: 4,  // Correct: 4-15s from fal.ai docs
    maxDuration: 15, 
    defaultDuration: "5s", 
    ratios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], 
    defaultRatio: "16:9", 
    resolutions: ["480p", "720p", "1080p"],  // NO 4K per fal.ai docs
    defaultResolution: "1080p", 
    supportsReference: true,
    supportsMultimodal: true,
    supportsStartEndFrame: true,
  },
  { 
    id: "kling-3-pro", 
    name: "Kling 3.0 Pro", 
    category: "premium", 
    costPerSec: 0.112, 
    minDuration: 3,  // 3-15s
    maxDuration: 15, 
    defaultDuration: "5s", 
    ratios: ["16:9", "9:16", "1:1"], 
    defaultRatio: "16:9", 
    resolutions: ["720p", "1080p"], 
    defaultResolution: "1080p", 
    supportsReference: true,
    supportsMultimodal: true,
    supportsStartEndFrame: true,
  },
  { 
    id: "kling-3-omni", 
    name: "Kling 3.0 Omni", 
    category: "premium", 
    costPerSec: 0.15, 
    minDuration: 3,  // 3-15s
    maxDuration: 15, 
    defaultDuration: "5s", 
    ratios: ["16:9", "9:16", "1:1"], 
    defaultRatio: "16:9", 
    resolutions: ["720p", "1080p"], 
    defaultResolution: "1080p", 
    supportsReference: true,
    supportsMultimodal: true,
    supportsStartEndFrame: true,
  },
  { 
    id: "veo-3.1", 
    name: "Veo 3.1", 
    category: "premium", 
    costPerSec: 0.35, 
    minDuration: 4,  // 4s, 6s, 8s options
    maxDuration: 8, 
    defaultDuration: "5s", 
    ratios: ["16:9", "9:16"],  // Only 2 ratios per fal.ai
    defaultRatio: "16:9", 
    resolutions: ["720p", "1080p", "4K"],  // Supports 4K!
    defaultResolution: "1080p", 
    supportsReference: true,
    supportsMultimodal: false,
    supportsStartEndFrame: true,
  },
  { 
    id: "grok-video", 
    name: "Grok Video", 
    category: "premium", 
    costPerSec: 0.28, 
    minDuration: 3,
    maxDuration: 10, 
    defaultDuration: "5s", 
    ratios: ["16:9", "1:1", "9:16"], 
    defaultRatio: "16:9", 
    resolutions: ["720p", "1080p"], 
    defaultResolution: "1080p", 
    supportsReference: true,
    supportsMultimodal: true,
    supportsStartEndFrame: true,
  },
  { 
    id: "ltx-2", 
    name: "LTX 2", 
    category: "standard", 
    costPerSec: 0.20, 
    minDuration: 2,
    maxDuration: 30, 
    defaultDuration: "5s", 
    ratios: ["16:9", "1:1", "9:16"], 
    defaultRatio: "16:9", 
    resolutions: ["720p", "1080p"], 
    defaultResolution: "1080p", 
    supportsReference: true,
    supportsMultimodal: false,
    supportsStartEndFrame: false,
  },
  // Standard/Budget Models
  { 
    id: "kling-2.5-turbo", 
    name: "Kling 2.5 Turbo", 
    category: "budget", 
    costPerSec: 0.07, 
    minDuration: 3,
    maxDuration: 10, 
    defaultDuration: "5s", 
    ratios: ["16:9", "1:1", "9:16"], 
    defaultRatio: "16:9", 
    resolutions: ["480p", "720p", "1080p"], 
    defaultResolution: "720p", 
    supportsReference: true,
    supportsMultimodal: false,
    supportsStartEndFrame: true,
  },
  { 
    id: "wan-2.2", 
    name: "Wan 2.2", 
    category: "budget", 
    costPerSec: 0.10, 
    minDuration: 1,
    maxDuration: 5, 
    defaultDuration: "5s", 
    ratios: ["16:9", "1:1", "9:16"], 
    defaultRatio: "16:9", 
    resolutions: ["480p", "720p"], 
    defaultResolution: "720p", 
    supportsReference: false,
    supportsMultimodal: false,
    supportsStartEndFrame: false,
  },
  { 
    id: "luma-1.6", 
    name: "Luma 1.6", 
    category: "standard", 
    costPerSec: 0.18, 
    minDuration: 1,
    maxDuration: 5, 
    defaultDuration: "5s", 
    ratios: ["16:9", "1:1", "9:16"], 
    defaultRatio: "16:9", 
    resolutions: ["720p", "1080p"], 
    defaultResolution: "1080p", 
    supportsReference: true,
    supportsMultimodal: false,
    supportsStartEndFrame: false,
  },
  { 
    id: "runway-gen-3-turbo", 
    name: "Runway Gen-3 Turbo", 
    category: "standard", 
    costPerSec: 0.14, 
    minDuration: 2,
    maxDuration: 10, 
    defaultDuration: "5s", 
    ratios: ["16:9", "1:1", "9:16"], 
    defaultRatio: "16:9", 
    resolutions: ["720p", "1080p"], 
    defaultResolution: "720p", 
    supportsReference: true,
    supportsMultimodal: false,
    supportsStartEndFrame: false,
  },
  { 
    id: "minimax-hailuo-2", 
    name: "MiniMax Hailuo 2", 
    category: "premium", 
    costPerSec: 0.18, 
    minDuration: 1,
    maxDuration: 6, 
    defaultDuration: "5s", 
    ratios: ["16:9", "1:1", "9:16"], 
    defaultRatio: "16:9", 
    resolutions: ["720p", "1080p"], 
    defaultResolution: "1080p", 
    supportsReference: true,
    supportsMultimodal: false,
    supportsStartEndFrame: false,
  },
  { 
    id: "minimax-hailuo", 
    name: "MiniMax Hailuo", 
    category: "standard", 
    costPerSec: 0.12, 
    minDuration: 1,
    maxDuration: 6, 
    defaultDuration: "5s", 
    ratios: ["16:9", "1:1", "9:16"], 
    defaultRatio: "16:9", 
    resolutions: ["720p", "1080p"], 
    defaultResolution: "720p", 
    supportsReference: false,
    supportsMultimodal: false,
    supportsStartEndFrame: false,
  },
  { 
    id: "hunyuan-video", 
    name: "Hunyuan Video", 
    category: "standard", 
    costPerSec: 0.10, 
    minDuration: 1,
    maxDuration: 5, 
    defaultDuration: "5s", 
    ratios: ["16:9", "1:1", "9:16"], 
    defaultRatio: "16:9", 
    resolutions: ["480p", "720p"], 
    defaultResolution: "720p", 
    supportsReference: false,
    supportsMultimodal: false,
    supportsStartEndFrame: false,
  },
];

const IMAGE_MODELS: ImageModel[] = [
  { id: "nano-banana-2", name: "Nano Banana 2", category: "premium", cost: 0.05, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024", "2048", "4K"], supportsUpscale: true },
  { id: "gpt-image-2", name: "GPT Image 2", category: "premium", cost: 0.045, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024", "2048", "4K"], supportsUpscale: true },
  { id: "flux-2-flex", name: "FLUX 2 Flex", category: "premium", cost: 0.065, ratios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["custom", "1024", "2048"], supportsUpscale: true },
  { id: "flux-pro-1.1", name: "FLUX.1 Pro 1.1", category: "premium", cost: 0.06, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024", "2048"], supportsUpscale: true },
  { id: "flux-pro", name: "FLUX.1 Pro", category: "premium", cost: 0.055, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024", "2048"], supportsUpscale: true },
  { id: "flux-dev", name: "FLUX.1 Dev", category: "standard", cost: 0.025, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024"], supportsUpscale: false },
  { id: "flux-schnell", name: "FLUX.1 Schnell", category: "budget", cost: 0.003, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024"], supportsUpscale: false },
  { id: "stable-diffusion-3.5-large", name: "SD 3.5 Large", category: "standard", cost: 0.04, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024", "2048"], supportsUpscale: true },
  { id: "stable-diffusion-3.5-medium", name: "SD 3.5 Medium", category: "standard", cost: 0.03, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024", "2048"], supportsUpscale: true },
  { id: "stable-diffusion-xl", name: "SD XL", category: "budget", cost: 0.02, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024", "2048"], supportsUpscale: true },
  { id: "recraft-v3", name: "Recraft V3", category: "standard", cost: 0.04, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024", "2048"], supportsUpscale: true },
  { id: "ideogram-3.0", name: "Ideogram 3.0", category: "standard", cost: 0.035, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024"], supportsUpscale: false },
  { id: "ideogram-2.0", name: "Ideogram 2.0", category: "standard", cost: 0.03, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024"], supportsUpscale: false },
  { id: "playground-v2.5", name: "Playground v2.5", category: "standard", cost: 0.025, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024"], supportsUpscale: false },
  { id: "auraflow", name: "AuraFlow", category: "standard", cost: 0.025, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", resolutions: ["1024"], supportsUpscale: false },
];

const AUDIO_MODELS: AudioModel[] = [
  { id: "musicgen", name: "MusicGen", category: "standard", cost: 0.02, maxDuration: 30, defaultDuration: 10, supportsPrompt: true },
  { id: "audiocraft", name: "AudioCraft", category: "standard", cost: 0.025, maxDuration: 30, defaultDuration: 10, supportsPrompt: true },
  { id: "stable-audio", name: "Stable Audio", category: "premium", cost: 0.04, maxDuration: 45, defaultDuration: 15, supportsPrompt: true },
  { id: "audiogen", name: "AudioGen", category: "standard", cost: 0.02, maxDuration: 10, defaultDuration: 5, supportsPrompt: true },
];

// Helper type guards
function isVideoModel(model: Model): model is VideoModel {
  return "costPerSec" in model;
}

function isAudioModel(model: Model): model is AudioModel {
  return "supportsPrompt" in model;
}

function isImageModel(model: Model): model is ImageModel {
  return "cost" in model && "ratios" in model && !("costPerSec" in model);
}

export const useModelConfig = (mediaType: MediaType, selectedModelId: string) => {
  const getModels = (): Model[] => {
    switch (mediaType) {
      case "video": return VIDEO_MODELS;
      case "image": return IMAGE_MODELS;
      case "audio": return AUDIO_MODELS;
      default: return VIDEO_MODELS;
    }
  };

  const models = useMemo(() => getModels(), [mediaType]);
  
  const selectedModel = useMemo(() => {
    return models.find(m => m.id === selectedModelId);
  }, [models, selectedModelId]);

  // Get available options for selected model
  const getAvailableRatios = (): string[] => {
    if (!selectedModel) return ["16:9", "1:1", "9:16"];
    if (isVideoModel(selectedModel) || isImageModel(selectedModel)) {
      return selectedModel.ratios;
    }
    return ["16:9", "1:1", "9:16"];
  };

  const getAvailableResolutions = (): string[] => {
    if (!selectedModel) return ["720p", "1080p"];
    if (isVideoModel(selectedModel) || isImageModel(selectedModel)) {
      return selectedModel.resolutions;
    }
    return ["720p", "1080p"];
  };

  const getDurationOptions = (): string[] => {
    if (!selectedModel) return ["1s", "2s", "3s", "4s", "5s"];
    
    if (isVideoModel(selectedModel)) {
      const { minDuration, maxDuration } = selectedModel;
      const options = [];
      for (let i = minDuration; i <= maxDuration; i++) {
        options.push(`${i}s`);
      }
      return options;
    }
    
    if (isAudioModel(selectedModel)) {
      const { maxDuration } = selectedModel;
      const options = [];
      for (let i = 1; i <= maxDuration; i++) {
        options.push(`${i}s`);
      }
      return options;
    }
    
    return ["1s", "2s", "3s", "4s", "5s"];
  };

  const getDefaultSettings = () => {
    if (!selectedModel) {
      return {
        aspectRatio: "16:9",
        resolution: "1080p",
        duration: "5s",
      };
    }

    return {
      aspectRatio: "defaultRatio" in selectedModel ? selectedModel.defaultRatio : "16:9",
      resolution: "defaultResolution" in selectedModel ? selectedModel.defaultResolution : "1080p",
      duration: "defaultDuration" in selectedModel 
        ? (typeof selectedModel.defaultDuration === "number" 
          ? `${selectedModel.defaultDuration}s` 
          : selectedModel.defaultDuration) 
        : "5s",
    };
  };

  const getModelCapabilities = () => {
    if (!selectedModel) {
      return {
        supportsReference: false,
        supportsMultimodal: false,
        supportsStartEndFrame: false,
        supportsUpscale: false,
      };
    }

    return {
      supportsReference: "supportsReference" in selectedModel ? selectedModel.supportsReference : false,
      supportsMultimodal: "supportsMultimodal" in selectedModel ? selectedModel.supportsMultimodal : false,
      supportsStartEndFrame: "supportsStartEndFrame" in selectedModel ? selectedModel.supportsStartEndFrame : false,
      supportsUpscale: "supportsUpscale" in selectedModel ? selectedModel.supportsUpscale : false,
    };
  };

  const calculateCost = (duration?: string, generations = 1): number => {
    if (!selectedModel) return 0;
    
    let costPerUnit = 0;
    
    if ("costPerSec" in selectedModel) {
      // Video model
      const durationSecs = duration ? parseInt(duration) : parseInt(getDefaultSettings().duration);
      costPerUnit = (selectedModel as VideoModel).costPerSec * durationSecs;
    } else if ("cost" in selectedModel) {
      // Image or Audio model
      costPerUnit = (selectedModel as ImageModel | AudioModel).cost;
      
      // Audio models have per-second cost
      if ("maxDuration" in selectedModel && mediaType === "audio") {
        const durationSecs = duration ? parseInt(duration) : parseInt(getDefaultSettings().duration);
        costPerUnit = (selectedModel as AudioModel).cost * durationSecs;
      }
    }
    
    return Math.round(costPerUnit * 100 * generations);
  };

  return {
    models,
    selectedModel,
    getAvailableRatios,
    getAvailableResolutions,
    getDurationOptions,
    getDefaultSettings,
    getModelCapabilities,
    calculateCost,
  };
};

// Export models for direct access if needed
export { VIDEO_MODELS, IMAGE_MODELS, AUDIO_MODELS };