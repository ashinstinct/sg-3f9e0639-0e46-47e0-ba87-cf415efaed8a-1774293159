---
title: Simplify Credit Dashboard for Mobile
status: todo
priority: high
type: feature
tags: [dashboard, credits, mobile]
created_by: agent
created_at: 2026-04-16T18:04:53Z
position: 2
---

## Notes
Streamline the dashboard to fit on one mobile screen without scrolling.

**Remove:**
- Total Spent section
- Credit Usage charts
- Usage by Tool Type section

**Keep:**
- Current balance (prominently displayed)
- Recent transactions list (compact table)

**Add:**
- Credits Top-Up button (prominent CTA)

**Design:**
- Compact layout
- Mobile-first approach
- No vertical scrolling needed on standard mobile screen

## Checklist
- [ ] Remove Total Spent, Credit Usage, Usage by Tool Type sections from dashboard.tsx
- [ ] Add prominent Credits Top-Up button at top
- [ ] Redesign layout to be compact (single mobile screen)
- [ ] Keep current balance display (large, clear)
- [ ] Keep recent transactions (compact table)
- [ ] Test on mobile viewport (375px width)
