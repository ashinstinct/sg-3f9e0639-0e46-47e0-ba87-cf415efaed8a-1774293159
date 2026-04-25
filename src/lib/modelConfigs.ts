// Model configurations for Fal.ai API
// Each model defines its endpoint, type, and available settings

export interface SettingField {
  key: string;
  label: string;
  type: "select" | "slider" | "toggle" | "number";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  default: string | number | boolean;
  condition?: (settings: Record<string, any>) => boolean;
}

export interface ModelConfig {
  id: string;
  name: string;
  category: "budget" | "standard" | "premium" | "ultra";
  type: "image" | "video" | "audio";
  endpoint: string;
  costPerUnit: number;
  unitType: "image" | "second" | "generation";
  description?: string;
  settings: SettingField[];
  supportedReferenceModes?: string[];
}

// Video Models
export const videoModels: ModelConfig[] = [
  // Veo Models
  {
    id: "veo-3",
    name: "Veo 3",
    category: "premium",
    type: "video",
    endpoint: "fal-ai/veo/v3.0",
    costPerUnit: 0.30,
    unitType: "second",
    description: "Google's Veo 3 - High quality video generation",
    supportedReferenceModes: ["text-to-video", "image-to-video", "start-end-frame"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9 Landscape" },
          { value: "9:16", label: "9:16 Portrait" },
          { value: "1:1", label: "1:1 Square" },
          { value: "4:3", label: "4:3 Classic" },
          { value: "3:4", label: "3:4 Portrait" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5 seconds" },
          { value: "6", label: "6 seconds" },
          { value: "7", label: "7 seconds" },
          { value: "8", label: "8 seconds" },
        ],
        default: "5",
      },
      {
        key: "resolution",
        label: "Resolution",
        type: "select",
        options: [
          { value: "720p", label: "720p HD" },
          { value: "1080p", label: "1080p Full HD" },
        ],
        default: "720p",
      },
    ],
  },
  {
    id: "veo-3-fast",
    name: "Veo 3 Fast",
    category: "standard",
    type: "video",
    endpoint: "fal-ai/veo/v3.0/fast",
    costPerUnit: 0.20,
    unitType: "second",
    description: "Faster generation with Veo 3",
    supportedReferenceModes: ["text-to-video", "image-to-video"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "6", label: "6s" },
          { value: "7", label: "7s" },
          { value: "8", label: "8s" },
        ],
        default: "5",
      },
    ],
  },

  // Kling Models
  {
    id: "kling-3-pro",
    name: "Kling 3.0 Pro",
    category: "premium",
    type: "video",
    endpoint: "fal-ai/kling-video/v3.0/pro",
    costPerUnit: 0.112,
    unitType: "second",
    description: "Kling 3.0 Pro - Professional quality",
    supportedReferenceModes: ["text-to-video", "image-to-video", "start-end-frame", "omni-reference"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
          { value: "21:9", label: "21:9" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        default: "5",
      },
      {
        key: "resolution",
        label: "Resolution",
        type: "select",
        options: [
          { value: "720p", label: "720p" },
          { value: "1080p", label: "1080p" },
        ],
        default: "1080p",
      },
    ],
  },
  {
    id: "kling-omni-3",
    name: "Kling 3.0 Omni",
    category: "premium",
    type: "video",
    endpoint: "fal-ai/kling-video/v3.0/omni",
    costPerUnit: 0.125,
    unitType: "second",
    description: "Kling 3.0 with multi-element support",
    supportedReferenceModes: ["text-to-video", "image-to-video", "start-end-frame", "omni-reference", "elements"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        default: "5",
      },
    ],
  },
  {
    id: "kling-motion-3",
    name: "Kling 3.0 Motion",
    category: "standard",
    type: "video",
    endpoint: "fal-ai/kling-video/v3.0/motion-control",
    costPerUnit: 0.10,
    unitType: "second",
    description: "Kling with motion brush control",
    supportedReferenceModes: ["text-to-video", "image-to-video", "motion-brush"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        default: "5",
      },
    ],
  },
  {
    id: "kling-2-5",
    name: "Kling 2.5 Turbo",
    category: "budget",
    type: "video",
    endpoint: "fal-ai/kling-video/v2.5/turbo",
    costPerUnit: 0.07,
    unitType: "second",
    description: "Fast and affordable video generation",
    supportedReferenceModes: ["text-to-video", "image-to-video"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        default: "5",
      },
    ],
  },

  // Sora Models
  {
    id: "sora-2-pro",
    name: "Sora 2 Pro",
    category: "ultra",
    type: "video",
    endpoint: "fal-ai/sora/v2-pro",
    costPerUnit: 0.30,
    unitType: "second",
    description: "OpenAI Sora 2 Pro - State of the art",
    supportedReferenceModes: ["text-to-video", "image-to-video"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
          { value: "15", label: "15s" },
        ],
        default: "5",
      },
      {
        key: "resolution",
        label: "Resolution",
        type: "select",
        options: [
          { value: "720p", label: "720p" },
          { value: "1080p", label: "1080p" },
        ],
        default: "1080p",
      },
    ],
  },
  {
    id: "sora-2-fast",
    name: "Sora 2 Fast",
    category: "premium",
    type: "video",
    endpoint: "fal-ai/sora/v2-fast",
    costPerUnit: 0.20,
    unitType: "second",
    description: "Fast Sora generation",
    supportedReferenceModes: ["text-to-video", "image-to-video"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        default: "5",
      },
    ],
  },

  // Wan Models
  {
    id: "wan-2-1",
    name: "Wan 2.1",
    category: "budget",
    type: "video",
    endpoint: "fal-ai/wan-video/v2.1",
    costPerUnit: 0.10,
    unitType: "second",
    description: "Wan 2.1 - Open source video model",
    supportedReferenceModes: ["text-to-video", "image-to-video", "start-end-frame"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        default: "5",
      },
    ],
  },

  // Luma Models
  {
    id: "luma-1-6",
    name: "Luma Dream Machine 1.6",
    category: "standard",
    type: "video",
    endpoint: "fal-ai/luma-dream-machine/v1.6",
    costPerUnit: 0.15,
    unitType: "second",
    description: "Luma Dream Machine - Fast and creative",
    supportedReferenceModes: ["text-to-video", "image-to-video", "start-end-frame"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
        ],
        default: "5",
      },
    ],
  },

  // Runway Models
  {
    id: "runway-gen3-alpha",
    name: "Runway Gen-3 Alpha",
    category: "premium",
    type: "video",
    endpoint: "fal-ai/runway-gen3/alpha",
    costPerUnit: 0.18,
    unitType: "second",
    description: "Runway Gen-3 - Professional video",
    supportedReferenceModes: ["text-to-video", "image-to-video"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        default: "5",
      },
    ],
  },

  // MiniMax Models
  {
    id: "minimax-02",
    name: "MiniMax Video-02",
    category: "standard",
    type: "video",
    endpoint: "fal-ai/minimax/video-02",
    costPerUnit: 0.12,
    unitType: "second",
    description: "MiniMax - High quality video",
    supportedReferenceModes: ["text-to-video", "image-to-video"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        default: "5",
      },
    ],
  },

  // Hunyuan Models
  {
    id: "hunyuan-1",
    name: "Hunyuan Video",
    category: "budget",
    type: "video",
    endpoint: "fal-ai/hunyuan-video",
    costPerUnit: 0.08,
    unitType: "second",
    description: "Tencent Hunyuan - Open source",
    supportedReferenceModes: ["text-to-video", "image-to-video"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
        ],
        default: "5",
      },
    ],
  },

  // Seedance Models
  {
    id: "seedance-2-fast",
    name: "Seedance 2.0 Fast",
    category: "standard",
    type: "video",
    endpoint: "fal-ai/seedance-video/v2/fast",
    costPerUnit: 0.25,
    unitType: "second",
    description: "Seedance 2.0 - Fast generation",
    supportedReferenceModes: ["text-to-video", "image-to-video"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        default: "5",
      },
    ],
  },

  // Grok Models
  {
    id: "grok-video-1",
    name: "Grok Video",
    category: "premium",
    type: "video",
    endpoint: "fal-ai/grok/video",
    costPerUnit: 0.22,
    unitType: "second",
    description: "xAI Grok Video generation",
    supportedReferenceModes: ["text-to-video", "image-to-video"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        default: "16:9",
      },
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        default: "5",
      },
    ],
  },
];

