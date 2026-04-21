---
title: Mobile responsiveness for all pages
status: in_progress
priority: urgent
type: chore
tags: [mobile, responsive, ui]
created_by: agent
created_at: 2026-04-21
position: 1
---

## Notes
Every page in the app needs to work properly on mobile phones. Check layout, text sizing, button sizing, overflow, and touch targets across all tool pages.

## Checklist
- [ ] Homepage (index.tsx) - mobile layout
- [ ] Navigation - mobile menu working
- [ ] Image generation pages (images/generate.tsx, flux.tsx, etc.)
- [ ] Video generation pages (video/generate.tsx, kling.tsx, etc.)
- [ ] Audio tools (convert, edit, enhance, clone, stems, record-voice)
- [ ] Free tools (extract, download, split, transcriber)
- [ ] Dashboard, library, gallery pages
- [ ] Auth pages (login, signup, etc.)
- [ ] Audio editor page
- [ ] Avatar, music, agents pages

## Acceptance
- All pages render without horizontal scroll on 375px width
- All buttons and inputs are touch-friendly (min 44px targets)
- Text is readable without zooming