---
title: Fix UI Title Issues on Edit & Library Pages
status: todo
priority: medium
type: bug
tags: [ui, title]
created_by: agent
created_at: 2026-04-16T18:04:53Z
position: 7
---

## Notes
Fix missing/covered page titles on AI Image Editing and Library pages.

**Issues:**
1. AI Image Editing page (/edit/inpaint.tsx) - title covered by website title
2. Library page (/library.tsx) - website title bar missing

**Fix:** Adjust padding/margins to prevent title overlap

## Checklist
- [ ] Open src/pages/edit/inpaint.tsx
- [ ] Fix title spacing (add top padding/margin to prevent overlap)
- [ ] Open src/pages/library.tsx  
- [ ] Ensure Navigation component is properly integrated
- [ ] Test both pages on desktop and mobile
- [ ] Verify titles are visible and not overlapped