// Image Models
export const imageModels: ModelConfig[] = [
  // FLUX Models
  {
    id: "flux-pro",
    name: "FLUX.1 Pro",
    category: "premium",
    type: "image",
    endpoint: "fal-ai/flux-pro/v1.1",
    costPerUnit: 0.055,
    unitType: "image",
    description: "FLUX.1 Pro - Best quality",
    supportedReferenceModes: ["text-to-image", "image-to-image", "style-reference"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
          { value: "21:9", label: "21:9" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 3.5,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 28,
      },
      {
        key: "safety_checker",
        label: "Safety Checker",
        type: "toggle",
        default: true,
      },
    ],
  },
  {
    id: "flux-dev",
    name: "FLUX.1 Dev",
    category: "standard",
    type: "image",
    endpoint: "fal-ai/flux/dev",
    costPerUnit: 0.025,
    unitType: "image",
    description: "FLUX.1 Dev - Balanced quality/speed",
    supportedReferenceModes: ["text-to-image", "image-to-image"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 3.5,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 28,
      },
      {
        key: "safety_checker",
        label: "Safety Checker",
        type: "toggle",
        default: true,
      },
    ],
  },
  {
    id: "flux-schnell",
    name: "FLUX.1 Schnell",
    category: "budget",
    type: "image",
    endpoint: "fal-ai/flux/schnell",
    costPerUnit: 0.003,
    unitType: "image",
    description: "FLUX.1 Schnell - Fastest generation",
    supportedReferenceModes: ["text-to-image"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 10,
        step: 0.5,
        default: 3,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 1,
        max: 12,
        step: 1,
        default: 4,
      },
    ],
  },
  {
    id: "flux-realism",
    name: "FLUX.1 Realism",
    category: "premium",
    type: "image",
    endpoint: "fal-ai/flux-realism",
    costPerUnit: 0.04,
    unitType: "image",
    description: "FLUX.1 fine-tuned for photorealism",
    supportedReferenceModes: ["text-to-image", "image-to-image"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 3.5,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 28,
      },
    ],
  },

  // Stable Diffusion Models
  {
    id: "sd-3-5-large",
    name: "Stable Diffusion 3.5 Large",
    category: "standard",
    type: "image",
    endpoint: "fal-ai/stable-diffusion-v35-large",
    costPerUnit: 0.03,
    unitType: "image",
    description: "SD 3.5 Large - Open source quality",
    supportedReferenceModes: ["text-to-image", "image-to-image"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 7.5,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 35,
      },
    ],
  },

  // Nano Banana Models
  {
    id: "nano-banana-2",
    name: "Nano Banana 2.0",
    category: "premium",
    type: "image",
    endpoint: "fal-ai/nano-banana/v2",
    costPerUnit: 0.04,
    unitType: "image",
    description: "Nano Banana - Multiple reference support",
    supportedReferenceModes: ["text-to-image", "image-to-image", "multi-reference"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 3.5,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 28,
      },
      {
        key: "max_refs",
        label: "Max References",
        type: "select",
        options: [
          { value: "4", label: "4 refs" },
          { value: "8", label: "8 refs" },
          { value: "12", label: "12 refs" },
          { value: "14", label: "14 refs" },
        ],
        default: "4",
      },
    ],
  },

  // Grok Models
  {
    id: "grok-image-1",
    name: "Grok Image",
    category: "premium",
    type: "image",
    endpoint: "fal-ai/grok/image",
    costPerUnit: 0.05,
    unitType: "image",
    description: "xAI Grok Image generation",
    supportedReferenceModes: ["text-to-image", "image-to-image"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 7.5,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 35,
      },
    ],
  },

  // Seedream Models
  {
    id: "seedream-4-5",
    name: "Seedream 4.5",
    category: "standard",
    type: "image",
    endpoint: "fal-ai/seedream/v4.5",
    costPerUnit: 0.035,
    unitType: "image",
    description: "ByteDance Seedream - High quality",
    supportedReferenceModes: ["text-to-image", "image-to-image"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 7,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 30,
      },
    ],
  },

  // Recraft Models
  {
    id: "recraft-v3",
    name: "Recraft V3",
    category: "standard",
    type: "image",
    endpoint: "fal-ai/recraft-v3",
    costPerUnit: 0.04,
    unitType: "image",
    description: "Recraft V3 - Vector and raster support",
    supportedReferenceModes: ["text-to-image", "image-to-image", "vector"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 7.5,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 30,
      },
    ],
  },

  // Ideogram Models
  {
    id: "ideogram-v2",
    name: "Ideogram V2",
    category: "premium",
    type: "image",
    endpoint: "fal-ai/ideogram/v2",
    costPerUnit: 0.045,
    unitType: "image",
    description: "Ideogram V2 - Text rendering excellence",
    supportedReferenceModes: ["text-to-image", "image-to-image", "style-reference"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 7.5,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 30,
      },
    ],
  },

  // Playground Models
  {
    id: "playground-v2-5",
    name: "Playground V2.5",
    category: "standard",
    type: "image",
    endpoint: "fal-ai/playground-v25",
    costPerUnit: 0.025,
    unitType: "image",
    description: "Playground V2.5 - Fast and creative",
    supportedReferenceModes: ["text-to-image", "image-to-image"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 3,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 30,
      },
    ],
  },

  // AuraFlow Models
  {
    id: "auraflow",
    name: "AuraFlow",
    category: "budget",
    type: "image",
    endpoint: "fal-ai/aura-flow",
    costPerUnit: 0.015,
    unitType: "image",
    description: "AuraFlow - Open source FLUX alternative",
    supportedReferenceModes: ["text-to-image", "image-to-image"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 7.5,
      },
      {
        key: "num_inference_steps",
        label: "Steps",
        type: "slider",
        min: 20,
        max: 50,
        step: 1,
        default: 28,
      },
    ],
  },

  // Imagen Models
  {
    id: "imagen-3",
    name: "Imagen 3",
    category: "premium",
    type: "image",
    endpoint: "fal-ai/google/imagen-3",
    costPerUnit: 0.05,
    unitType: "image",
    description: "Google Imagen 3 - Photorealistic images",
    supportedReferenceModes: ["text-to-image"],
    settings: [
      {
        key: "aspect_ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
        ],
        default: "1:1",
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 7.5,
      },
    ],
  },
];

