---
title: Audio Recorder Enhancements
status: todo
priority: high
type: feature
tags: [audio, recorder]
created_by: agent
created_at: 2026-04-16T18:04:53Z
position: 1
---

## Notes
Enhance the Audio Recorder page (record-voice.tsx) with improved functionality and integrations.

**Requirements:**
- Default recording format: MP3 (not WebM)
- Allow .webm file conversion to MP3
- Display audio waveform visualization after recording
- Add Share button (copy link, social sharing)
- Add "Edit Audio" button → links to audio editor page
- Add "Enhance Audio" button → links to audio enhancer page

**User Flow:**
Record → See waveform → Share/Edit/Enhance options

## Checklist
- [ ] Change default recording format to MP3
- [ ] Add WebM to MP3 conversion function
- [ ] Integrate audio waveform visualization library (wavesurfer.js or canvas-based)
- [ ] Create Share button with copy link functionality
- [ ] Add "Edit Audio" button linking to /edit page
- [ ] Add "Enhance Audio" button linking to /enhance page
- [ ] Update UI layout for new buttons
- [ ] Test recording, playback, and conversions
