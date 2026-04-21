---
title: Connect all image generation tools to fal.ai API
status: todo
priority: high
type: feature
tags: [fal-ai, images, api]
created_by: agent
created_at: 2026-04-21
position: 2
---

## Notes
All image generation model pages need to be connected to the fal.ai API via the existing /api/fal/image-generate endpoint. Each model page should send the correct model ID and receive generated images.

## Checklist
- [ ] Verify /api/fal/image-generate.ts supports all model IDs
- [ ] Connect images/generate.tsx to API
- [ ] Connect flux.tsx to API
- [ ] Connect nano-banana.tsx to API
- [ ] Connect stable-diffusion.tsx to API
- [ ] Connect grok.tsx to API
- [ ] Connect recraft.tsx to API
- [ ] Connect ideogram.tsx to API
- [ ] Connect playground.tsx to API
- [ ] Connect auraflow.tsx to API

## Acceptance
- User can type a prompt and receive a generated image on each model page
- Loading states and error handling work properly