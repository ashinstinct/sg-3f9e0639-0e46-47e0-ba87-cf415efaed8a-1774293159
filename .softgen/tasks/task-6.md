---
title: Remove Screen Recorder & Video Editor Pages
status: todo
priority: low
type: chore
tags: [cleanup]
created_by: agent
created_at: 2026-04-16T18:04:53Z
position: 6
---

## Notes
Remove screen recorder and video editor pages as requested.

**Files to Remove:**
- src/pages/record-screen.tsx
- src/pages/video-editor.tsx

**Also Update:**
- Navigation menu (remove links)
- Tools grid (remove cards)
- Any other references

## Checklist
- [ ] Delete src/pages/record-screen.tsx
- [ ] Delete src/pages/video-editor.tsx
- [ ] Remove from Navigation.tsx menu
- [ ] Remove from tools grid on homepage
- [ ] Search codebase for other references
- [ ] Run check_for_errors to ensure no broken imports
