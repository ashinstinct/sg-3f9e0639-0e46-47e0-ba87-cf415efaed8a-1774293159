---
title: AI Chat Agent page with multi-model support
status: in_progress
priority: high
type: feature
tags: [chat, ai, models]
created_by: agent
created_at: 2026-04-21
position: 15
---

## Notes
Inspired by use.ai chat interface: Create a chat page at /chat with a model dropdown at top (Claude Sonnet 4.6, GPT-5.4, Gemini 3.1 Pro, Qwen 3 Max, Llama 3.3, etc.). Chat interface with message input, send button, mic icon, and quick action pills (Help me write, Learn about, Analyze). Center text says "How can I help you?" when empty.

## Checklist
- [x] Create chat page at /chat with use.ai-style layout
- [x] Add model dropdown at top (ChatGPT, Claude, Gemini, Qwen, Llama, MiniMax, etc.)
- [x] Chat input at bottom with + button, mic, send
- [x] Quick action pills: Help me write, Learn about, Analyze, Generate image, Create video
- [ ] Connect to actual AI APIs (placeholder responses for now)
- [ ] Add image/video generation capabilities within chat

## Acceptance
- User can select different AI models from dropdown
- Messages send and receive responses
- Chat history displays properly on mobile