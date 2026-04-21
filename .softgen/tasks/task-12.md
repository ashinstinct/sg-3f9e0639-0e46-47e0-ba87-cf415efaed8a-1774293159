---
title: Connect all video generation tools to fal.ai API
status: todo
priority: high
type: feature
tags: [fal-ai, video, api]
created_by: agent
created_at: 2026-04-21
position: 3
---

## Notes
All video generation model pages need to be connected to the fal.ai API via the existing /api/fal/video-generate endpoint. Each model page should send the correct model ID and receive generated videos.

## Checklist
- [ ] Verify /api/fal/video-generate.ts supports all model IDs
- [ ] Connect video/generate.tsx to API
- [ ] Connect video/kling.tsx to API
- [ ] Connect video/luma.tsx to API
- [ ] Connect video/runway.tsx to API
- [ ] Connect video/minimax.tsx to API
- [ ] Connect video/hunyuan.tsx to API
- [ ] Connect video/grok.tsx to API
- [ ] Connect video/seedance.tsx to API

## Acceptance
- User can type a prompt and receive a generated video on each model page
- Loading states and error handling work properly