---
title: Dashboard billing controls
status: in_progress
priority: high
type: feature
tags:
  - dashboard
  - billing
  - subscription
created_by: agent
created_at: 2026-04-26
position: 17
---

## Notes
Update the dashboard billing section. Remove the recent transactions area from the credit dashboard. Add a subscription section that shows the current subscription state, the renewal or expiry date, and actions to cancel the subscription or top up with extra credits. Keep the existing visual design language and only change the dashboard billing content needed for this request.

## Checklist
- [ ] Review current dashboard billing layout and related credit/subscription components
- [ ] Remove the recent transactions section from the dashboard
- [ ] Add a subscription status section with running-out or renewal date display
- [ ] Add clear actions for canceling subscription and topping up extra credits
- [ ] Reuse or connect existing billing modals where possible
- [ ] Validate the updated dashboard UI for build/type safety

## Acceptance
The dashboard no longer shows recent transactions.
The dashboard shows subscription status with a visible date for when the subscription ends or renews.
The dashboard includes actions to cancel the subscription and to buy extra credits.