// Audio Models
export const audioModels: ModelConfig[] = [
  {
    id: "musicgen",
    name: "MusicGen",
    category: "standard",
    type: "audio",
    endpoint: "fal-ai/musicgen",
    costPerUnit: 0.02,
    unitType: "second",
    description: "Meta MusicGen - Text to music",
    supportedReferenceModes: ["text-to-audio"],
    settings: [
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "10", label: "10s" },
          { value: "15", label: "15s" },
          { value: "30", label: "30s" },
          { value: "60", label: "1m" },
          { value: "120", label: "2m" },
        ],
        default: "30",
      },
      {
        key: "temperature",
        label: "Creativity",
        type: "slider",
        min: 0.1,
        max: 1.5,
        step: 0.1,
        default: 1,
      },
    ],
  },
  {
    id: "audiocraft",
    name: "AudioCraft",
    category: "standard",
    type: "audio",
    endpoint: "fal-ai/audiocraft",
    costPerUnit: 0.025,
    unitType: "second",
    description: "AudioCraft - Music and sound",
    supportedReferenceModes: ["text-to-audio"],
    settings: [
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "10", label: "10s" },
          { value: "15", label: "15s" },
          { value: "30", label: "30s" },
          { value: "60", label: "1m" },
        ],
        default: "30",
      },
    ],
  },
  {
    id: "stable-audio",
    name: "Stable Audio",
    category: "premium",
    type: "audio",
    endpoint: "fal-ai/stable-audio",
    costPerUnit: 0.04,
    unitType: "second",
    description: "Stable Audio - Professional quality",
    supportedReferenceModes: ["text-to-audio"],
    settings: [
      {
        key: "duration",
        label: "Duration",
        type: "select",
        options: [
          { value: "10", label: "10s" },
          { value: "30", label: "30s" },
          { value: "60", label: "1m" },
          { value: "120", label: "2m" },
          { value: "180", label: "3m" },
        ],
        default: "30",
      },
      {
        key: "guidance_scale",
        label: "Guidance",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        default: 7,
      },
    ],
  },
];

