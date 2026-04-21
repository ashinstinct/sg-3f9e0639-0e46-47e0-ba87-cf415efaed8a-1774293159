---
title: Top-bar model dropdown for image and video generation pages
status: todo
priority: high
type: feature
tags: [ui, images, video, dropdown]
created_by: agent
created_at: 2026-04-21
position: 2
---

## Notes
Inspired by use.ai: On image and video generation pages, replace the settings panel model selector with a centered top-bar dropdown. Shows current model name with chevron, clicking opens dark dropdown with model logo, name, and subtitle description. Dropdown has scrollable list with dark background.

## Checklist
- [ ] Create ModelDropdown component with logo, name, description per model
- [ ] Integrate into images/generate.tsx replacing the select element
- [ ] Integrate into video/generate.tsx replacing any model selector
- [ ] Dark background dropdown with smooth open/close animation
- [ ] Mobile-friendly touch targets

## Acceptance
- Model name appears centered in top bar with up/down chevron
- Dropdown shows all models with logos and descriptions
- Selected model updates generation endpoint