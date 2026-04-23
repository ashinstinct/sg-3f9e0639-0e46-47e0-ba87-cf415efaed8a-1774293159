---
title: AI Chat Agent Hub
status: in_progress
priority: high
type: feature
tags: [chat, ai-agents, core-feature]
created_by: agent
created_at: 2026-04-23
position: 1
---

## Notes
Create a comprehensive AI Chat Agent Hub page at `/chat` that allows users to select and chat with different AI models (ChatGPT, Claude, Gemini, Grok, MiniMax, etc.). Support free and pro models with proper credit system integration.

## Checklist
- [ ] Create chat.tsx page with model selector
- [ ] Design AI agent cards (ChatGPT, Claude, Gemini, Grok, MiniMax, etc.)
- [ ] Build chat interface with message display and input
- [ ] Add message history display (chronological)
- [ ] Integrate with Supabase to save chat history
- [ ] Add credit deduction logic for paid models
- [ ] Support free tier models (Gemini Free, Grok, etc.)
- [ ] Test with mock messages and model selection

## Acceptance
- User can select from multiple AI agent models
- Chat interface displays messages with model responses
- Free and paid models are clearly labeled
- Chat history is saved to database