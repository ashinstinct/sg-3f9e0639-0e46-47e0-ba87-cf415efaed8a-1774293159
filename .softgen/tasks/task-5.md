---
title: Rename Audio to Voice & Add Dual TTS Providers
status: todo
priority: high
type: feature
tags: [voice, tts, eleven-labs, fish-audio]
created_by: agent
created_at: 2026-04-16T18:04:53Z
position: 5
---

## Notes
Rename the Audio page to "Voice" and integrate both Eleven Labs and Fish Audio for TTS and Voice Cloning.

**Current:** /audio page with basic TTS
**New:** /voice page with provider choice

**Providers:**
1. **Eleven Labs** - High quality, well-known
2. **Fish Audio** - Better cloning, more realistic

**Features:**
- Provider toggle/selector
- Voice cloning for both providers
- TTS for both providers
- Side-by-side comparison option

## Checklist
- [ ] Rename src/pages/audio.tsx to src/pages/voice.tsx
- [ ] Create API endpoint for Eleven Labs TTS/cloning
- [ ] Integrate Fish Audio API for TTS/cloning (already have /clone endpoint)
- [ ] Add provider selector UI (toggle or dropdown)
- [ ] Build voice cloning upload flow for both providers
- [ ] Add voice library/samples for each provider
- [ ] Update navigation from "Audio" to "Voice"
- [ ] Test both providers end-to-end