// Helper functions
export const getModelById = (id: string): ModelConfig | undefined => {
  const allModels = [...videoModels, ...imageModels, ...audioModels];
  return allModels.find(m => m.id === id);
};

export const getModelsByType = (type: "video" | "image" | "audio"): ModelConfig[] => {
  switch (type) {
    case "video":
      return videoModels;
    case "image":
      return imageModels;
    case "audio":
      return audioModels;
    default:
      return [];
  }
};

export const getDefaultModelForType = (type: "video" | "image" | "audio"): string => {
  switch (type) {
    case "video":
      return "seedance-2-fast";
    case "image":
      return "flux-dev";
    case "audio":
      return "musicgen";
    default:
      return "";
  }
};

export const calculateCreditCost = (
  model: ModelConfig,
  settings: Record<string, any>,
  generationCount: number = 1
): number => {
  let cost = model.costPerUnit;

  if (model.unitType === "second") {
    const duration = parseInt(settings.duration || "5", 10);
    cost *= duration;
  }

  if (model.unitType === "image") {
    // Image cost is per image
    cost = model.costPerUnit;
  }

  // Apply generation count
  cost *= generationCount;

  // Convert to credits (multiply by 100 to get integer credits)
  return Math.round(cost * 100);
};

export const getAspectRatioDimensions = (ratio: string): { width: number; height: number } => {
  const ratios: Record<string, { width: number; height: number }> = {
    "16:9": { width: 1024, height: 576 },
    "9:16": { width: 576, height: 1024 },
    "1:1": { width: 1024, height: 1024 },
    "4:3": { width: 1024, height: 768 },
    "3:4": { width: 768, height: 1024 },
    "21:9": { width: 1024, height: 439 },
  };
  return ratios[ratio] || { width: 1024, height: 1024 };
};