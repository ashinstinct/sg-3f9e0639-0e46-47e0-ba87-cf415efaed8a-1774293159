---
title: Create Music Generation Page with SUNO API
status: done
priority: high
type: feature
tags: [music, suno, fal.ai]
created_by: agent
created_at: 2026-04-16T18:04:53Z
position: 3
---

## Notes
Build a dedicated Music page using fal.ai's SUNO API integration. Should work exactly like the SUNO website.

**API:** fal.ai SUNO endpoint
**Features:** All SUNO model settings (style, tempo, instruments, lyrics, etc.)
**Page:** Currently linked from audio page - create new /music route

**Implementation Steps:**
1. Research fal.ai SUNO API documentation
2. Identify all available parameters and settings
3. Build UI matching SUNO website functionality
4. Integrate with credits system (deduct on generation)

## Checklist
- [ ] Create src/pages/music.tsx
- [ ] Create src/pages/api/fal/music-generate.ts API endpoint
- [ ] Research fal.ai SUNO API docs for all parameters
- [ ] Build input form with all SUNO settings (style, tempo, instruments, lyrics, duration)
- [ ] Add music preview player
- [ ] Integrate credits system (check balance, deduct on generation)
- [ ] Add download functionality
- [ ] Save generated music to library
- [ ] Update navigation to link to /music
